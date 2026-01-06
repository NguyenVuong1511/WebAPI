using Microsoft.AspNetCore.Mvc;
using DTO.Feedback;
using System;
using System.Threading.Tasks;
using FeedbackService.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace FeedbackService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        // GET: api/Feedback/tour/{tourId}
        [HttpGet("tour/{tourId}")]
        public async Task<IActionResult> GetByTour(Guid tourId)
        {
            var result = await _feedbackService.GetFeedbackByTourId(tourId);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // POST: api/Feedback
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] FeedbackCreateDto model)
        {
            var result = await _feedbackService.CreateFeedback(model);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }

        // DELETE: api/Feedback/{id}
        [HttpPost("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _feedbackService.DeleteFeedback(id);
            if (!result.Success) return BadRequest(result);
            return Ok(result);
        }
    }
}
