import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, Copy, Check, Layers, Table, Calculator, 
  ShieldAlert, Users, FileText, Sparkles, ChevronRight, Info, Share2, 
  CheckCircle2, ArrowUpRight, Database, Search
} from 'lucide-react';
import { Contract, WorkerContractor, AcceptanceReport } from '../types';
import { exportCompleteGoogleSheetWorkbook } from '../services/googleSheetExport';
import { formatNumber, formatVND } from '../services/numberToWords';

interface GoogleSheetDesignViewProps {
  contracts: Contract[];
  workers: WorkerContractor[];
  acceptances: AcceptanceReport[];
}

export const GoogleSheetDesignView: React.FC<GoogleSheetDesignViewProps> = ({
  contracts,
  workers,
  acceptances,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<'sheet1' | 'sheet2' | 'sheet3' | 'sheet4' | 'sheet5' | 'sheet6'>('sheet1');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const workerMap = new Map(workers.map(w => [w.id, w]));
  const contractMap = new Map(contracts.map(c => [c.id, c]));

  // Metrics
  const totalAllocated = workers.reduce((sum, w) => sum + w.allocatedBudget, 0);
  const totalGross = acceptances.reduce((sum, a) => sum + a.grossAmount, 0);
  const totalTax = acceptances.reduce((sum, a) => sum + a.taxAmount, 0);
  const totalNet = acceptances.reduce((sum, a) => sum + a.netAmount, 0);
  const totalRemaining = totalAllocated - totalGross;

  const handleCopyFormula = (formula: string, id: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleDownload = () => {
    exportCompleteGoogleSheetWorkbook(contracts, workers, acceptances);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Thiết kế Kiến trúc Google Sheets Chi nhánh Vận tải đường sắt Nha Trang
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hệ Thống Google Sheet Lưu Trữ Toàn Bộ Thông Tin
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              File thiết kế gồm <strong className="text-emerald-300">6 Trang tính (Sheets)</strong> liên kết chéo bằng công thức tự động 
              (<code className="bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-200 text-xs">SUMIF</code>, <code className="bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-200 text-xs">IF</code>, <code className="bg-emerald-950/60 px-2 py-0.5 rounded text-emerald-200 text-xs">COUNTIF</code>), 
              lưu trữ đầy đủ từ Danh mục lao động, 4 loại hợp đồng giao khoán (bao gồm hợp đồng bốc xếp Hóa vận Ga chuẩn PDF), chi tiết từng toa xe bốc dỡ và theo dõi thuế TNCN 10% theo Nghị định 253/2026/NĐ-CP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold shadow-lg hover:shadow-emerald-500/25 transition-all text-sm group"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Tải file Google Sheet (.xlsx)
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-700/40">
          <div>
            <div className="text-xs text-emerald-300 font-medium">Số trang tính thiết kế</div>
            <div className="text-xl font-bold text-white mt-1">6 Sheets liên kết</div>
          </div>
          <div>
            <div className="text-xs text-emerald-300 font-medium">Hợp đồng lưu trữ</div>
            <div className="text-xl font-bold text-white mt-1">{contracts.length} hợp đồng (4 mẫu)</div>
          </div>
          <div>
            <div className="text-xs text-emerald-300 font-medium">Lao động khoán</div>
            <div className="text-xl font-bold text-white mt-1">{workers.length} nhân sự</div>
          </div>
          <div>
            <div className="text-xs text-emerald-300 font-medium">Đợt nghiệm thu / Toa xe</div>
            <div className="text-xl font-bold text-white mt-1">{acceptances.length} đợt nghiệm thu</div>
          </div>
        </div>
      </div>

      {/* Schema Structure Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-600" />
          Sơ đồ Cấu trúc Quan hệ 6 Trang tính trong File Google Sheet
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                1_DanhMuc_LaoDong
              </span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-xs font-semibold rounded">Bảng chính</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mã NV, Họ tên, CCCD, MST, STK ngân hàng, Phân loại an sinh (Hưu trí / Tự do / BHXH cty 1), Hạn mức ngân sách, Tổng Gross và Tỷ lệ giải ngân.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sky-800 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" />
                2_HopDong_GiaoKhoan
              </span>
              <span className="px-2 py-0.5 bg-sky-200 text-sky-800 text-xs font-semibold rounded">Hợp đồng</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Số HĐ, 4 Mẫu biểu (rửa xe, bốc dỡ HĐNT-VTHN-NT), Ga tác nghiệp, Đơn giá khoán (toa xe/tấn hàng), Thời hạn và điều khoản an toàn ga tàu.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
                <Table className="w-4 h-4 text-amber-600" />
                3_NghiemThu_HoaVan
              </span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-semibold rounded">Tác nghiệp</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chi tiết từng số hiệu toa xe tàu hàng/khách, tấn hàng bao kiện/hàng rời, đơn giá, thành tiền và chữ ký Trực ban Hóa vận ga.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-800 text-sm flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-purple-600" />
                4_TheoDoi_ThueTNCN_ChiTra
              </span>
              <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-semibold rounded">Pháp lý & Thuế</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Áp dụng Nghị định 253/2026/NĐ-CP: Kiểm tra ngưỡng 5 triệu & Cam kết 08/CK-TNCN, tính thuế TNCN 10%, tiền Net thực chi và mã UNC ngân hàng.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-indigo-800 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                5_Dashboard_NganSach
              </span>
              <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 text-xs font-semibold rounded">Báo cáo</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bảng điều khiển Giám đốc: Tổng ngân sách phê duyệt, số tiền đã nghiệm thu, thuế nộp NSNN, ngân sách còn lại và tỷ lệ giải ngân từng ga.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-slate-600" />
                6_HuongDan_GoogleSheet
              </span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded">HDSD</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cách đưa file lên Google Drive, mở bằng Google Trang tính, cài đặt phân quyền cho Trực ban Ga và Kế toán Chi nhánh, công thức SUMIF chuẩn.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sheet Preview Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50/80 p-2 gap-1.5">
          <button
            onClick={() => setActiveSheetTab('sheet1')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheetTab === 'sheet1'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Danh Mục Lao Động
          </button>

          <button
            onClick={() => setActiveSheetTab('sheet2')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheetTab === 'sheet2'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Hợp Đồng Giao Khoán
          </button>

          <button
            onClick={() => setActiveSheetTab('sheet3')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheetTab === 'sheet3'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Table className="w-4 h-4" />
            3. Nghiệm Thu Hóa Vận & Toa Xe
          </button>

          <button
            onClick={() => setActiveSheetTab('sheet4')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheetTab === 'sheet4'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Calculator className="w-4 h-4" />
            4. Theo Dõi Thuế TNCN & Chi Trả
          </button>

          <button
            onClick={() => setActiveSheetTab('sheet5')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheetTab === 'sheet5'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            5. Dashboard Ngân Sách
          </button>

          <button
            onClick={() => setActiveSheetTab('sheet6')}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
              activeSheetTab === 'sheet6'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            6. Hướng Dẫn & Công Thức
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: DANH MỤC LAO ĐỘNG */}
          {activeSheetTab === 'sheet1' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-100">
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm sm:text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Trang tính 1: Danh Mục Lao Động Nhận Khoán (1_DanhMuc_LaoDong)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Quản lý hồ sơ nhân sự khoán, thông tin pháp lý an sinh xã hội, số tài khoản và hạn mức ngân sách được giao.
                  </p>
                </div>
                <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-800 font-medium">
                  {workers.length} người lao động
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3">Mã NV</th>
                      <th className="px-3 py-3">Họ và tên</th>
                      <th className="px-3 py-3">Số CCCD</th>
                      <th className="px-3 py-3">Mã số thuế</th>
                      <th className="px-3 py-3">Tài khoản NH</th>
                      <th className="px-3 py-3">Phân loại an sinh</th>
                      <th className="px-3 py-3 text-right">Hạn mức ngân sách</th>
                      <th className="px-3 py-3 text-right">Đã nghiệm thu (Gross)</th>
                      <th className="px-3 py-3 text-right">Thuế TNCN</th>
                      <th className="px-3 py-3 text-right">Thực lĩnh Net</th>
                      <th className="px-3 py-3 text-center">Tỷ lệ</th>
                      <th className="px-3 py-3">Trạng thái hạn mức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {workers.map(w => {
                      const workerAcceptances = acceptances.filter(a => a.workerId === w.id);
                      const gross = workerAcceptances.reduce((s, a) => s + a.grossAmount, 0);
                      const tax = workerAcceptances.reduce((s, a) => s + a.taxAmount, 0);
                      const net = workerAcceptances.reduce((s, a) => s + a.netAmount, 0);
                      const pct = w.allocatedBudget > 0 ? (gross / w.allocatedBudget) * 100 : 0;

                      return (
                        <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3 font-mono font-medium text-slate-600">{w.id}</td>
                          <td className="px-3 py-3 font-bold text-slate-900">{w.fullName}</td>
                          <td className="px-3 py-3 font-mono text-slate-600">{w.cccdNumber}</td>
                          <td className="px-3 py-3 font-mono text-slate-600">{w.taxCode}</td>
                          <td className="px-3 py-3">
                            <span className="font-mono text-slate-800">{w.bankAccount}</span>
                            <div className="text-[10px] text-slate-500">{w.bankName}</div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              w.socialStatus === 'retired' 
                                ? 'bg-amber-100 text-amber-800'
                                : w.socialStatus === 'dual_employer'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {w.socialStatus === 'retired' ? 'Hưu trí (Miễn BHXH)' : w.socialStatus === 'dual_employer' ? 'BHXH Đơn vị 1' : 'Tự do'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-slate-700">{formatNumber(w.allocatedBudget)} đ</td>
                          <td className="px-3 py-3 text-right font-bold text-emerald-700">{formatNumber(gross)} đ</td>
                          <td className="px-3 py-3 text-right text-rose-600">{tax > 0 ? `-${formatNumber(tax)} đ` : '0 đ'}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-900">{formatNumber(net)} đ</td>
                          <td className="px-3 py-3 text-center font-bold">
                            <span className={pct >= 85 ? 'text-rose-600' : 'text-slate-700'}>
                              {pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {pct >= 100 ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">VƯỢT HẠN MỨC</span>
                            ) : pct >= 85 ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">Chạm trần (&gt;=85%)</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-medium rounded">An toàn</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: HỢP ĐỒNG GIAO KHOÁN */}
          {activeSheetTab === 'sheet2' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-sky-50/70 p-4 rounded-xl border border-sky-100">
                <div>
                  <h3 className="font-bold text-sky-950 text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    Trang tính 2: Danh Sách Hợp Đồng Giao Khoán (2_HopDong_GiaoKhoan)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Lưu trữ toàn bộ các loại hợp đồng, phân biệt rõ ràng giữa hợp đồng bốc dỡ Hóa vận Ga và vệ sinh toa xe.
                  </p>
                </div>
                <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-sky-200 text-sky-800 font-medium">
                  {contracts.length} hợp đồng
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3">Số Hợp đồng</th>
                      <th className="px-3 py-3">Loại hợp đồng</th>
                      <th className="px-3 py-3">Người nhận khoán</th>
                      <th className="px-3 py-3">Ga tác nghiệp</th>
                      <th className="px-3 py-3">Ngày ký</th>
                      <th className="px-3 py-3">Thời hạn</th>
                      <th className="px-3 py-3 text-right">Đơn giá khoán</th>
                      <th className="px-3 py-3 text-center">Số đợt NT</th>
                      <th className="px-3 py-3 text-right">Tổng nghiệm thu</th>
                      <th className="px-3 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contracts.map(c => {
                      const worker = workerMap.get(c.workerId);
                      const cAcceptances = acceptances.filter(a => a.contractId === c.id);
                      const totalGross = cAcceptances.reduce((s, a) => s + a.grossAmount, 0);

                      return (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3 font-mono font-bold text-sky-900">{c.contractNumber}</td>
                          <td className="px-3 py-3">
                            <span className="font-semibold text-slate-800">
                              {c.templateType === 'CARGO_PRINCIPLE_VTHN' 
                                ? 'HĐNT Bốc xếp Hóa vận Ga (PDF)' 
                                : c.templateType === 'CARGO_DUAL_EMPLOYER'
                                ? 'Bốc xếp (BHXH Đơn vị 1)'
                                : c.templateType === 'CLEANING_RETIRED'
                                ? 'Vệ sinh/Bốc dỡ (Hưu trí)'
                                : 'Vệ sinh vỏ xe (Tự do)'}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-900">{worker?.fullName}</td>
                          <td className="px-3 py-3 text-slate-700">{c.stationLocation}</td>
                          <td className="px-3 py-3 text-slate-600">{c.signDate}</td>
                          <td className="px-3 py-3 text-slate-600">{c.startDate} → {c.endDate}</td>
                          <td className="px-3 py-3 text-right text-slate-800">
                            {c.rateExteriorWash ? <div>Rửa ngoài: {formatNumber(c.rateExteriorWash)} đ/toa</div> : null}
                            {c.rateInteriorWash ? <div>Rửa trong: {formatNumber(c.rateInteriorWash)} đ/toa</div> : null}
                            {c.rateCargoPackage ? <div>Bao kiện: {formatNumber(c.rateCargoPackage)} đ/tấn</div> : null}
                            {c.rateCargoBulk ? <div>Hàng rời: {formatNumber(c.rateCargoBulk)} đ/tấn</div> : null}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-700">{cAcceptances.length}</td>
                          <td className="px-3 py-3 text-right font-bold text-emerald-700">{formatNumber(totalGross)} đ</td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              HIỆU LỰC
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CHI TIẾT NGHIỆM THU */}
          {activeSheetTab === 'sheet3' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-xl border border-amber-100">
                <div>
                  <h3 className="font-bold text-amber-950 text-sm sm:text-base flex items-center gap-2">
                    <Table className="w-4 h-4 text-amber-600" />
                    Trang tính 3: Nhật Ký Nghiệm Thu Từng Toa Xe & Tấn Hàng (3_NghiemThu_HoaVan)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Dữ liệu dòng chi tiết phục vụ kiểm tra chéo với vận đơn tàu hỏa, số hiệu toa xe và kế hoạch dồn dịch ga.
                  </p>
                </div>
                <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-amber-800 font-medium">
                  {acceptances.reduce((acc, curr) => acc + curr.items.length, 0)} dòng tác nghiệp
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3">Số Biên bản</th>
                      <th className="px-3 py-3">Ngày thực hiện</th>
                      <th className="px-3 py-3">Ga / Bộ phận</th>
                      <th className="px-3 py-3">Người nhận khoán</th>
                      <th className="px-3 py-3">Số hiệu toa xe / Nội dung</th>
                      <th className="px-3 py-3 text-center">Khối lượng</th>
                      <th className="px-3 py-3 text-right">Đơn giá</th>
                      <th className="px-3 py-3 text-right">Thành tiền</th>
                      <th className="px-3 py-3">Đại diện Ga (Bên A)</th>
                      <th className="px-3 py-3">Đánh giá chất lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {acceptances.map(report => (
                      <React.Fragment key={report.id}>
                        {report.items.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                              {idx === 0 ? report.reportNumber : ''}
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">{item.workDate}</td>
                            <td className="px-3 py-2.5 text-slate-700">{report.workStation}</td>
                            <td className="px-3 py-2.5 font-medium text-slate-900">{report.representativeB}</td>
                            <td className="px-3 py-2.5">
                              <div className="font-semibold text-slate-900">{item.wagonOrBatchNumber}</div>
                              <div className="text-[11px] text-slate-500">{item.description}</div>
                            </td>
                            <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-700">{formatNumber(item.unitPrice)} đ</td>
                            <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{formatNumber(item.amount)} đ</td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {report.representativeA} ({report.roleA})
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">{item.notes || 'Đạt chuẩn kỹ thuật'}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: THUẾ TNCN & CHI TRẢ */}
          {activeSheetTab === 'sheet4' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 p-4 rounded-xl border border-purple-100">
                <div>
                  <h3 className="font-bold text-purple-950 text-sm sm:text-base flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-purple-600" />
                    Trang tính 4: Theo Dõi Thuế TNCN & Thanh Toán Chi Trả (4_TheoDoi_ThueTNCN_ChiTra)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tuân thủ chặt chẽ Nghị định 253/2026/NĐ-CP: Tự động xác định điều kiện khấu trừ 10% và đối soát số tài khoản, UNC.
                  </p>
                </div>
                <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-purple-200 text-purple-800 font-medium">
                  {acceptances.length} đợt nghiệm thu thanh toán
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-3">Số Biên bản</th>
                      <th className="px-3 py-3">Ngày lập BB</th>
                      <th className="px-3 py-3">Người nhận khoán</th>
                      <th className="px-3 py-3">Đối tượng</th>
                      <th className="px-3 py-3 text-center">Cam kết 08/CK-TNCN</th>
                      <th className="px-3 py-3 text-right">Tổng trước thuế (Gross)</th>
                      <th className="px-3 py-3">Quy tắc NĐ 253/2026</th>
                      <th className="px-3 py-3 text-right">Thuế khấu trừ (10%)</th>
                      <th className="px-3 py-3 text-right">Thực chi Net</th>
                      <th className="px-3 py-3">Trạng thái thanh toán</th>
                      <th className="px-3 py-3">Số UNC / Phiếu chi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {acceptances.map(report => {
                      const worker = workerMap.get(report.workerId);

                      return (
                        <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3 font-mono font-bold text-slate-800">{report.reportNumber}</td>
                          <td className="px-3 py-3 text-slate-600">{report.acceptanceDate}</td>
                          <td className="px-3 py-3 font-semibold text-slate-900">{report.representativeB}</td>
                          <td className="px-3 py-3">
                            <span className="text-[11px] text-slate-600">
                              {worker?.socialStatus === 'retired' ? 'Hưu trí' : worker?.socialStatus === 'dual_employer' ? 'BHXH đơn vị 1' : 'Tự do'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {worker?.hasTaxCommitmentForm ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded">Đã nộp</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">Chưa nộp</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-900">{formatNumber(report.grossAmount)} đ</td>
                          <td className="px-3 py-3">
                            {report.grossAmount < 5000000 ? (
                              <span className="text-slate-500 text-[11px]">&lt; 5 triệu (Miễn)</span>
                            ) : report.isTaxWithheld ? (
                              <span className="text-rose-700 font-semibold text-[11px]">Khấu trừ 10% tại nguồn</span>
                            ) : (
                              <span className="text-emerald-700 font-medium text-[11px]">Tạm miễn (Có Cam kết)</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-rose-600">
                            {report.taxAmount > 0 ? `-${formatNumber(report.taxAmount)} đ` : '0 đ'}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-emerald-700">{formatNumber(report.netAmount)} đ</td>
                          <td className="px-3 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              report.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : report.paymentStatus === 'approved'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {report.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : report.paymentStatus === 'approved' ? 'Đã duyệt chi' : 'Chờ xử lý'}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-[11px] text-slate-600">
                            {report.paymentReference || 'Chưa phát hành'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DASHBOARD NGÂN SÁCH */}
          {activeSheetTab === 'sheet5' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-950 text-sm sm:text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Trang tính 5: Dashboard Giám Sát Ngân Sách & Cảnh Báo (5_Dashboard_NganSach)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tự động tổng hợp dữ liệu từ Sheet 1 và Sheet 4 bằng công thức Google Sheets: <code className="bg-white px-2 py-0.5 rounded text-indigo-800 font-mono text-xs">=SUMIF(...)</code>
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Ngân sách phê duyệt</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{formatVND(totalAllocated)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Hạn mức năm toàn Chi nhánh</div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-semibold text-emerald-700 uppercase">Đã nghiệm thu (Gross)</div>
                  <div className="text-xl font-bold text-emerald-800 mt-1">{formatVND(totalGross)}</div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Đã giải ngân: <strong>{((totalGross / totalAllocated) * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs font-semibold text-rose-700 uppercase">Thuế TNCN khấu trừ (10%)</div>
                  <div className="text-xl font-bold text-rose-800 mt-1">{formatVND(totalTax)}</div>
                  <div className="text-[11px] text-rose-700 mt-1">Theo NĐ 253/2026/NĐ-CP</div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-semibold text-blue-700 uppercase">Ngân sách còn lại</div>
                  <div className="text-xl font-bold text-blue-800 mt-1">{formatVND(totalRemaining)}</div>
                  <div className="text-[11px] text-blue-700 mt-1">
                    Dư địa khả dụng: <strong>{((totalRemaining / totalAllocated) * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">
                  Bảng tổng hợp đối soát ngân sách theo lao động (Google Sheet SUMIF Engine)
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">STT</th>
                      <th className="px-3 py-2.5">Họ và tên</th>
                      <th className="px-3 py-2.5 text-right">Ngân sách giao</th>
                      <th className="px-3 py-2.5 text-right">Đã nghiệm thu (Gross)</th>
                      <th className="px-3 py-2.5 text-right">Thuế TNCN</th>
                      <th className="px-3 py-2.5 text-right">Thực chi Net</th>
                      <th className="px-3 py-2.5 text-right">Còn lại</th>
                      <th className="px-3 py-2.5 text-center">Tiến độ</th>
                      <th className="px-3 py-2.5">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {workers.map((w, idx) => {
                      const wAcceptances = acceptances.filter(a => a.workerId === w.id);
                      const gross = wAcceptances.reduce((s, a) => s + a.grossAmount, 0);
                      const tax = wAcceptances.reduce((s, a) => s + a.taxAmount, 0);
                      const net = wAcceptances.reduce((s, a) => s + a.netAmount, 0);
                      const rem = w.allocatedBudget - gross;
                      const pct = w.allocatedBudget > 0 ? (gross / w.allocatedBudget) * 100 : 0;

                      return (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2.5 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-900">{w.fullName}</td>
                          <td className="px-3 py-2.5 text-right text-slate-700">{formatNumber(w.allocatedBudget)} đ</td>
                          <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{formatNumber(gross)} đ</td>
                          <td className="px-3 py-2.5 text-right text-rose-600">{tax > 0 ? `-${formatNumber(tax)} đ` : '0 đ'}</td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-900">{formatNumber(net)} đ</td>
                          <td className="px-3 py-2.5 text-right text-blue-700 font-semibold">{formatNumber(rem)} đ</td>
                          <td className="px-3 py-2.5 text-center font-bold">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${pct >= 100 ? 'bg-red-500' : pct >= 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="text-[11px]">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            {pct >= 100 ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">VƯỢT NGÂN SÁCH</span>
                            ) : pct >= 85 ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">Cảnh báo chạm trần</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-medium rounded">Bình thường</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: HƯỚNG DẪN & CÔNG THỨC */}
          {activeSheetTab === 'sheet6' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  Trang tính 6: Hướng Dẫn Vận Hành Google Sheets & Bộ Công Thức Mẫu (6_HuongDan_GoogleSheet)
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Tài liệu hướng dẫn trực tiếp giúp Chi nhánh Vận tải đường sắt Nha Trang đưa file lên Google Drive và thiết lập tự động hóa.
                </p>
              </div>

              {/* Step by step to Google Drive */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">1</div>
                  <h4 className="font-bold text-sm text-slate-800">Tải file lên Google Drive</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tải file <strong className="text-emerald-700">.xlsx</strong> từ ứng dụng về máy tính. Mở <strong>drive.google.com</strong>, kéo thả tệp vào thư mục quản lý hợp đồng của Chi nhánh.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">2</div>
                  <h4 className="font-bold text-sm text-slate-800">Chuyển sang Google Trang tính</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Nhấp chuột phải vào file đã tải lên -&gt; Chọn <strong>"Mở bằng Google Trang tính"</strong> (Open with Google Sheets). Google sẽ lưu thành 1 file Google Sheets gốc trực tuyến.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">3</div>
                  <h4 className="font-bold text-sm text-slate-800">Phân quyền Chia sẻ (Share)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Khóa các ô công thức bằng tính năng <em>"Bảo vệ dải ô" (Protect range)</em>. Cấp quyền Editor cho Trực ban Hóa vận Ga nhập số toa và Kế toán Chi nhánh duyệt chi.
                  </p>
                </div>
              </div>

              {/* Ready-to-copy formula library */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Bộ công thức Google Sheets chuẩn áp dụng tự động trong bảng tính:
                </h4>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans uppercase mb-1">
                        1. Tính tổng tiền Gross của từng người lao động từ bảng chi trả:
                      </span>
                      <code>=SUMIF('4_TheoDoi_ThueTNCN_ChiTra'!C:C, B2, '4_TheoDoi_ThueTNCN_ChiTra'!I:I)</code>
                    </div>
                    <button
                      onClick={() => handleCopyFormula("=SUMIF('4_TheoDoi_ThueTNCN_ChiTra'!C:C, B2, '4_TheoDoi_ThueTNCN_ChiTra'!I:I)", 'f1')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedFormula === 'f1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedFormula === 'f1' ? 'Đã sao chép' : 'Copy'}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans uppercase mb-1">
                        2. Tự động kiểm tra khấu trừ 10% thuế TNCN theo NĐ 253/2026/NĐ-CP:
                      </span>
                      <code>=IF(AND(I2&gt;=5000000, H2="CHƯA NỘP"), I2*10%, 0)</code>
                    </div>
                    <button
                      onClick={() => handleCopyFormula('=IF(AND(I2>=5000000, H2="CHƯA NỘP"), I2*10%, 0)', 'f2')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedFormula === 'f2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedFormula === 'f2' ? 'Đã sao chép' : 'Copy'}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-sans uppercase mb-1">
                        3. Cảnh báo tự động khi ngân sách vượt hạn mức hoặc chạm trần:
                      </span>
                      <code>=IF(T2&gt;=100%, "VƯỢT HẠN MỨC", IF(T2&gt;=85%, "CẢNH BÁO CHẠM TRẦN", "AN TOÀN"))</code>
                    </div>
                    <button
                      onClick={() => handleCopyFormula('=IF(T2>=100%, "VƯỢT HẠN MỨC", IF(T2>=85%, "CẢNH BÁO CHẠM TRẦN", "AN TOÀN"))', 'f3')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedFormula === 'f3' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedFormula === 'f3' ? 'Đã sao chép' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
