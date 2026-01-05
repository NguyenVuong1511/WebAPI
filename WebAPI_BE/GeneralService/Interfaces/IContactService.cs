using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;
using DTO.General;

namespace GeneralService.Interfaces
{
    public interface IContactService
    {
        Task<ApiResponse<string>> SendContact(ContactCreateDto model);
        Task<ApiResponse<List<ContactViewDto>>> GetAllContacts();
        Task<ApiResponse<string>> MarkAsRead(Guid lienHeId);
        Task<ApiResponse<string>> DeleteContact(Guid lienHeId);
    }
}
