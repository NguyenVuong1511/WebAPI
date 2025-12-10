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
        // 1. Sửa route: dùng {id} để hứng tham số từ URL
        [HttpGet("get-by-id/{id}")]
        public IActionResult GetById([FromRoute] string id) // 2. Dùng [FromRoute] thay vì [FromBody]
        {
            // Gọi tầng xử lý nghiệp vụ
            NguoiDung user = _bus.GetById(id);

            // 3. Kiểm tra null
            if (user != null)
            {
                // 4. Bọc kết quả trong Ok() để trả về HTTP 200 chuẩn
                return Ok(user);
            }

            // 5. Gán nội dung thông báo rõ ràng
            return BadRequest(new { message = "Không tìm thấy người dùng với ID này" });
            // Hoặc dùng: return NotFound(); sẽ chuẩn hơn cho trường hợp không tìm thấy.
        }
        [HttpGet("get-all")]
        public IActionResult GetAll()
        {
            // Gọi tầng xử lý nghiệp vụ
            List<NguoiDung> user = _bus.GetAll();

            // 3. Kiểm tra null
            if (user != null)
            {
                // 4. Bọc kết quả trong Ok() để trả về HTTP 200 chuẩn
                return Ok(user);
            }

            // 5. Gán nội dung thông báo rõ ràng
            return BadRequest(new { message = "Không tìm thấy người dùng nào" });
            // Hoặc dùng: return NotFound(); sẽ chuẩn hơn cho trường hợp không tìm thấy.
        }
    }
}
