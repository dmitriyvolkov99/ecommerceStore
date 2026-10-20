using System.Threading.RateLimiting;

namespace API.Extensions;

public static class WebApiExtensions
{
    public static IServiceCollection AddWebApi(this IServiceCollection services, IHostEnvironment environment)
    {
        services.AddControllers();
        services.AddValidation();
        services.AddOpenApi();

        // Единый формат ошибок: ProblemDetails.
        services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                var problem = context.ProblemDetails;

                problem.Title = problem.Status switch
                {
                    400 => "Некорректный запрос",
                    401 => "Требуется вход в систему",
                    403 => "Доступ запрещён",
                    404 => "Не найдено",
                    429 => "Слишком много запросов",
                    500 => "Внутренняя ошибка сервера",
                    _ => problem.Title
                };

                problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

                // Подробности исключения показываем только в разработке.
                if (context.Exception is not null && environment.IsDevelopment())
                    problem.Detail = context.Exception.ToString();
            };
        });

        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
                policy.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:4200"));
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy("auth", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 20,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });

        return services;
    }
}