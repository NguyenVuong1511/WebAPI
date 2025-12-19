
using BLL.Interfaces;
using DAL.Interfaces;
using Models;
using System;
using System.Collections.Generic;

namespace BLL
{
    public class TourService : ITourService
    {
        private readonly ITourReository _repo;

        public TourService(ITourReository repo)
        {
            _repo = repo;
        }

        public bool Create(Tour newTour, out string msg)
        {
            msg = string.Empty;
            if (newTour == null)
            {
                msg = "Dữ liệu tour không hợp lệ.";
                return false;
            }

            if (string.IsNullOrEmpty(newTour.TourId))
                newTour.TourId = Guid.NewGuid().ToString();

            // Bạn có thể thêm validate ở đây (ví dụ: TenTourId không rỗng, ngày hợp lệ...)
            return _repo.Create(newTour, out msg);
        }

        public Tour GetById(string tourId) => _repo.GetById(tourId);

        public List<Tour> GetAll() => _repo.GetAll();

        public bool Update(Tour tour, out string msg)
        {
            msg = string.Empty;
            if (tour == null || string.IsNullOrEmpty(tour.TourId))
            {
                msg = "Dữ liệu cập nhật không hợp lệ.";
                return false;
            }

            return _repo.Update(tour, out msg);
        }

        public bool Delete(string tourId, out string msg) => _repo.Delete(tourId, out msg);
    }
}