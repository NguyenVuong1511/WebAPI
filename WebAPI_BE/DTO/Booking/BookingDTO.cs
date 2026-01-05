using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTO.Booking
{
    // Request tạo mới Booking
    public class CreateBookingRequest
    {
        public Guid TourId { get; set; }
        public Guid NguoiDungId { get; set; } // Lấy từ Token
        public int SoNguoiLon { get; set; }
        public int SoTreEm { get; set; }
        public string PhuongThucThanhToan { get; set; } = "Tiền mặt";
        public string GhiChu { get; set; } = string.Empty;
        public List<PassengerDetail> KhachHang { get; set; } = new List<PassengerDetail>();
    }

    public class PassengerDetail
    {
        public string HoTen { get; set; } = string.Empty;
        public string LoaiKhach { get; set; } = "Người lớn";// "Người lớn" hoặc "Trẻ em"
        public string CMND { get; set; } = string.Empty;
    }

    // View Model hiển thị danh sách
    public class BookingViewModel
    {
        public Guid BookingId { get; set; }
        public string TenTour { get; set; } = string.Empty;
        public DateTime NgayDat { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThaiThanhToan { get; set; } = "Chờ xác nhận";
        public int SoNguoiLon { get; set; }
        public int SoTreEm { get; set; }
        // Dành cho Admin
        public string NguoiDat { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
