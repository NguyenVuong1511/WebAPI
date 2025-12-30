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
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var data = await _userService.GetByIdAsync(id); 
            if(data == null)
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
        
    }
}
