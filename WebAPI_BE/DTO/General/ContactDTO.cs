using System;

namespace DTO.General
{
    // DTO để Khách hàng gửi lên
    public class ContactCreateDto
    {
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
    }

    // DTO để hiển thị cho Admin
    public class ContactViewDto
    {
        public Guid LienHeId { get; set; }
        public string HoTen { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string TieuDe { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public DateTime NgayGui { get; set; }
        public bool DaXem { get; set; }
    }
}