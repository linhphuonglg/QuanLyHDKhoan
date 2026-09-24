import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  FileSpreadsheet, 
  Building2, 
  DollarSign, 
  Users, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { WorkerContractor, Contract, AcceptanceReport, WorkerBudgetSummary } from '../types';
import { formatNumber, formatVND } from '../services/numberToWords';
import { exportBudgetSummaryToExcel } from '../services/exportExcel';

interface BudgetChartsProps {
  workers: WorkerContractor[];
  contracts: Contract[];
  acceptances: AcceptanceReport[];
  onSelectWorker: (workerId: string) => void;
}

export const BudgetCharts: React.FC<BudgetChartsProps> = ({
  workers,
  contracts,
  acceptances,
  onSelectWorker,
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('all');

  // Compute budget summaries for each worker
  const summaries: WorkerBudgetSummary[] = workers.map(worker => {
    const workerContracts = contracts.filter(c => c.workerId === worker.id);
    const workerReports = acceptances.filter(a => a.workerId === worker.id);

    const totalConfirmedGross = workerReports.reduce((sum, r) => sum + r.grossAmount, 0);
    const totalTaxWithheld = workerReports.reduce((sum, r) => sum + r.taxAmount, 0);
    const totalNetPaid = workerReports.reduce((sum, r) => sum + r.netAmount, 0);
    
    const allocatedBudget = worker.allocatedBudget || 50000000;
    const remainingBudget = Math.max(0, allocatedBudget - totalConfirmedGross);
    const percentUsed = allocatedBudget > 0 ? (totalConfirmedGross / allocatedBudget) * 100 : 0;

    let statusColor: WorkerBudgetSummary['statusColor'] = 'green';
    if (percentUsed >= 95) statusColor = 'red';
    else if (percentUsed >= 75) statusColor = 'amber';

    return {
      worker,
      allocatedBudget,
      totalConfirmedGross,
      totalTaxWithheld,
      totalNetPaid,
      remainingBudget,
      percentUsed,
      contractsCount: workerContracts.length,
      reportsCount: workerReports.length,
      statusColor,
    };
  });

  // Filter summaries if station selected
  const filteredSummaries = selectedStation === 'all' 
    ? summaries 
    : summaries.filter(s => {
        const workerContracts = contracts.filter(c => c.workerId === s.worker.id);
        return workerContracts.some(c => c.stationLocation.includes(selectedStation));
      });

  // Global Totals
  const totalAllocated = filteredSummaries.reduce((acc, s) => acc + s.allocatedBudget, 0);
  const totalGross = filteredSummaries.reduce((acc, s) => acc + s.totalConfirmedGross, 0);
  const totalTax = filteredSummaries.reduce((acc, s) => acc + s.totalTaxWithheld, 0);
  const totalNet = filteredSummaries.reduce((acc, s) => acc + s.totalNetPaid, 0);
  const overallPercent = totalAllocated > 0 ? (totalGross / totalAllocated) * 100 : 0;

  // Monthly breakdown for Chart 2
  const monthData: { [key: string]: { gross: number; net: number; tax: number; count: number } } = {};
  const months = ['01/2026', '02/2026', '03/2026', '04/2026', '05/2026', '06/2026', '07/2026', '08/2026', '09/2026'];
  
  months.forEach(m => {
    monthData[m] = { gross: 0, net: 0, tax: 0, count: 0 };
  });

  acceptances.forEach(a => {
    const parts = a.acceptanceDate.split('-');
    if (parts.length === 3) {
      const key = `${parts[1]}/${parts[0]}`;
      if (monthData[key]) {
        monthData[key].gross += a.grossAmount;
        monthData[key].net += a.netAmount;
        monthData[key].tax += a.taxAmount;
        monthData[key].count += 1;
      }
    }
  });

  const maxGrossMonthly = Math.max(...Object.values(monthData).map(d => d.gross), 10000000);

  // Highest worker budget for Chart 1 scaling
  const maxWorkerBudget = Math.max(...filteredSummaries.map(s => Math.max(s.allocatedBudget, s.totalConfirmedGross)), 50000000);

  const handleExportExcel = () => {
    exportBudgetSummaryToExcel(summaries);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Key Budget Stats */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                Theo Dõi Ngân Sách Khoán Chi Cho Từng Lao Động
              </span>
              <span className="text-xs text-slate-500 font-medium">
                · Chi nhánh Vận tải đường sắt Nha Trang
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kiểm soát hạn mức ngân sách, tiến độ nghiệm thu sản phẩm và nghĩa vụ thuế TNCN theo Nghị định 253/2026/NĐ-CP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Tất cả các Ga đường sắt</option>
              <option value="Nha Trang">Ga Nha Trang</option>
              <option value="Tháp Chàm">Ga Tháp Chàm</option>
              <option value="Diên Khánh">Ga Diên Khánh</option>
              <option value="Ninh Hòa">Ga Ninh Hòa</option>
            </select>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          <div>
            <span className="text-xs text-slate-500">Tổng Hạn Mức Ngân Sách:</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
              {formatVND(totalAllocated)}
            </div>
            <span className="text-[11px] text-slate-500">Phân bổ năm 2026</span>
          </div>

          <div>
            <span className="text-xs text-slate-500">Đã Xác Nhận Nghiệm Thu:</span>
            <div className="text-xl font-bold font-mono text-blue-600 mt-1 tabular-nums">
              {formatVND(totalGross)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[11px] font-bold text-blue-700 font-mono tabular-nums">
                {overallPercent.toFixed(1)}%
              </span>
              <span className="text-[11px] text-slate-500">hạn mức toàn chi nhánh</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500">Thuế TNCN Đã Khấu Trừ (10%):</span>
            <div className="text-xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
              {formatVND(totalTax)}
            </div>
            <span className="text-[11px] text-slate-500">Nộp ngân sách nhà nước</span>
          </div>

          <div>
            <span className="text-xs text-slate-500">Ngân Sách Khoán Còn Lại:</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
              {formatVND(Math.max(0, totalAllocated - totalGross))}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">An toàn trong hạn mức</span>
          </div>
        </div>
      </div>

      {/* CHART 1: SO SÁNH NGÂN SÁCH GIAO VS ĐÃ NGHIỆM THU TỪNG LAO ĐỘNG */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Biểu Đồ So Sánh: Ngân Sách Giao vs Đã Nghiệm Thu Từng Lao Động
            </h3>
            <p className="text-xs text-slate-500">
              So sánh trực quan giữa hạn mức ngân sách được duyệt và khối lượng thực tế đã xác nhận
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-slate-200"></div>
              <span className="text-slate-600">Ngân sách phân bổ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-blue-600"></div>
              <span className="text-slate-600">Đã nghiệm thu (Gross)</span>
            </div>
          </div>
        </div>

        {/* SVG Grouped Bar Chart */}
        <div className="pt-2">
          <div className="space-y-4">
            {filteredSummaries.map((s) => {
              const allocatedPct = (s.allocatedBudget / maxWorkerBudget) * 100;
              const grossPct = (s.totalConfirmedGross / maxWorkerBudget) * 100;

              return (
                <div key={s.worker.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{s.worker.fullName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">· CCCD: {s.worker.cccdNumber}</span>
                      {s.statusColor === 'red' && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                          Cảnh báo chạm trần
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
                      <span className="text-slate-500">
                        Hạn mức: {formatNumber(s.allocatedBudget)} ₫
                      </span>
                      <span className="font-bold text-blue-700">
                        Đã xác nhận: {formatNumber(s.totalConfirmedGross)} ₫ ({s.percentUsed.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar visualization */}
                  <div className="space-y-1">
                    {/* Budget allocated bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-300 h-full rounded-full transition-all duration-500"
                        style={{ width: `${allocatedPct}%` }}
                        title={`Ngân sách giao: ${formatVND(s.allocatedBudget)}`}
                      />
                    </div>
                    {/* Confirmed gross bar */}
                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.percentUsed >= 95 ? 'bg-red-500' : s.percentUsed >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${grossPct}%` }}
                        title={`Đã nghiệm thu: ${formatVND(s.totalConfirmedGross)}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHART 2: XU HƯỚNG NGHIỆM THU & GIẢI NGÂN THEO THÁNG */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Biến Động Chi Trả & Khấu Trừ Thuế 10% Theo Các Tháng (2026)
            </h3>
            <p className="text-xs text-slate-500">
              Phản ánh tiến độ giải phóng toa xe và vận chuyển hàng hóa qua các đợt cao điểm Tết, mùa hè
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-500"></div>
              <span className="text-slate-600">Thực lĩnh Net</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-amber-500"></div>
              <span className="text-slate-600">Thuế TNCN 10%</span>
            </div>
          </div>
        </div>

        {/* Visual Monthly Column Chart */}
        <div className="grid grid-cols-9 gap-2 items-end h-52 pt-8 px-2 border-b border-slate-200 pb-2">
          {months.map((m) => {
            const data = monthData[m];
            const netHeightPct = (data.net / maxGrossMonthly) * 100;
            const taxHeightPct = (data.tax / maxGrossMonthly) * 100;

            return (
              <div key={m} className="flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] p-1.5 rounded shadow-lg mb-1 pointer-events-none whitespace-nowrap z-10 font-mono">
                  <div>Gross: {formatNumber(data.gross)} ₫</div>
                  <div>Net: {formatNumber(data.net)} ₫</div>
                  {data.tax > 0 && <div>Thuế 10%: {formatNumber(data.tax)} ₫</div>}
                </div>

                {/* Stacked columns */}
                <div className="w-full max-w-[36px] flex flex-col justify-end">
                  {data.tax > 0 && (
                    <div
                      className="w-full bg-amber-500 rounded-t-xs transition-all duration-300"
                      style={{ height: `${Math.max(taxHeightPct, 2)}%` }}
                    />
                  )}
                  <div
                    className={`w-full bg-emerald-500 ${data.tax === 0 ? 'rounded-t-xs' : ''} transition-all duration-300`}
                    style={{ height: `${Math.max(netHeightPct, 4)}%` }}
                  />
                </div>

                {/* Month label */}
                <span className="text-[10px] font-mono text-slate-500 mt-2 whitespace-nowrap">
                  {m.split('/')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHI TIẾT THEO DÕI TỪNG NHÂN VIÊN */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Bảng Kê Chi Tiết Ngân Sách Từng Người Lao Động
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {filteredSummaries.length} nhân sự nhận khoán
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
              <tr>
                <th className="py-3 px-4">Người Lao Động</th>
                <th className="py-3 px-4">Đối Tượng An Sinh</th>
                <th className="py-3 px-4 text-right">Ngân Sách Giao</th>
                <th className="py-3 px-4 text-right">Đã Nghiệm Thu (Gross)</th>
                <th className="py-3 px-4 text-right">Thuế TNCN 10%</th>
                <th className="py-3 px-4 text-right">Thực Lĩnh (Net)</th>
                <th className="py-3 px-4 text-right">Ngân Sách Còn Lại</th>
                <th className="py-3 px-4 text-center">Tiến Độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map((s) => (
                <tr 
                  key={s.worker.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onSelectWorker(s.worker.id)}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{s.worker.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">CCCD: {s.worker.cccdNumber}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">
                      {s.worker.socialStatus === 'retired' ? 'Hưu trí (Đã có sổ hưu)' :
                       s.worker.socialStatus === 'dual_employer' ? 'Có BHXH đơn vị 1' : 'Tự do vãng lai'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {s.worker.hasTaxCommitmentForm ? 'Đã có Cam kết 08/CK' : 'Chưa có Cam kết thuế'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatNumber(s.allocatedBudget)} ₫
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700 tabular-nums">
                    {formatNumber(s.totalConfirmedGross)} ₫
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    {s.totalTaxWithheld > 0 ? (
                      <span className="text-amber-600 font-bold">{formatNumber(s.totalTaxWithheld)} ₫</span>
                    ) : (
                      <span className="text-slate-400">0 ₫</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 tabular-nums">
                    {formatNumber(s.totalNetPaid)} ₫
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700 tabular-nums">
                    {formatNumber(s.remainingBudget)} ₫
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums">
                      <span className={s.statusColor === 'red' ? 'text-red-600' : s.statusColor === 'amber' ? 'text-amber-600' : 'text-emerald-600'}>
                        {s.percentUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-16 bg-slate-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          s.statusColor === 'red' ? 'bg-red-500' : s.statusColor === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(s.percentUsed, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
