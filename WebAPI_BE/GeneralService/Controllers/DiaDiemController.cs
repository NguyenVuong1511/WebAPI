using DTO.DiaDiem;
using GeneralService.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GeneralService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiaDiemController : ControllerBase
    {
        private readonly IDiaDiemService _diaDiemService;

        public DiaDiemController(IDiaDiemService diaDiemService)
        {
            _diaDiemService = diaDiemService;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var response = await _diaDiemService.GetAllAsync();
            return Ok(response);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var response = await _diaDiemService.GetByIdAsync(id);
            // Bạn có thể giữ Ok() cho mọi trường hợp, hoặc check response.Success để trả về BadRequest
            return Ok(response);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] DiaDiemDTO model)
        {
            var response = await _diaDiemService.CreateAsync(model);
            return Ok(response);
        }

        [HttpPost("update")]
        public async Task<IActionResult> Update([FromBody] DiaDiemDTO model)
        {
            var response = await _diaDiemService.UpdateAsync(model);
            return Ok(response);
        }

        [HttpPost("delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var response = await _diaDiemService.DeleteAsync(id);
            return Ok(response);
        }
    }
}
