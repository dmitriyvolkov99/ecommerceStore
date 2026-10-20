using Core.Entities.OrderAggregate;

namespace API.Dtos;

public sealed record OrderToReturnDto
{
    public int Id { get; init; }
    public string BuyerEmail { get; init; } = string.Empty;
    public DateTimeOffset OrderDate { get; init; }
    public Address ShipToAddress { get; init; } = null!;
    public string DeliveryMethod { get; init; } = string.Empty;
    public decimal ShippingPrice { get; init; }
    public IReadOnlyList<OrderItemDto> OrderItems { get; init; } = [];
    public decimal Subtotal { get; init; }
    public decimal Total { get; init; }
    public string Status { get; init; } = string.Empty;
}