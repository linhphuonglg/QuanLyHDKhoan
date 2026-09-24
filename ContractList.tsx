import React, { useState } from 'react';
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
  BookOpen
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
  onNewAcceptanceForContract,
  currentRole = 'admin',
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const canEdit = roleProfile.canEditContractContent;

  const [searchTerm, setSearchTerm] = useState('');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');

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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Ngân Sách Giao</span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatVND(totalAllocatedBudget)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Định mức phân bổ cho các lao động</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đã Xác Nhận Nghiệm Thu</span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
              {formatVND(totalConfirmedGross)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đạt {totalAllocatedBudget > 0 ? ((totalConfirmedGross / totalAllocatedBudget) * 100).toFixed(1) : 0}% ngân sách toàn Chi nhánh
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tuân Thủ Thuế & BHXH</span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-slate-900">NĐ 253/2026/NĐ-CP</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Tự động trừ 10% khi chi từ 5 triệu đồng</p>
        </div>
      </div>

      {/* Station Role Notice */}
      {!canEdit && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2.5">
            <Train className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <span className="font-bold">Chế độ phân quyền: {roleProfile.name}</span>
              <span className="text-blue-700 ml-1">
                — Trạm chỉ xem nội dung hợp đồng và lập biên bản nghiệm thu cho các hợp đồng tại ga của mình.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] bg-blue-200 text-blue-800 font-bold uppercase tracking-wider shrink-0">
            Trạm chỉ xem HĐ
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
              placeholder="Tìm kiếm theo số hợp đồng, tên người lao động, ga tác nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Tất cả mẫu hợp đồng</option>
              <option value="CLEANING_FREELANCE">Mẫu 1: Rửa toa xe vãng lai</option>
              <option value="CLEANING_RETIRED">Mẫu 2: Rửa toa xe hưu trí</option>
              <option value="CARGO_DUAL_EMPLOYER">Mẫu 3: Bốc dỡ hàng có BHXH</option>
              <option value="CARGO_PRINCIPLE_VTHN">Mẫu 4: HĐNT Bốc xếp Ga Hóa vận</option>
            </select>

            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="all">Tất cả Ga tàu</option>
              <option value="Nha Trang">Ga Nha Trang</option>
              <option value="Tuy Hòa">Ga Tuy Hòa</option>
              <option value="Diêu Trì">Ga Diêu Trì</option>
              <option value="Tháp Chàm">Ga Tháp Chàm</option>
              <option value="Diên Khánh">Ga Diên Khánh</option>
              <option value="Ninh Hòa">Ga Ninh Hòa</option>
            </select>

            {canEdit ? (
              <button
                onClick={onNewContract}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Hợp Đồng Mới</span>
              </button>
            ) : (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                title="Chỉ Admin mới có quyền tạo hợp đồng mới"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Trạm chỉ xem</span>
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
                <th className="py-3 px-4">Số Hợp Đồng & Ngày Ký</th>
                <th className="py-3 px-4">Người Nhận Khoán (Bên B)</th>
                <th className="py-3 px-4">Mẫu Hợp Đồng</th>
                <th className="py-3 px-4">Ga Tác Nghiệp</th>
                <th className="py-3 px-4 text-right">Đơn Giá Thỏa Thuận</th>
                <th className="py-3 px-4 text-center">Nghiệm Thu</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
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
                filteredContracts.map((contract) => {
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
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {contract.contractNumber}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Ký ngày {contract.signDate} · Thời hạn 01 năm
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {worker ? worker.fullName : 'Chưa gán'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          CCCD: {worker?.cccdNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${templateInfo.color}`}>
                          {templateInfo.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{contract.stationLocation}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {contract.templateType === 'CARGO_DUAL_EMPLOYER' ? (
                          <div>
                            <div>Kiện: {formatNumber(contract.rateCargoPackage)} đ/tấn</div>
                            <div className="text-slate-500 text-[10px]">Rời: {formatNumber(contract.rateCargoBulk)} đ/tấn</div>
                          </div>
                        ) : (
                          <div>
                            <div>Vỏ: {formatNumber(contract.rateExteriorWash)} đ/toa</div>
                            <div className="text-slate-500 text-[10px]">Nội thất: {formatNumber(contract.rateInteriorWash)} đ/toa</div>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-slate-900 font-mono tabular-nums">
                          {contractReports.length} đợt
                        </div>
                        <div className="text-[11px] text-emerald-600 font-mono tabular-nums">
                          {formatVND(totalPaidThisContract)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Hiệu lực</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectContract(contract)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Xem chi tiết & In văn bản"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Nút Nghiệm thu theo trạm */}
                          <button
                            onClick={() => onNewAcceptanceForContract(contract)}
                            className={`p-1.5 rounded-md transition-colors ${
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
                            className={`p-1.5 rounded-md transition-colors ${
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
