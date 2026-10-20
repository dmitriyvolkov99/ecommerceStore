using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Stripe;

namespace API.Features.Payments;

public static class PaymentsEndpoints
{
    public static IEndpointRouteBuilder MapPayments(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/payments").WithTags("Payments");

        group.MapPost("/{basketId}", CreateOrUpdatePaymentIntent).RequireAuthorization();
        group.MapPost("/webhook", StripeWebhook); // вызывается Stripe, без авторизации

        return app;
    }

    private static async Task<Results<Ok<CustomerBasket>, ProblemHttpResult>> CreateOrUpdatePaymentIntent(
        string basketId,
        IPaymentService paymentService)
    {
        var basket = await paymentService.CreateOrUpdatePaymentIntent(basketId);

        return basket is null
            ? TypedResults.Problem(
                detail: "Не удалось подготовить оплату. Проверьте корзину.",
                statusCode: StatusCodes.Status400BadRequest)
            : TypedResults.Ok(basket);
    }

    private static async Task<IResult> StripeWebhook(
        HttpRequest request,
        IPaymentService paymentService,
        IConfiguration config,
        ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("API.Features.Payments");
        var whSecret = config["StripeSettings:WhSecret"] ?? string.Empty;

        var json = await new StreamReader(request.Body).ReadToEndAsync();

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, request.Headers["Stripe-Signature"], whSecret);
        }
        catch (StripeException ex)
        {
            logger.LogWarning(ex, "Webhook Stripe с неверной подписью");
            return TypedResults.BadRequest();
        }

        if (stripeEvent.Data.Object is not PaymentIntent intent) return TypedResults.Ok();

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
                return TypedResults.Ok();
        }

        if (order is null)
            logger.LogWarning("Заказ для платёжного намерения {PaymentIntentId} не найден", intent.Id);
        else
            logger.LogInformation("Заказ {OrderId}: статус {Status}", order.Id, order.Status);

        return TypedResults.Ok();
    }
}