using API.Dtos;
using API.Extensions;
using API.Helpers;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers
{
    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly IOrderService _orderService;
        private readonly AppMapper mapper;
        public OrdersController(IOrderService orderService, AppMapper mapper)
        {
            this.mapper = mapper;
            this._orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult<OrderToReturnDto>> CreateOrder(OrderDto orderDto)
        {
            var email = User.GetEmail();
            var address = mapper.ToOrderAddress(orderDto.ShipToAddress);
            var order = await _orderService.CreateOrderAsync(email, orderDto.DeliveryMethodId, orderDto.BasketId, address);

            if (order == null)
            {
                return Problem(
                    detail: "Не удалось создать заказ. Проверьте корзину и способ доставки и повторите оплату.",
                    statusCode: StatusCodes.Status400BadRequest);
            }

            return Ok(mapper.ToDto(order));
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<OrderToReturnDto>>> GetOrdersForUser()
        {
            var email = User.GetEmail();
            var orders = await _orderService.GetOrdersForUserAsync(email);
            return Ok(mapper.ToDtos(orders));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderToReturnDto>> GetOrderByIdForUser(int id)
        {
            var email = User.GetEmail();
            var order = await _orderService.GetOrderByIdAsync(id, email);

            if (order == null) return NotFound();

            return mapper.ToDto(order);
        }

        [HttpGet("deliveryMethods")]
        public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
        {
            return Ok(await _orderService.GetDeliveryMethodsAsync());
        }
    }
}