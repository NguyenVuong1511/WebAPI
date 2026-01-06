using BookingService.Interfaces;
using DTO.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace BookingService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingThongKeController : ControllerBase
    {
        private readonly IBookingThongKeService _bookingTKService;

        public BookingThongKeController(IBookingThongKeService bookingTKService)
        {
            _bookingTKService = bookingTKService;
        }

        // GET: api/booking/stats
        [HttpGet("stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _bookingTKService.GetDashboardStatsAsync();

                return Ok(new ApiResponse<DashboardViewModel>
                {
                    Success = true,
                    Message = "Lấy dữ liệu thống kê thành công",
                    Data = stats
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }
    }
}
