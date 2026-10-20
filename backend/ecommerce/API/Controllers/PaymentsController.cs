using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace API.Controllers;

public class PaymentsController(
    IPaymentService paymentService,
    ILogger<PaymentsController> logger,
    IConfiguration config) : BaseApiController
{
    private readonly string _whSecret = config["StripeSettings:WhSecret"] ?? string.Empty;

    [Authorize]
    [HttpPost("{basketId}")]
    public async Task<ActionResult<CustomerBasket>> CreateOrUpdatePaymentIntent(string basketId)
    {
        var basket = await paymentService.CreateOrUpdatePaymentIntent(basketId);

        if (basket is null)
        {
            return Problem(
                detail: "Не удалось подготовить оплату. Проверьте корзину.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        return basket;
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(Request.Body).ReadToEndAsync();

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _whSecret);
        }
        catch (StripeException ex)
        {
            logger.LogWarning(ex, "Webhook Stripe с неверной подписью");
            return BadRequest();
        }

        if (stripeEvent.Data.Object is not PaymentIntent intent) return Ok();

        Order? order;
        switch (stripeEvent.Type)
        {
            case "payment_intent.succeeded":
                logger.LogInformation("Платёж прошёл: {PaymentIntentId}", intent.Id);
                order = await paymentService.UpdateOrderPaymentSucceeded(intent.Id);
                break;
            case "payment_intent.payment_failed":
                logger.LogInformation("Платёж не прошёл: {PaymentIntentId}", intent.Id);
                order = await paymentService.UpdateOrderPaymentFailed(intent.Id);
                break;
            default:
                return Ok();
        }

        if (order is null)
            logger.LogWarning("Заказ для платёжного намерения {PaymentIntentId} не найден", intent.Id);
        else
            logger.LogInformation("Заказ {OrderId}: статус {Status}", order.Id, order.Status);

        return Ok();
    }
}