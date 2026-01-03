using Microsoft.AspNetCore.Mvc;
using TourManageService.Interfaces;
using DTO.AnhTour;
namespace TourManageService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnhTourController : Controller
    {
        private readonly IAnhTourService _anhTourService;

        public AnhTourController(IAnhTourService anhTourService)
        {
            _anhTourService = anhTourService;
        }

        [HttpGet("get-by-tour/{tourId}")]
        public async Task<IActionResult> GetByTourId(Guid tourId)
        {
            var result = await _anhTourService.GetByTourId(tourId);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateAnhTourDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _anhTourService.Create(request);
            return Ok(result);
        }
    }
}
