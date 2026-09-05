using System.Threading.Tasks;
using Core.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using System.Linq;

namespace Infrastructure.Identity
{
    public class AppIdentityDbContextSeed
    {
        public static async Task SeedUsersAsync(UserManager<AppUser> userManager)
        {
            if(!userManager.Users.Any())
            {
                Console.WriteLine("AppIdentityDbContextSeed-----------------------------------");
                var user = new AppUser
                {
                    DisplayName = "Dima",
                    Email = "dima@gmail.com",
                    UserName = "dima",
                    Address = new Address
                    {
                        FirstName = "Dima",
                        LastName = "Dimka",
                        Street = "10 the street",
                        City = "New York",
                        State = "NY",
                        ZipCode = "90210"
                    }
                };

                await userManager.CreateAsync(user, "Pa$$w0rd");
            }
        }
    }
}