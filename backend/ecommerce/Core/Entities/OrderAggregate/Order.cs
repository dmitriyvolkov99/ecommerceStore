namespace Core.Entities.OrderAggregate;

public class Order : BaseEntity
{
    public Order()
    {
    }

    public Order(
        IReadOnlyList<OrderItem> orderItems,
        string buyerEmail,
        Address shipToAddress,
        DeliveryMethod deliveryMethod,
        decimal subTotal,
        string paymentIntentId)
    {
        BuyerEmail = buyerEmail;
        ShipToAddress = shipToAddress;
        DeliveryMethod = deliveryMethod;
        OrderItems = orderItems;
        SubTotal = subTotal;
        PaymentIntentId = paymentIntentId;
    }

    public string BuyerEmail { get; set; } = string.Empty;
    public DateTimeOffset OrderDate { get; set; } = DateTimeOffset.UtcNow;
    public Address ShipToAddress { get; set; } = null!;
    public DeliveryMethod DeliveryMethod { get; set; } = null!;
    public IReadOnlyList<OrderItem> OrderItems { get; set; } = null!;
    public decimal SubTotal { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public string PaymentIntentId { get; set; } = string.Empty;

    public decimal GetTotal() => SubTotal + DeliveryMethod.Price;
}