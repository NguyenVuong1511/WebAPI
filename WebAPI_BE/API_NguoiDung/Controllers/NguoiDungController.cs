using Microsoft.AspNetCore.Mvc;
using BLL.Interfaces;
using Models;
using System.Reflection;

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
        // ==========================
        // Lấy người dùng theo id
        // ==========================
        [HttpGet("get-by-id/{id}")]
        public IActionResult GetById([FromRoute] string id)
        {
            NguoiDung user = _bus.GetById(id);

            if (user != null)
            {
                return Ok(user);
            }

            return BadRequest(new { message = "Không tìm thấy người dùng với ID này" });
        }
        [HttpGet("get-all")]
        public IActionResult GetAll()
        {
            List<NguoiDung> user = _bus.GetAll();

            if (user != null)
            {
                return Ok(user);
            }

            return BadRequest(new { message = "Không tìm thấy người dùng nào" });
        }
        [HttpPost("update")]
        public IActionResult UpdateNguoiDung([FromBody] NguoiDung user)
        {
            string msg;
            if (user == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ" });
            }
            bool result = _bus.Update(user, out msg);
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

            // Kiểm tra NguoiDungId rỗng/null
            if (string.IsNullOrWhiteSpace(user.NguoiDungId))
                return BadRequest(new { success = false, message = "ID người dùng không được để trống" });

            if (result)
            {
                return Ok(new { message = "Cập nhật người dùng thành công" });
            }
            return BadRequest(msg);
        }
        [HttpPost("delete/{id}")]
        public IActionResult DeleteNguoiDung([FromRoute] string id)
        {
            string msg = string.Empty;

            if (_bus.Delete(id, out msg))
            {
                return Ok(msg);
            }

            return BadRequest(msg);
        }
    }
}
