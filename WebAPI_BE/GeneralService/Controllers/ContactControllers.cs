using DTO.General;
using GeneralService.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _generalService;

        public ContactController(IContactService generalService)
        {
            _generalService = generalService;
        }

        // POST: api/Contact (Khách hàng gửi)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> SendContact([FromBody] ContactCreateDto model)
        {
            var result = await _generalService.SendContact(model);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // GET: api/Contact (Admin xem danh sách)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _generalService.GetAllContacts();
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // PUT: api/Contact/mark-read/{id} (Admin đánh dấu đã xem)
        [HttpPost("mark-read/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> MarkRead(Guid id)
        {
            var result = await _generalService.MarkAsRead(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // DELETE: api/Contact/{id} (Admin xóa)
        [HttpPost("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _generalService.DeleteContact(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
