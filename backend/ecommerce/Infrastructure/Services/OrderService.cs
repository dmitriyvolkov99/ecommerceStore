using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;

namespace Infrastructure.Services;

public class OrderService(
    IBasketRepository basketRepo,
    IUnitOfWork unitOfWork,
    IPaymentService paymentService) : IOrderService
{
    public async Task<Order> CreateOrderAsync(
        string buyerEmail, int deliveryMethodId, string basketId, Address shippingAddress)
    {
        var basket = await basketRepo.GetBasketAsync(basketId);

        if (basket is null || basket.Items.Count == 0 || string.IsNullOrEmpty(basket.PaymentIntentId))
            return null;

        var deliveryMethod = await unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(deliveryMethodId);
        if (deliveryMethod is null) return null;

        var quantities = basket.Items
            .GroupBy(i => i.Id)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

        var products = await unitOfWork.Repository<Product>()
            .ListAsync(new ProductsByIdsSpecification(quantities.Keys.ToList()));
        if (products.Count != quantities.Count) return null;

        var items = products
            .Select(p => new OrderItem(
                new ProductItemOrdered(p.Id, p.Name, p.PictureUrl), p.Price, quantities[p.Id]))
            .ToList();
        var subtotal = items.Sum(i => i.Price * i.Quantity);

        var existingOrder = await unitOfWork.Repository<Order>()
            .GetEntityWithSpec(new OrderByPaymentIntentIdSpecification(basket.PaymentIntentId));
        if (existingOrder is not null)
        {
            if (existingOrder.BuyerEmail != buyerEmail || existingOrder.Status == OrderStatus.PaymentReceived)
                return null;

            unitOfWork.Repository<Order>().Delete(existingOrder);
        }

        if (basket.DeliveryMethodId != deliveryMethodId)
        {
            basket.DeliveryMethodId = deliveryMethodId;
            await basketRepo.UpdateBasketAsync(basket);
        }

        var updatedBasket = await paymentService.CreateOrUpdatePaymentIntent(basketId);
        if (updatedBasket is null) return null;

        var order = new Order(items, buyerEmail, shippingAddress, deliveryMethod, subtotal, basket.PaymentIntentId);
        unitOfWork.Repository<Order>().Add(order);

        return await unitOfWork.Complete() > 0 ? order : null;
    }

    public async Task<IReadOnlyList<DeliveryMethod>> GetDeliveryMethodsAsync()
    {
        return await unitOfWork.Repository<DeliveryMethod>().ListAllAsync();
    }

    public async Task<Order> GetOrderByIdAsync(int id, string buyerEmail)
    {
        var spec = new OrdersWithItemsAndOrderingSpecification(id, buyerEmail);
        return await unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
    }

    public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail)
    {
        var spec = new OrdersWithItemsAndOrderingSpecification(buyerEmail);
        return await unitOfWork.Repository<Order>().ListAsync(spec);
    }
}