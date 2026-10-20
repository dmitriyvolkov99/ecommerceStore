using System;

namespace Core.Specifications;

public class ProductsSpecParams
{
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 6;

    private int _pageIndex = 1;
    private int _pageSize = DefaultPageSize;
    private string? _search;

    public int PageIndex
    {
        get => _pageIndex;
        set => _pageIndex = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? DefaultPageSize : Math.Min(value, MaxPageSize);
    }

    public int? BrandId { get; set; }
    public int? TypeId { get; set; }
    public string? Sort { get; set; }

    public string? Search
    {
        get => _search;
        set => _search = value?.Trim().ToLowerInvariant();
    }
}