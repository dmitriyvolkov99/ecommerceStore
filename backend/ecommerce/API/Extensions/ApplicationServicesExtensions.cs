using API.Helpers;
using Core.Interfaces;
using Infrastructure.Data;
using Infrastructure.Identity;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace API.Extensions;

public static class ApplicationServicesExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<StoreContext>(options =>
            options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        services.AddDbContext<AppIdentityDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("IdentityConnection")));

        services.AddSingleton<IConnectionMultiplexer>(_ =>
        {
            var connectionString = config.GetConnectionString("Redis")
                ?? throw new InvalidOperationException("Не задана строка подключения Redis");

            return ConnectionMultiplexer.Connect(ConfigurationOptions.Parse(connectionString, true));
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IBasketRepository, BasketRepository>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddSingleton<AppMapper>();

        services.AddOutputCache(options =>
        {
            options.AddPolicy("Catalog", policy => policy
                .Expire(TimeSpan.FromMinutes(10))
                .Tag("catalog"));
        });

        return services;
    }
}