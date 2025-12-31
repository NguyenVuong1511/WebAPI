using DTO.LoaiTour;
using Infrastructure;
using Infrastructure.Interfaces;
using Models;
using System.Data;
using TourManageService.Interface;


namespace TourManageService.Services
{
    public class LoaiTourService : ILoaiTourService
    {
        private readonly IDatabaseHelper _dbHelper;

        public LoaiTourService(IDatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }
        public async Task<ApiResponse<List<LoaiTourDTO>>> GetAll()
        {
            return await Task.Run(() =>
            {
                string msgError;
                var table = _dbHelper.ExecuteSProcedureReturnDataTable(out msgError, "sp_GetAllLoaiTour");
                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<List<LoaiTourDTO>> 
                    { 
                        Success = false, 
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                var data = table.AsEnumerable().Select(r => new LoaiTourDTO
                {
                    LoaiTourId = r.Field<Guid>("LoaiTourId"),
                    TenLoai = r.Field<string>("TenLoai"),
                    MoTa = r.Field<string?>("MoTa")
                }).ToList();

                return new ApiResponse<List<LoaiTourDTO>>
                {
                    Success = true,
                    Code = "SUCCESS",
                    Message = "Lấy danh sách loại tour thành công",
                    Data = data
                };
            });
        }
        public async Task<ApiResponse<LoaiTourDTO>> GetById(Guid id)
        {
            return await Task.Run(() =>
            {
                string msgError;
                var table = _dbHelper.ExecuteSProcedureReturnDataTable(
                    out msgError,
                    "sp_GetLoaiTourById",
                    "@LoaiTourId", id
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<LoaiTourDTO>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                if (table.Rows.Count == 0)
                {
                    return new ApiResponse<LoaiTourDTO>
                    {
                        Success = false,
                        Code = "NOT_FOUND",
                        Message = "Không tìm thấy loại tour"
                    };
                }

                var row = table.Rows[0];

                return new ApiResponse<LoaiTourDTO>
                {
                    Success = true,
                    Code = "SUCCESS",
                    Message = "Lấy dữ liệu thành công",
                    Data = new LoaiTourDTO
                    {
                        LoaiTourId = row.Field<Guid>("LoaiTourId"),
                        TenLoai = row.Field<string>("TenLoai"),
                        MoTa = row.Field<string?>("MoTa")
                    }
                };
            });
        }
        public async Task<ApiResponse<bool>> Create(CreateLoaiTourDTO model)
        {
            return await Task.Run(() =>
            {
                var msgError = _dbHelper.ExecuteSProcedure(
                    "sp_AddLoaiTour",
                    "@TenLoai", model.TenLoai,
                    "@MoTa", model.MoTa
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Code = "DUPLICATE",
                        Message = msgError
                    };
                }

                return new ApiResponse<bool>
                {
                    Success = true,
                    Code = "CREATED",
                    Message = "Thêm loại tour thành công",
                    Data = true
                };
            });
        }
        public async Task<ApiResponse<bool>> Update(UpdateLoaiTourDTO model)
        {
            return await Task.Run(() =>
            {
                var msgError = _dbHelper.ExecuteSProcedure(
                    "sp_UpdateLoaiTour",
                    "@LoaiTourId", model.LoaiTourId,
                    "@TenLoai", model.TenLoai,
                    "@MoTa", model.MoTa
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Code = "DUPLICATE",
                        Message = msgError
                    };
                }

                return new ApiResponse<bool>
                {
                    Success = true,
                    Code = "UPDATED",
                    Message = "Cập nhật loại tour thành công",
                    Data = true
                };
            });
        }
        public async Task<ApiResponse<bool>> Delete(Guid id)
        {
            return await Task.Run(() =>
            {
                var msgError = _dbHelper.ExecuteSProcedure(
                    "sp_DeleteLoaiTour",
                    "@LoaiTourId", id
                );

                if (!string.IsNullOrEmpty(msgError))
                {
                    return new ApiResponse<bool>
                    {
                        Success = false,
                        Code = "SQL_ERROR",
                        Message = msgError
                    };
                }

                return new ApiResponse<bool>
                {
                    Success = true,
                    Code = "DELETED",
                    Message = "Xoá loại tour thành công",
                    Data = true
                };
            });
        }

    }
}