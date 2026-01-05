using DTO.LichTrinh;
using Microsoft.AspNetCore.Mvc;
using TourManageService.Interfaces;

namespace TourManageService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LichTrinhController : Controller
    {
        private readonly ILichTrinhService _lichTrinhService;

        public LichTrinhController(ILichTrinhService lichTrinhService)
        {
            _lichTrinhService = lichTrinhService;
        }

        [HttpGet("get-by-tour/{tourId}")]
        public async Task<IActionResult> GetByTourId(Guid tourId)
        {
            var result = await _lichTrinhService.GetByTourId(tourId);
            return Ok(result);
        }
    }
}