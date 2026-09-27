import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Printer, 
  FileDown, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  UserCheck,
  Lock,
  Train,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { AcceptanceReport, Contract, WorkerContractor, UserRole } from '../types';
import { formatNumber, formatVND } from '../services/numberToWords';
import { exportAcceptancesToExcel } from '../services/exportExcel';
import { exportHtmlToWordDoc, generateAcceptanceHtml } from '../services/exportDoc';
import { getUserRoleProfile } from '../services/authRoles';

interface AcceptanceManagementProps {
  acceptances: AcceptanceReport[];
  contracts: Contract[];
  workers: WorkerContractor[];
  onNewAcceptance: () => void;
  onEditAcceptance: (report: AcceptanceReport) => void;
  onViewContractDoc: (contract: Contract) => void;
  onToggleStatus: (reportId: string) => void;
  currentRole?: UserRole;
}

export const AcceptanceManagement: React.FC<AcceptanceManagementProps> = ({
  acceptances,
  contracts,
  workers,
  onNewAcceptance,
  onEditAcceptance,
  onViewContractDoc,
  onToggleStatus,
  currentRole = 'admin',
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>(
    roleProfile.isStation ? roleProfile.stationName : 'all'
  );
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Pagination State - Mặc định 20 dòng / trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, workerFilter, stationFilter, pageSize]);

  const workerMap = new Map(workers.map(w => [w.id, w]));
  const contractMap = new Map(contracts.map(c => [c.id, c]));

  // Metrics
  const totalGross = acceptances.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalTax = acceptances.reduce((acc, r) => acc + r.taxAmount, 0);
  const totalNet = acceptances.reduce((acc, r) => acc + r.netAmount, 0);
  const pendingCount = acceptances.filter(r => r.paymentStatus !== 'paid').length;

  const filteredReports = acceptances.filter(r => {
    const worker = workerMap.get(r.workerId);
    const workerName = worker?.fullName?.toLowerCase() || '';
    const reportNo = r.reportNumber.toLowerCase();
    const station = r.workStation.toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = workerName.includes(term) || reportNo.includes(term) || station.includes(term);
    const matchesStatus = statusFilter === 'all' || r.paymentStatus === statusFilter;
    const matchesWorker = workerFilter === 'all' || r.workerId === workerFilter;
    const matchesStation = stationFilter === 'all' || r.workStation.includes(stationFilter);

    return matchesSearch && matchesStatus && matchesWorker && matchesStation;
  });

  // Pagination calculations
  const totalItems = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

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

  const handleTogglePayment = (reportId: string) => {
    if (!roleProfile.canApprovePayment) {
      setPaymentNotice(
        `Giới hạn phân quyền: Bạn đang đăng nhập với quyền "${roleProfile.name}". Thẩm quyền phê duyệt chi và xác nhận chuyển khoản thanh toán ngân hàng thuộc Ban Giám đốc & Phòng Kế hoạch Chi nhánh (Admin).`
      );
      setTimeout(() => setPaymentNotice(null), 5000);
      return;
    }
    onToggleStatus(reportId);
  };

  const handleExportSingleWord = (report: AcceptanceReport) => {
    const contract = contractMap.get(report.contractId);
    const worker = workerMap.get(report.workerId);
    if (!contract || !worker) return;

    const html = generateAcceptanceHtml(report, contract, worker);
    exportHtmlToWordDoc(html, `Bien_Ban_Nghiem_Thu_${report.reportNumber.replace(/\//g, '_')}`);
  };

  const handleExportAllExcel = () => {
    exportAcceptancesToExcel(acceptances, contracts, workers);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Giá Trị Nghiệm Thu</span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatVND(totalGross)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{acceptances.length} đợt nghiệm thu hoàn thành</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thuế TNCN Khấu Trừ (10%)</span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-amber-600 tabular-nums">
              {formatVND(totalTax)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Theo Nghị định 253/2026/NĐ-CP (≥ 5 triệu)</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thực Chi Cho Lao Động</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {formatVND(totalNet)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Số tiền thực chuyển vào tài khoản cá nhân</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng Thái Thanh Toán</span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {acceptances.length - pendingCount}/{acceptances.length}
            </span>
            <span className="text-xs font-medium text-emerald-600">Đã chi</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {pendingCount > 0 ? `Còn ${pendingCount} biên bản chờ giải ngân` : 'Tất cả đã hoàn tất thanh toán'}
          </p>
        </div>
      </div>

      {/* Payment notice for non-admin */}
      {paymentNotice && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            {paymentNotice}
          </div>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số biên bản, tên người nhận khoán, ga tác nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
            </select>

            <select
              value={workerFilter}
              onChange={(e) => setWorkerFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Tất cả người lao động</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.fullName}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="approved">Đã duyệt chi</option>
              <option value="pending">Chờ xử lý</option>
            </select>

            <button
              onClick={handleExportAllExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel Bảng Kê</span>
            </button>

            <button
              onClick={onNewAcceptance}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Lập Nghiệm Thu Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Acceptance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">Số Biên Bản & Đợt</th>
                <th className="py-3 px-3 whitespace-nowrap">Người Nhận Khoán</th>
                <th className="py-3 px-3 whitespace-nowrap">Ga Tác Nghiệp</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Khối Lượng</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Tổng Tiền (Gross)</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Thuế 10%</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Thực Lĩnh (Net)</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Thanh Toán</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Không tìm thấy biên bản nghiệm thu nào.
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => {
                  const worker = workerMap.get(report.workerId);
                  const contract = contractMap.get(report.contractId);

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 font-mono">
                          {report.reportNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {report.periodDescription} · {report.acceptanceDate}
                        </div>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">
                          {worker ? worker.fullName : report.representativeB}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          HĐ: {contract?.contractNumber}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                        {report.workStation}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {report.evaluationCompletedWagons}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          {contract?.templateType === 'CARGO_DUAL_EMPLOYER' ? 'tấn' : 'toa'}
                        </span>
                      </td>

                      {/* TỔNG TIỀN (GROSS) - Strictly single line */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        <span>{formatNumber(report.grossAmount)}&nbsp;₫</span>
                      </td>

                      {/* THUẾ 10% - Strictly single line without line break for currency */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {report.isTaxWithheld ? (
                          <span className="text-red-600 font-bold whitespace-nowrap inline-flex items-center justify-end gap-0.5">
                            <span>-&nbsp;{formatNumber(report.taxAmount)}&nbsp;₫</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] whitespace-nowrap">0&nbsp;₫ (0%)</span>
                        )}
                      </td>

                      {/* THỰC LĨNH (NET) - Strictly single line */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 tabular-nums text-sm whitespace-nowrap">
                        <span>{formatNumber(report.netAmount)}&nbsp;₫</span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePayment(report.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            report.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : report.paymentStatus === 'approved'
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {report.paymentStatus === 'paid' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã chi</span>
                            </>
                          ) : report.paymentStatus === 'approved' ? (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>Đã duyệt chi</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3" />
                              <span>Chờ xử lý</span>
                            </>
                          )}
                        </button>
                        {report.paymentReference && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[100px] mx-auto">
                            {report.paymentReference}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExportSingleWord(report)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="Tải Biên bản nghiệm thu file Word (.doc)"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (contract) onViewContractDoc(contract);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Xem hồ sơ in ấn chuẩn A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditAcceptance(report)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Chỉnh sửa biên bản"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
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
                Hiển thị <strong className="text-slate-900">{startIndex + 1}</strong> - <strong className="text-slate-900">{endIndex}</strong> trên tổng số <strong className="text-slate-900">{totalItems}</strong> biên bản
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
              {/* First Page Button */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang đầu"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Previous Page Button */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons */}
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

              {/* Next Page Button */}
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 cursor-pointer shadow-2xs"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page Button */}
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
    </div>
  );
};
