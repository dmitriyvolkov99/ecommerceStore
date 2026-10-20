using System.Security.Claims;
using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class UserManagerExtensions
{
    public static async Task<AppUser?> FindByClaimsPrincipalAsync(
        this UserManager<AppUser> userManager, ClaimsPrincipal principal)
    {
        var id = principal.GetUserId();
        return id is null ? null : await userManager.FindByIdAsync(id);
    }

    public static async Task<AppUser?> FindByClaimsPrincipalWithAddressAsync(
        this UserManager<AppUser> userManager, ClaimsPrincipal principal)
    {
        var id = principal.GetUserId();

        return id is null
            ? null
            : await userManager.Users.Include(x => x.Address).FirstOrDefaultAsync(x => x.Id == id);
    }
}