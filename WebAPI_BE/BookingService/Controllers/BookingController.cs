using BookingService.Interfaces;
using DTO.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace BookingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        // ==========================================================
        // 1. KHÁCH HÀNG: ĐẶT TOUR
        // ==========================================================
        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            if (request == null)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Dữ liệu đặt tour không hợp lệ."
                });
            }

            // Gọi Service Async
            var result = await _bookingService.CreateBookingAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        // ==========================================================
        // 2. KHÁCH HÀNG: XEM LỊCH SỬ
        // ==========================================================
        [HttpGet("history/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetMyHistory(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = "UserId không hợp lệ." });
            }

            var result = await _bookingService.GetMyHistoryAsync(userId);
            return Ok(result);
        }

        // ==========================================================
        // 3. KHÁCH HÀNG: HỦY ĐƠN
        // ==========================================================
        [HttpPost("cancel/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> CancelBooking(Guid bookingId, [FromQuery] Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return BadRequest(new ApiResponse<object> { Success = false, Message = "Cần cung cấp UserId để xác thực." });
            }

            var result = await _bookingService.CancelBookingAsync(bookingId, userId);

            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        // ==========================================================
        // 4. ADMIN: XEM TẤT CẢ ĐƠN
        // ==========================================================
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings()
        {
            var result = await _bookingService.GetAllBookingsAsync();
            return Ok(result);
        }

        // ==========================================================
        // 5. ADMIN: DUYỆT ĐƠN
        // ==========================================================
        [HttpPost("admin/approve/{bookingId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveBooking(Guid bookingId)
        {
            var result = await _bookingService.ApproveBookingAsync(bookingId);

            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        // ==========================================================
        // 6. XEM CHI TIẾT ĐƠN
        // ==========================================================
        [HttpGet("detail/{bookingId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBookingDetail([FromRoute] Guid bookingId)
        {
            if (bookingId == Guid.Empty)
            {
                return BadRequest(new { Success = false, Message = "Booking Id không hợp lệ." });
            }

            var result = await _bookingService.GetBookingDetailAsync(bookingId);

            if (result.Success)
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result);
            }
        }
    }
}
