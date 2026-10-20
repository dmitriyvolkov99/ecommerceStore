using API.Dtos;
using API.Helpers;
using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;

namespace API.Controllers;

public class ProductsController(
    IGenericRepository<Product> productsRepo,
    IGenericRepository<ProductBrand> productBrandRepo,
    IGenericRepository<ProductType> productTypeRepo,
    AppMapper mapper) : BaseApiController
{
    [OutputCache(PolicyName = "Catalog")]
    [HttpGet]
    public async Task<ActionResult<Pagination<ProductToReturnDto>>> GetProducts(
        [FromQuery] ProductsSpecParams productParams)
    {
        var spec = new ProductsWithTypesAndBrandsSpecification(productParams);
        var countSpec = new ProductsWithFiltersForCountSpecification(productParams);

        var totalItems = await productsRepo.CountAsync(countSpec);
        var products = await productsRepo.ListAsync(spec);

        return Ok(new Pagination<ProductToReturnDto>(
            productParams.PageIndex, productParams.PageSize, totalItems, mapper.ToDtos(products)));
    }

    [OutputCache(PolicyName = "Catalog")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductToReturnDto>> GetProduct(int id)
    {
        var spec = new ProductsWithTypesAndBrandsSpecification(id);

        var product = await productsRepo.GetEntityWithSpec(spec);
        if (product is null) return NotFound();

        return mapper.ToDto(product);
    }

    [OutputCache(PolicyName = "Catalog")]
    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<ProductBrand>>> GetProductBrands() =>
        Ok(await productBrandRepo.ListAllAsync());

    [OutputCache(PolicyName = "Catalog")]
    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<ProductType>>> GetProductTypes() =>
        Ok(await productTypeRepo.ListAllAsync());
}