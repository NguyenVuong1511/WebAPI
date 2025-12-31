using Microsoft.AspNetCore.Mvc;
using TourManageService.Interfaces;

namespace TourManageService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TourController : ControllerBase
    {
        private readonly ITourService _tourService;
        public TourController(ITourService tourService)
        {
            _tourService = tourService;
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll([FromQuery] string? keyword)
        {
            var result = await _tourService.GetAll(keyword);
            return Ok(result);
        }
    }
}
