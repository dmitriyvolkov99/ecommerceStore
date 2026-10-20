using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public sealed record AddressDto
{
    [Required] public required string FirstName { get; init; }
    [Required] public required string LastName { get; init; }
    [Required] public required string Street { get; init; }
    [Required] public required string City { get; init; }
    [Required] public required string State { get; init; }
    [Required] public required string ZipCode { get; init; }
}