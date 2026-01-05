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
        // 1. KHÁCH HÀNG: ĐẶT TOUR (Create Booking)
        // Method: POST /api/booking/create
        // ==========================================================
        [HttpPost("create")]
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
                return Ok(result); // Trả về 200 OK
            }

            return BadRequest(result); // Trả về 400 Bad Request kèm lỗi
        }

        // ==========================================================
        // 2. KHÁCH HÀNG: XEM LỊCH SỬ (Get History)
        // Method: GET /api/booking/history/{userId}
        // ==========================================================
        [HttpGet("history/{userId}")]
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
        // 3. KHÁCH HÀNG: HỦY ĐƠN (Cancel Booking)
        // Method: PUT /api/booking/cancel/{bookingId}?userId=...
        // ==========================================================
        [HttpPut("cancel/{bookingId}")]
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
        // 4. ADMIN: XEM TẤT CẢ ĐƠN (Get All)
        // Method: GET /api/booking/admin/all
        // ==========================================================
        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings()
        {
            var result = await _bookingService.GetAllBookingsAsync();
            return Ok(result);
        }

        // ==========================================================
        // 5. ADMIN: DUYỆT ĐƠN (Approve)
        // Method: PUT /api/booking/admin/approve/{bookingId}
        // ==========================================================
        [HttpPut("admin/approve/{bookingId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveBooking(Guid bookingId)
        {
            var result = await _bookingService.ApproveBookingAsync(bookingId);

            if (result.Success)
                return Ok(result);

            return BadRequest(result);
        }

        // ==========================================================
        // 6. XEM CHI TIẾT ĐƠN (Get Detail)
        // Method: GET /api/booking/detail/{bookingId}
        // ==========================================================
        [HttpGet("detail/{bookingId}")]
        public async Task<IActionResult> GetBookingDetail(Guid bookingId)
        {
            var result = await _bookingService.GetBookingDetailAsync(bookingId);
            return Ok(result);
        }
    }
}
