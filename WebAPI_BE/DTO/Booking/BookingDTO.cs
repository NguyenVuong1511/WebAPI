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
        public Guid NguoiDungId { get; set; }
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

    public class BookingViewModel
    {
        public Guid BookingId { get; set; }
        public string TenTour { get; set; } = string.Empty;
        public DateTime NgayDat { get; set; }
        public decimal TongTien { get; set; }
        public string TrangThaiThanhToan { get; set; } = "Chờ xác nhận";
        public int SoNguoiLon { get; set; }
        public int SoTreEm { get; set; }

        // Bổ sung thêm danh sách hành khách
        public List<BookingChiTietViewModel> DanhSachHanhKhach { get; set; } = new List<BookingChiTietViewModel>();
    }

    public class BookingChiTietViewModel
    {
        public string HoTen { get; set; }
        public string LoaiKhach { get; set; }
        public string CMND { get; set; }
    }
    public class BookingAdminViewModel : BookingViewModel
    {
        public string NguoiDat { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
    public class DashboardViewModel
    {
        public decimal TongDoanhThu { get; set; }
        public int BookingTrongThang { get; set; }
        public int TongKhachHang { get; set; }
        public List<TopTourModel> TopTours { get; set; } = new List<TopTourModel>();
    }

    public class TopTourModel
    {
        public string TenTour { get; set; } = string.Empty;
        public decimal GiaTien { get; set; }
        public int SoLuotDat { get; set; }
        public decimal DoanhThuTour { get; set; }
    }
}
