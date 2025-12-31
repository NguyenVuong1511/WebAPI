using DTO.LoaiTour;
using Microsoft.AspNetCore.Mvc;
using TourManageService.Interface;


namespace TourManageService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoaiTourController : Controller
    {
        private readonly ILoaiTourService _loaiTourService;

        public LoaiTourController(ILoaiTourService loaiTourService)
        {
            _loaiTourService = loaiTourService;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _loaiTourService.GetAll();
            return Ok(result);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _loaiTourService.GetById(id);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateLoaiTourDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _loaiTourService.Create(request);
            return Ok(result);
        }


        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateLoaiTourDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _loaiTourService.Update(request);
            return Ok(result);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _loaiTourService.Delete(id);
            return Ok(result);
        }

    }
}
