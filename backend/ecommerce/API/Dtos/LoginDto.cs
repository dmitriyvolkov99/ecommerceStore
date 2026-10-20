using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public sealed record LoginDto
{
    [Required] public required string Email { get; init; }
    [Required] public required string Password { get; init; }
}