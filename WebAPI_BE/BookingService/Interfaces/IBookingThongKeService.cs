using DTO.Booking;
using System.Threading.Tasks;
namespace BookingService.Interfaces
{
    public interface IBookingThongKeService
    {
        Task<DashboardViewModel> GetDashboardStatsAsync();
    }
}
