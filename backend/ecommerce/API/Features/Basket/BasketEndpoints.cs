using API.Dtos;
using API.Helpers;
using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace API.Features.Basket;

public static class BasketEndpoints
{
    public static IEndpointRouteBuilder MapBasket(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/basket").WithTags("Basket");

        group.MapGet("/", GetBasket);
        group.MapPost("/", UpdateBasket);
        group.MapDelete("/", DeleteBasket);

        return app;
    }

    private static async Task<Ok<CustomerBasket>> GetBasket(string id, IBasketRepository basketRepository)
    {
        var basket = await basketRepository.GetBasketAsync(id);
        return TypedResults.Ok(basket ?? new CustomerBasket(id));
    }

    private static async Task<Results<Ok<CustomerBasket>, ProblemHttpResult>> UpdateBasket(
        CustomerBasketDto basket,
        IBasketRepository basketRepository,
        AppMapper mapper)
    {
        var customerBasket = mapper.ToEntity(basket);

        // Данные оплаты хранятся только на сервере, клиент их не подменяет.
        var existing = await basketRepository.GetBasketAsync(basket.Id);
        customerBasket.PaymentIntentId = existing?.PaymentIntentId;
        customerBasket.ClientSecret = existing?.ClientSecret;

        var updated = await basketRepository.UpdateBasketAsync(customerBasket);

        return updated is null
            ? TypedResults.Problem(
                detail: "Не удалось сохранить корзину",
                statusCode: StatusCodes.Status500InternalServerError)
            : TypedResults.Ok(updated);
    }

    private static async Task<NoContent> DeleteBasket(string id, IBasketRepository basketRepository)
    {
        await basketRepository.DeleteBasketAsync(id);
        return TypedResults.NoContent();
    }
}