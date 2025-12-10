using Microsoft.AspNetCore.Mvc;
using BLL.Interfaces;
using Models;

namespace API_NguoiDung.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NguoiDungController : ControllerBase
    {
        private readonly INguoiDungService _bus;

        public NguoiDungController(INguoiDungService bus)
        {
            _bus = bus;
        }

        // ==========================
        // Thêm người dùng
        // ==========================
        [HttpPost("create")]
        public IActionResult Create([FromBody] NguoiDung model)
        {
            string msg;
            bool success = _bus.Create(model, out msg);

            if (success)
                return Ok(new { message = "Thêm người dùng thành công", nguoiDungId = model.NguoiDungId });

            return BadRequest(new { message = msg });
        }
    }
}
