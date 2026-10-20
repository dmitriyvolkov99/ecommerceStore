using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public sealed record OrderDto
{
    [Required] public required string BasketId { get; init; }
    public int DeliveryMethodId { get; init; }
    [Required] public required AddressDto ShipToAddress { get; init; }
}