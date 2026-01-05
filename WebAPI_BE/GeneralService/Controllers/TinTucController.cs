using Microsoft.AspNetCore.Mvc;
using GeneralService.Interfaces;
using Models;
using DTO.User;
using Microsoft.AspNetCore.Authorization;
using System.Reflection;
using DTO.TinTuc;
using GeneralService.Service;

namespace GeneralService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TinTucController : ControllerBase
    {
        private readonly ITinTucService _tinTucService;
        public TinTucController(ITinTucService tinTucService)
        {
            _tinTucService = tinTucService;
        } 
        // Lấy danh sách tin tức
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _tinTucService.GetAllAsync();
            return Ok(new ApiResponse<List<TinTucDTO>>
            {
                Success = true,
                Message = "Lấy danh sách tin tức thành công",
                Data = data
            });
        }

        // Xem chi tiết tin tức
        [HttpGet("get-by-id/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var data = await _tinTucService.GetByIdAsync(id);
            if (data == null)
            {
                return NotFound(new ApiResponse<TinTucDTO>
                {
                    Success = false,
                    Message = "Không tìm thấy tin tức"
                });
            }

            return Ok(new ApiResponse<TinTucDTO>
            {
                Success = true,
                Message = "Thành công",
                Data = data
            });
        }

        // Thêm tin tức mới
        [HttpPost("create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateTinTucDTO model)
        {
            var result = await _tinTucService.CreateAsync(model);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // Sửa tin tức
        [HttpPost("update/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAsync(
            [FromRoute] Guid id,
            [FromBody] CreateTinTucDTO model)
        {
            var result = await _tinTucService.UpdateAsync(id, model);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        //Xóa tin tức
        [HttpPost("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAsync(Guid id)
        {
            var result = await _tinTucService.DeleteAsync(id);

            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
