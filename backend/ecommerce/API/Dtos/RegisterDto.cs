using System.ComponentModel.DataAnnotations;

namespace API.Dtos;

public sealed record RegisterDto
{
    [Required] public required string DisplayName { get; init; }
    [Required, EmailAddress] public required string Email { get; init; }
    [Required] public required string Password { get; init; }
}