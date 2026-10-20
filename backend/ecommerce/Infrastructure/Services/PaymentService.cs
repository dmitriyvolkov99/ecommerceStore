using System;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stripe;
using Product = Core.Entities.Product;

namespace Infrastructure.Services;

public class PaymentService(
    IBasketRepository basketRepository,
    IUnitOfWork unitOfWork,
    IConfiguration config,
    ILogger<PaymentService> logger) : IPaymentService
{
    private PaymentIntentService CreateIntentService() =>
        new(new StripeClient(config["StripeSettings:SecretKey"]));

    public async Task<CustomerBasket> CreateOrUpdatePaymentIntent(string basketId)
    {
        var basket = await basketRepository.GetBasketAsync(basketId);
        if (basket is null || basket.Items.Count == 0) return null;

        var shippingPrice = 0m;
        if (basket.DeliveryMethodId.HasValue)
        {
            var deliveryMethod = await unitOfWork.Repository<DeliveryMethod>()
                .GetByIdAsync(basket.DeliveryMethodId.Value);
            if (deliveryMethod is null) return null;

            shippingPrice = deliveryMethod.Price;
        }

        // Цены только из базы, а не из корзины клиента.
        var ids = basket.Items.Select(i => i.Id).Distinct().ToList();
        var products = await unitOfWork.Repository<Product>().ListAsync(new ProductsByIdsSpecification(ids));
        var prices = products.ToDictionary(p => p.Id, p => p.Price);
        if (ids.Any(id => !prices.ContainsKey(id))) return null;

        foreach (var item in basket.Items)
            item.Price = prices[item.Id];

        basket.ShippingPrice = shippingPrice;

        // Сумма в центах, округляем корректно (в том числе доставку).
        var amount = (long)Math.Round(
            (basket.Items.Sum(i => i.Price * i.Quantity) + shippingPrice) * 100m,
            MidpointRounding.AwayFromZero);

        var service = CreateIntentService();
        try
        {
            if (string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var intent = await service.CreateAsync(new PaymentIntentCreateOptions
                {
                    Amount = amount,
                    Currency = "usd",
                    PaymentMethodTypes = ["card"],
                });
                basket.PaymentIntentId = intent.Id;
                basket.ClientSecret = intent.ClientSecret;
            }
            else
            {
                await service.UpdateAsync(basket.PaymentIntentId, new PaymentIntentUpdateOptions { Amount = amount });
            }
        }
        catch (StripeException ex)
        {
            logger.LogError(ex, "Ошибка Stripe для корзины {BasketId}", basketId);
            return null;
        }

        await basketRepository.UpdateBasketAsync(basket);
        return basket;
    }

    public async Task<Order> UpdateOrderPaymentSucceeded(string paymentIntentId)
    {
        var order = await unitOfWork.Repository<Order>()
            .GetEntityWithSpec(new OrderByPaymentIntentIdSpecification(paymentIntentId));
        if (order is null) return null;

        order.Status = OrderStatus.PaymentReceived;
        await unitOfWork.Complete();
        return order;
    }

    public async Task<Order> UpdateOrderPaymentFailed(string paymentIntentId)
    {
        var order = await unitOfWork.Repository<Order>()
            .GetEntityWithSpec(new OrderByPaymentIntentIdSpecification(paymentIntentId));
        if (order is null) return null;

        // Оплаченный заказ не переводим обратно в «ошибку».
        if (order.Status == OrderStatus.PaymentReceived) return order;

        order.Status = OrderStatus.PaymentFailed;
        await unitOfWork.Complete();
        return order;
    }
}