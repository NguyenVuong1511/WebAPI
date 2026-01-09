using DTO.AnhTour;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourManageService.Interfaces;
namespace TourManageService.Controllers
{
    [Authorize(Roles = "Admin")]
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
        [AllowAnonymous]
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

        [HttpDelete("delete/{anhTourId}")]
        
        public async Task<IActionResult> Delete(Guid anhTourId)
        {
            var result = await _anhTourService.Delete(anhTourId);
            return Ok(result);
        }

        [HttpPut("set-avatar")]
        
        public async Task<IActionResult> SetAvatar([FromBody] SetAnhTourAvatarDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _anhTourService.SetAvatar(request);
            return Ok(result);
        }

    }
}
