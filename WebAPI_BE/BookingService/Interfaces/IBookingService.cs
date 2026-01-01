using DTO.Booking;
using Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BookingService.Interfaces
{
    public interface IBookingService
    {
        // --- KHÁCH HÀNG ---
        Task<ApiResponse<string>> CreateBookingAsync(CreateBookingRequest request);
        Task<ApiResponse<List<BookingViewModel>>> GetMyHistoryAsync(Guid userId);
        Task<ApiResponse<string>> CancelBookingAsync(Guid bookingId, Guid userId);

        // --- ADMIN ---
        Task<ApiResponse<List<BookingViewModel>>> GetAllBookingsAsync();
        Task<ApiResponse<string>> ApproveBookingAsync(Guid bookingId);
        Task<ApiResponse<BookingViewModel>> GetBookingDetailAsync(Guid bookingId); // Thêm hàm xem chi tiết nếu cần
    }
}