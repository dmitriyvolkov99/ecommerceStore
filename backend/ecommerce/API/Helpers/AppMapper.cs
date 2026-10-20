using API.Dtos;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Riok.Mapperly.Abstractions;
using IdentityAddress = Core.Entities.Identity.Address;
using OrderAddress = Core.Entities.OrderAggregate.Address;

namespace API.Helpers;

[Mapper(RequiredMappingStrategy = RequiredMappingStrategy.Target)]
public partial class AppMapper
{
    private readonly string _apiUrl;

    public AppMapper(IConfiguration config)
    {
        _apiUrl = config["ApiUrl"] ?? string.Empty;
    }

    // ---------- Товары ----------

    public ProductToReturnDto ToDto(Product product) =>
        MapProduct(product) with { PictureUrl = Urls.Combine(_apiUrl, product.PictureUrl) };

    public IReadOnlyList<ProductToReturnDto> ToDtos(IEnumerable<Product> products) =>
        products.Select(p => ToDto(p)).ToList();

    [MapProperty("ProductBrand.Name", nameof(ProductToReturnDto.ProductBrand))]
    [MapProperty("ProductType.Name", nameof(ProductToReturnDto.ProductType))]
    [MapperIgnoreTarget(nameof(ProductToReturnDto.PictureUrl))] // задаётся в ToDto
    private partial ProductToReturnDto MapProduct(Product product);

    // ---------- Корзина ----------

    public partial CustomerBasket ToEntity(CustomerBasketDto basket);

    private partial BasketItem MapBasketItem(BasketItemDto item);

    // ---------- Адреса ----------

    public partial AddressDto ToDto(IdentityAddress address);

    public partial IdentityAddress ToIdentityAddress(AddressDto address);

    public partial OrderAddress ToOrderAddress(AddressDto address);

    // ---------- Заказы ----------

    public OrderToReturnDto ToDto(Order order)
    {
        var dto = MapOrder(order);

        return dto with
        {
            Total = order.GetTotal(),
            OrderItems = [.. dto.OrderItems.Select(i => i with { PictureUrl = Urls.Combine(_apiUrl, i.PictureUrl) })]
        };
    }

    public IReadOnlyList<OrderToReturnDto> ToDtos(IEnumerable<Order> orders) =>
        orders.Select(o => ToDto(o)).ToList();

    [MapProperty("DeliveryMethod.ShortName", nameof(OrderToReturnDto.DeliveryMethod))]
    [MapProperty("DeliveryMethod.Price", nameof(OrderToReturnDto.ShippingPrice))]
    [MapProperty(nameof(Order.SubTotal), nameof(OrderToReturnDto.Subtotal))]
    [MapperIgnoreTarget(nameof(OrderToReturnDto.Total))] // считается в ToDto
    private partial OrderToReturnDto MapOrder(Order order);

    [MapProperty("ItemOrdered.ProductItemId", nameof(OrderItemDto.ProductId))]
    [MapProperty("ItemOrdered.ProductName", nameof(OrderItemDto.ProductName))]
    [MapProperty("ItemOrdered.PictureUrl", nameof(OrderItemDto.PictureUrl))]
    private partial OrderItemDto MapOrderItem(OrderItem item);
}

// Вынесено из маппера намеренно: иначе Mapperly применил бы метод ко всем string-свойствам.
file static class Urls
{
    public static string Combine(string baseUrl, string? path) =>
        string.IsNullOrEmpty(path) ? string.Empty : baseUrl + path;
}