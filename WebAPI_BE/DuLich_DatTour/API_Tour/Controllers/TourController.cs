using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;

namespace API_Tour.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TourController : ControllerBase
    {
        private readonly ITourService _tourService;

        public TourController(ITourService tourService)
        {
            _tourService = tourService;
        }

        // POST api/tour
        [HttpPost]
        public IActionResult Create([FromBody] Tour tour)
        {
            if (tour == null) return BadRequest("Dữ liệu tour không được rỗng.");
            if (string.IsNullOrEmpty(tour.TourId)) tour.TourId = Guid.NewGuid().ToString();

            tour.CreatedAt = DateTime.Now;
            tour.UpdateAt = DateTime.Now;

            if (_tourService.Create(tour, out string msg))
                return CreatedAtAction(nameof(GetById), new { id = tour.TourId }, tour);

            return BadRequest(msg);
        }

        // GET api/tour/{id}
        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            var tour = _tourService.GetById(id);
            if (tour == null) return NotFound();
            return Ok(tour);
        }

        // GET api/tour
        [HttpGet]
        public IActionResult GetAll()
        {
            var list = _tourService.GetAll();
            return Ok(list);
        }

        // PUT api/tour/{id}
        [HttpPut("{id}")]
        public IActionResult Update(string id, [FromBody] Tour tour)
        {
            if (tour == null) return BadRequest("Dữ liệu tour không được rỗng.");
            if (id != tour.TourId) return BadRequest("TourId trong URL và payload không khớp.");

            tour.UpdateAt = DateTime.Now;

            if (_tourService.Update(tour, out string msg))
                return NoContent();

            return BadRequest(msg);
        }

        // DELETE api/tour/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            if (_tourService.Delete(id, out string msg))
                return NoContent();

            return BadRequest(msg);
        }
    }
}