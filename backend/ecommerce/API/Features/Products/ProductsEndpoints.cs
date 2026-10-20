using API.Dtos;
using API.Helpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Http.HttpResults;

namespace API.Features.Products;

public static class ProductsEndpoints
{
    public static IEndpointRouteBuilder MapProducts(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products")
            .WithTags("Products")
            .CacheOutput("Catalog");

        group.MapGet("/", GetProducts);
        group.MapGet("/{id:int}", GetProduct);
        group.MapGet("/brands", GetBrands);
        group.MapGet("/types", GetTypes);

        return app;
    }

    private static async Task<Ok<Pagination<ProductToReturnDto>>> GetProducts(
        [AsParameters] ProductsSpecParams productParams,
        IGenericRepository<Product> productsRepo,
        AppMapper mapper)
    {
        var spec = new ProductsWithTypesAndBrandsSpecification(productParams);
        var countSpec = new ProductsWithFiltersForCountSpecification(productParams);

        var totalItems = await productsRepo.CountAsync(countSpec);
        var products = await productsRepo.ListAsync(spec);

        return TypedResults.Ok(new Pagination<ProductToReturnDto>(
            productParams.PageIndex, productParams.PageSize, totalItems, mapper.ToDtos(products)));
    }

    private static async Task<Results<Ok<ProductToReturnDto>, NotFound>> GetProduct(
        int id,
        IGenericRepository<Product> productsRepo,
        AppMapper mapper)
    {
        var product = await productsRepo.GetEntityWithSpec(new ProductsWithTypesAndBrandsSpecification(id));

        return product is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(mapper.ToDto(product));
    }

    private static async Task<Ok<IReadOnlyList<ProductBrand>>> GetBrands(
        IGenericRepository<ProductBrand> brandRepo) =>
        TypedResults.Ok(await brandRepo.ListAllAsync());

    private static async Task<Ok<IReadOnlyList<ProductType>>> GetTypes(
        IGenericRepository<ProductType> typeRepo) =>
        TypedResults.Ok(await typeRepo.ListAllAsync());
}