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

        
    }
}
