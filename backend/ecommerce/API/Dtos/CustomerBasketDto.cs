using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public sealed record CustomerBasketDto
{
    [Required] public required string Id { get; init; }
    public List<BasketItemDto> Items { get; init; } = [];
    public int? DeliveryMethodId { get; init; }
    public string? ClientSecret { get; init; }
    public string? PaymentIntentId { get; init; }
    public decimal ShippingPrice { get; init; }
}