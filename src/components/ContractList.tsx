import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Plus, 
  Eye, 
  Edit3, 
  Printer, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  FileCheck, 
  Shield, 
  Train, 
  Lock, 
  BookOpen,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Contract, WorkerContractor, AcceptanceReport, ContractTemplateType, UserRole } from '../types';
import { formatNumber, formatVND } from '../services/numberToWords';
import { getUserRoleProfile, isStationMatching } from '../services/authRoles';

interface ContractListProps {
  contracts: Contract[];
  workers: WorkerContractor[];
  acceptances: AcceptanceReport[];
  onSelectContract: (contract: Contract) => void;
  onNewContract: () => void;
  onEditContract: (contract: Contract) => void;
  onDeleteContract?: (contractId: string) => void;
  onNewAcceptanceForContract: (contract: Contract) => void;
  currentRole?: UserRole;
}

export const ContractList: React.FC<ContractListProps> = ({
  contracts,
  workers,
  acceptances,
  onSelectContract,
  onNewContract,
  onEditContract,
  onDeleteContract,
  onNewAcceptanceForContract,
  currentRole = 'admin',
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const canEdit = roleProfile.canEditContractContent;
  const canCreate = roleProfile.canCreateContract;
  const canDelete = roleProfile.canDeleteContract;

  const [searchTerm, setSearchTerm] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>(
    roleProfile.isStation ? roleProfile.stationName.replace('Ga ', '') : 'all'
  );
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  // Pagination State - Mặc định 20 dòng / trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Sync station filter when role changes
  useEffect(() => {
    if (roleProfile.isStation) {
      setStationFilter(roleProfile.stationName.replace('Ga ', ''));
    } else {
      setStationFilter('all');
    }
  }, [currentRole]);

  // Reset page to 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, templateFilter, stationFilter, pageSize]);

  const workerMap = new Map(workers.map(w => [w.id, w]));

  // Calculate quick metrics
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalAllocatedBudget = workers.reduce((acc, w) => acc + (w.allocatedBudget || 0), 0);
  const totalConfirmedGross = acceptances.reduce((acc, a) => acc + a.grossAmount, 0);

  // Filter list
  const filteredContracts = contracts.filter(c => {
    const worker = workerMap.get(c.workerId);
    const workerName = worker?.fullName?.toLowerCase() || '';
    const contractNo = c.contractNumber.toLowerCase();
    const station = c.stationLocation.toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = workerName.includes(term) || contractNo.includes(term) || station.includes(term);
    const matchesTemplate = templateFilter === 'all' || c.templateType === templateFilter;
    const matchesStation = stationFilter === 'all' || c.stationLocation.includes(stationFilter);

    return matchesSearch && matchesTemplate && matchesStation;
  });

  // Pagination calculations
  const totalItems = filteredContracts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const getTemplateLabel = (type: ContractTemplateType) => {
    switch (type) {
      case 'CLEANING_FREELANCE':
        return { label: 'Mẫu 1 · Rửa toa xe vãng lai', color: 'text-blue-700 bg-blue-50' };
      case 'CLEANING_RETIRED':
        return { label: 'Mẫu 2 · Rửa toa xe hưu trí', color: 'text-emerald-700 bg-emerald-50' };
      case 'CARGO_DUAL_EMPLOYER':
        return { label: 'Mẫu 3 · Bốc dỡ hàng có BHXH 1', color: 'text-purple-700 bg-purple-50' };
      case 'CARGO_PRINCIPLE_VTHN':
        return { label: 'Mẫu 4 · HĐNT Bốc xếp Ga (PDF)', color: 'text-amber-800 bg-amber-50' };
      default:
        return { label: 'Hợp đồng giao khoán', color: 'text-slate-700 bg-slate-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng số Hợp đồng</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{totalContracts}</span>
            <span className="text-xs text-emerald-600 font-medium font-mono tabular-nums">({activeContracts} hiệu lực)</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Chuẩn Bộ luật Dân sự 2015</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hạn Mức Khoán Đã Cấp</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-indigo-600 tabular-nums">
              {formatVND(totalAllocatedBudget)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Phân bổ cho {workers.length} người nhận khoán</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Giá Trị Nghiệm Thu</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {formatVND(totalConfirmedGross)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{acceptances.length} đợt nghiệm thu hoàn thành</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pháp Lý & Tuân Thủ</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">4 Mẫu Biểu</span>
            <span className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">HR & Đường sắt</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tuân thủ Luật BHXH 2024 & NĐ 253/2026</p>
        </div>
      </div>

      {/* Role Banner if Station */}
      {roleProfile.isStation && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Bạn đang ở phân hệ <strong>{roleProfile.name}</strong>. Danh sách được tự động lọc theo các hợp đồng tác nghiệp tại <strong>{roleProfile.stationName}</strong>.
            </span>
          </div>
          <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold shrink-0">
            {roleProfile.stationName}
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số HĐ, tên người nhận khoán, CCCD, ga tác nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Tất cả mẫu hợp đồng</option>
              <option value="CLEANING_FREELANCE">Mẫu 1: Rửa toa xe vãng lai</option>
              <option value="CLEANING_RETIRED">Mẫu 2: Rửa toa xe hưu trí</option>
              <option value="CARGO_DUAL_EMPLOYER">Mẫu 3: Bốc dỡ hàng có BHXH 1</option>
              <option value="CARGO_PRINCIPLE_VTHN">Mẫu 4: HĐNT Bốc xếp Ga (PDF)</option>
            </select>

            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer font-medium"
            >
              <option value="all">Tất cả Ga tàu tác nghiệp</option>
              <option value="Nha Trang">Ga Nha Trang</option>
              <option value="Tuy Hòa">Ga Tuy Hòa</option>
              <option value="Diêu Trì">Ga Diêu Trì</option>
              <option value="Tháp Chàm">Ga Tháp Chàm</option>
              <option value="Ninh Hòa">Ga Ninh Hòa</option>
              <option value="Diên Khánh">Ga Diên Khánh</option>
            </select>

            {canCreate ? (
              <button
                onClick={onNewContract}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Hợp Đồng Mới</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Chỉ xem</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5">Số Hợp Đồng & Ngày Ký</th>
                <th className="py-3 px-3">Người Nhận Khoán</th>
                <th className="py-3 px-3">Mẫu Hợp Đồng</th>
                <th className="py-3 px-3">Ga Tác Nghiệp</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Đơn Giá Thỏa Thuận</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Nghiệm Thu</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Trạng Thái</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy hợp đồng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((contract) => {
                  const worker = workerMap.get(contract.workerId);
                  const templateInfo = getTemplateLabel(contract.templateType);
                  const contractReports = acceptances.filter(a => a.contractId === contract.id);
                  const totalPaidThisContract = contractReports.reduce((sum, r) => sum + r.netAmount, 0);

                  return (
                    <tr 
                      key={contract.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectContract(contract)}
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {contract.contractNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ký {contract.signDate} · 01 năm
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {worker ? worker.fullName : 'Chưa gán'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          CCCD: {worker?.cccdNumber}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${templateInfo.color}`}>
                          {templateInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{contract.stationLocation}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {contract.templateType === 'CARGO_DUAL_EMPLOYER' ? (
                          <div>
                            <div>Kiện: {formatNumber(contract.rateCargoPackage)}&nbsp;đ/tấn</div>
                            <div className="text-slate-500 text-[10px]">Rời: {formatNumber(contract.rateCargoBulk)}&nbsp;đ/tấn</div>
                          </div>
                        ) : (
                          <div>
                            <div>Vỏ: {formatNumber(contract.rateExteriorWash)}&nbsp;đ/toa</div>
                            <div className="text-slate-500 text-[10px]">Nội thất: {formatNumber(contract.rateInteriorWash)}&nbsp;đ/toa</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono tabular-nums">
                          {contractReports.length}&nbsp;đợt
                        </div>
                        <div className="text-[11px] text-emerald-600 font-mono tabular-nums">
                          {formatVND(totalPaidThisContract)}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Hiệu lực</span>
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectContract(contract)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Xem chi tiết & In văn bản"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Nút Nghiệm thu theo trạm */}
                          <button
                            onClick={() => onNewAcceptanceForContract(contract)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              isStationMatching(currentRole, contract.stationLocation)
                                ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                            }`}
                            title={
                              isStationMatching(currentRole, contract.stationLocation)
                                ? `Lập Biên bản nghiệm thu tác nghiệp tại ${contract.stationLocation}`
                                : `Hợp đồng tại ${contract.stationLocation} (Trạm khác)`
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Nút Sửa (Admin) hoặc Xem nội dung (Trạm) */}
                          <button
                            onClick={() => onEditContract(contract)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                              canEdit
                                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                            }`}
                            title={
                              canEdit
                                ? 'Chỉnh sửa nội dung và điều khoản hợp đồng (Admin)'
                                : 'Xem chi tiết điều khoản hợp đồng (Quyền Trạm: Chỉ xem)'
                            }
                          >
                            {canEdit ? <Edit3 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                          </button>

                          {/* Nút Xóa Hợp đồng (Admin Toàn Quyền) */}
                          {canDelete && (
                            <button
                              onClick={() => setContractToDelete(contract)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Xóa hợp đồng này (Quyền Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {totalItems > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            {/* Left: Row info & Page size selector */}
            <div className="flex items-center gap-3 flex-wrap">
              <span>
                Hiển thị <strong className="text-slate-900">{startIndex + 1}</strong> - <strong className="text-slate-900">{endIndex}</strong> trên tổng số <strong className="text-slate-900">{totalItems}</strong> hợp đồng
              </span>

              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-slate-500">Số dòng/trang:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20 (Mặc định)</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right: Page navigation controls */}
            <div className="flex items-center gap-1 select-none">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {getPaginationRange(validCurrentPage, totalPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  const pageNum = Number(p);
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-7 h-7 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-2xs ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang cuối"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Xác nhận Xóa Hợp đồng */}
      {contractToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-red-50/70 text-red-900">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Xác Nhận Xóa Hợp Đồng</h3>
                <p className="text-xs text-slate-500">Thao tác này sẽ loại bỏ hợp đồng khỏi hệ thống</p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số Hợp đồng:</span>
                  <span className="font-bold font-mono text-slate-900">{contractToDelete.contractNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Người nhận khoán:</span>
                  <span className="font-semibold text-slate-900">
                    {workerMap.get(contractToDelete.workerId)?.fullName || 'Chưa gán'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ga tác nghiệp:</span>
                  <span className="font-medium text-slate-800">{contractToDelete.stationLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày ký:</span>
                  <span className="text-slate-700">{contractToDelete.signDate}</span>
                </div>
              </div>

              {acceptances.filter(a => a.contractId === contractToDelete.id).length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cảnh báo:</strong> Hợp đồng này hiện có <strong>{acceptances.filter(a => a.contractId === contractToDelete.id).length} đợt nghiệm thu</strong> đã thực hiện. Khi xóa hợp đồng, các biên bản nghiệm thu đi kèm cũng sẽ được dọn dẹp khỏi hệ thống.
                  </span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 italic">
                Lưu ý: Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện xóa hợp đồng.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setContractToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteContract) {
                    onDeleteContract(contractToDelete.id);
                  }
                  setContractToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
