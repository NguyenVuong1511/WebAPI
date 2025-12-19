using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface ITourService
    {
        bool Create(Tour newTour, out string msg);
        Tour GetById(string tourId);
        List<Tour> GetAll();
        bool Update(Tour tour, out string msg);
        bool Delete(string tourId, out string msg);
    }
}
