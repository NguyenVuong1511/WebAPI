using Microsoft.AspNetCore.Mvc;
using UserService.Interfaces;
using Models;
using DTO.User;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _userService.GetAllAsync();
            return Ok(new ApiResponse<List<NguoiDungDTO>>
            {
                Success = true,
                Message = "Lấy danh sách thành công",
                Data = data
            });
        }
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var data = await _userService.GetByIdAsync(id);
            if (data == null)
            {
                return NotFound(new ApiResponse<NguoiDungDTO>
                {
                    Success = false,
                    Message = "Không tìm thấy người dùng này"
                });
            }
            return Ok(new ApiResponse<NguoiDungDTO>
            {
                Success = true,
                Message = "Thành công",
                Data = data
            });
        }
        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreateNguoiDungDTO model)
        {
            var result = await _userService.CreateAsync(model);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }
        [HttpPost("update/{id}")]
        public async Task<IActionResult> UpdateAsync([FromRoute] Guid id,[FromBody] NguoiDungUpdateDTO model)
        {
            var result = await _userService.UpdateAsync(id, model);
            if(!result.Success)
                return BadRequest(result);
            return Ok(result);
        }
        [HttpPost("delete/{id}")]
        public async Task<IActionResult> DeleteAsync([FromRoute]Guid id)
        {
            var result = await _userService.DeleteAsync(id);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }
    }

}
