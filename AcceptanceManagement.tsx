import React, { useState } from 'react';
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
  Shield
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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ Chi Trả / Quyết Toán</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{pendingCount}</span>
            <span className="text-xs text-slate-500 ml-1">biên bản</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Cần lập lệnh chuyển khoản ngân hàng</p>
        </div>
      </div>

      {/* Payment Notice / RBAC Warning */}
      {paymentNotice && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{paymentNotice}</span>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            className="text-rose-500 hover:text-rose-800 font-bold ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số biên bản, tên người nhận khoán, ga tàu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
                <th className="py-3 px-4">Số Biên Bản & Đợt</th>
                <th className="py-3 px-4">Người Nhận Khoán</th>
                <th className="py-3 px-4">Ga Tác Nghiệp</th>
                <th className="py-3 px-4 text-center">Khối Lượng</th>
                <th className="py-3 px-4 text-right">Tổng Tiền (Gross)</th>
                <th className="py-3 px-4 text-right">Thuế 10%</th>
                <th className="py-3 px-4 text-right">Thực Lĩnh (Net)</th>
                <th className="py-3 px-4 text-center">Thanh Toán</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
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
                filteredReports.map((report) => {
                  const worker = workerMap.get(report.workerId);
                  const contract = contractMap.get(report.contractId);

                  return (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 font-mono">
                          {report.reportNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {report.periodDescription} · {report.acceptanceDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {worker ? worker.fullName : report.representativeB}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          HĐ: {contract?.contractNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {report.workStation}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {report.evaluationCompletedWagons}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          {contract?.templateType === 'CARGO_DUAL_EMPLOYER' ? 'tấn' : 'toa'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatNumber(report.grossAmount)} ₫
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {report.isTaxWithheld ? (
                          <span className="text-red-600 font-bold">
                            - {formatNumber(report.taxAmount)} ₫
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">0 ₫ (0%)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums text-sm">
                        {formatNumber(report.netAmount)} ₫
                      </td>

                      <td className="py-3.5 px-4 text-center">
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

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExportSingleWord(report)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Tải Biên bản nghiệm thu file Word (.doc)"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (contract) onViewContractDoc(contract);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Xem hồ sơ in ấn chuẩn A4"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditAcceptance(report)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
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
      </div>
    </div>
  );
};
