using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public sealed record BasketItemDto
{
    public int Id { get; init; }

    [Required] public required string ProductName { get; init; }

    [Range(0.10, double.MaxValue, ErrorMessage = "Цена должна быть больше нуля")]
    public decimal Price { get; init; }

    [Range(1, int.MaxValue, ErrorMessage = "Количество должно быть не меньше 1")]
    public int Quantity { get; init; }

    [Required] public required string PictureUrl { get; init; }
    [Required] public required string Brand { get; init; }
    [Required] public required string Type { get; init; }
}