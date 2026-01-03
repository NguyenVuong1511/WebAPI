using DTO.Tour;
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
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _tourService.GetById(id);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateTourDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _tourService.Create(request);
            return Ok(result);
        }
        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateTourDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _tourService.Update(request);
            return Ok(result);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _tourService.Delete(id);
            return Ok(result);
        }


        [HttpPost("user/get-all")]
        public async Task<IActionResult> GetAll([FromBody] TourUserQueryDTO request)
        {
            var result = await _tourService.GetAll(request);
            return Ok(result);
        }
    }
}
