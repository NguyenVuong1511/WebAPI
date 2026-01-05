using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;
using DTO.Feedback;

namespace FeedbackService.Interfaces
{
    public interface IFeedbackService
    {
        Task<ApiResponse<List<FeedbackViewDto>>> GetFeedbackByTourId(Guid tourId);
        Task<ApiResponse<string>> CreateFeedback(FeedbackCreateDto model);
        Task<ApiResponse<string>> DeleteFeedback(Guid feedbackId);
    }
}