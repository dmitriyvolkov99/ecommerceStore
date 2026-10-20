namespace API.Dtos;

public sealed record UserDto
{
    public required string Email { get; init; }
    public required string DisplayName { get; init; }
    public required string Token { get; init; }
}