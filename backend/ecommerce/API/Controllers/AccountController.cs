using API.Dtos;
using API.Extensions;
using API.Helpers;
using Core.Entities.Identity;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

public class AccountController(
    UserManager<AppUser> userManager,
    SignInManager<AppUser> signInManager,
    ITokenService tokenService,
    AppMapper mapper) : BaseApiController
{
    [Authorize]
    [HttpGet]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await userManager.FindByEmailFromClaimsPrinciple(User);
        if (user is null) return Unauthorized();

        return ToUserDto(user);
    }

    [EnableRateLimiting("auth")]
    [HttpGet("emailexists")]
    public async Task<ActionResult<bool>> CheckEmailExistsAsync([FromQuery] string email)
    {
        return await userManager.FindByEmailAsync(email) is not null;
    }

    [Authorize]
    [HttpGet("address")]
    public async Task<ActionResult<AddressDto>> GetUserAddress()
    {
        var user = await userManager.FindUserByClaimsPrincipleWithAddressAsync(User);
        if (user is null) return Unauthorized();
        if (user.Address is null) return NoContent();

        return mapper.ToDto(user.Address);
    }

    [Authorize]
    [HttpPut("address")]
    public async Task<ActionResult<AddressDto>> UpdateUserAddress(AddressDto address)
    {
        var user = await userManager.FindUserByClaimsPrincipleWithAddressAsync(User);
        if (user is null) return Unauthorized();

        user.Address = mapper.ToIdentityAddress(address);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return Problem(detail: "Не удалось сохранить адрес", statusCode: StatusCodes.Status400BadRequest);

        return Ok(mapper.ToDto(user.Address));
    }

    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);
        if (user is null) return Unauthorized();

        var result = await signInManager.CheckPasswordSignInAsync(user, loginDto.Password, lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            return Problem(
                detail: "Слишком много неудачных попыток входа. Повторите позже.",
                statusCode: StatusCodes.Status429TooManyRequests);
        }

        if (!result.Succeeded) return Unauthorized();

        return ToUserDto(user);
    }

    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Email
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors.DistinctBy(e => e.Description))
                ModelState.AddModelError(error.Code, error.Description);

            return ValidationProblem(ModelState);
        }

        return ToUserDto(user);
    }

    private UserDto ToUserDto(AppUser user) => new()
    {
        DisplayName = user.DisplayName,
        Token = tokenService.CreateToken(user),
        Email = user.Email!
    };
}