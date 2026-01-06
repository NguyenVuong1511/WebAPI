using System;

namespace DTO.Feedback
{
    // DTO dùng để hiển thị dữ liệu ra ngoài
    public class FeedbackViewDto
    {
        public Guid DanhGiaId { get; set; }
        public Guid TourId { get; set; }
        public Guid NguoiDungId { get; set; }
        public string TenNguoiDung { get; set; } = string.Empty; // Lấy từ bảng NguoiDung
        public string Email { get; set; } = string.Empty;
        public int SoSao { get; set; }
        public string BinhLuan { get; set; } = string.Empty;
        public DateTime NgayDanhGia { get; set; }
    }

    // DTO dùng để Client gửi dữ liệu lên (Tạo mới)
    public class FeedbackCreateDto
    {
        public Guid TourId { get; set; }
        public Guid NguoiDungId { get; set; } // Thường lấy từ Token, nhưng ở đây truyền vào
        public int SoSao { get; set; }
        public string BinhLuan { get; set; } = string.Empty;
    }
}