import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  Phone, 
  MapPin,
  Table as TableIcon,
  LayoutGrid,
  Filter,
  DollarSign,
  FileCheck,
  FileX,
  UserCheck,
  Lock,
  Eye,
} from 'lucide-react';
import { WorkerContractor, SocialInsuranceStatus } from '../types';
import { formatNumber, formatVND } from '../services/numberToWords';
import { FormattedNumberInput } from './FormattedNumberInput';
import { UserRole } from '../types';
import { getUserRoleProfile } from '../services/authRoles';

interface WorkerDirectoryProps {
  workers: WorkerContractor[];
  onSaveWorker: (worker: WorkerContractor) => void;
  onDeleteWorker: (workerId: string) => void;
  currentRole?: UserRole;
}

type FilterStatus = 'all' | 'freelance' | 'retired' | 'dual_employer' | 'has_tax_form' | 'no_tax_form';
type ViewMode = 'table' | 'grid';

export const WorkerDirectory: React.FC<WorkerDirectoryProps> = ({
  workers,
  onSaveWorker,
  onDeleteWorker,
  currentRole = 'admin',
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const canEdit = roleProfile.canEditWorker;
  const canCreate = roleProfile.canCreateWorker;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerContractor | null>(null);
  const [workerToDelete, setWorkerToDelete] = useState<WorkerContractor | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1985-01-01');
  const [cccdNumber, setCccdNumber] = useState('');
  const [cccdDate, setCccdDate] = useState('2022-01-01');
  const [cccdPlace, setCccdPlace] = useState('Cục Cảnh sát QLHC về TTXH');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [phone, setPhone] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('Vietcombank - CN Khánh Hòa');
  const [socialStatus, setSocialStatus] = useState<SocialInsuranceStatus>('freelance');
  const [pensionBookNumber, setPensionBookNumber] = useState('');
  const [primaryEmployerName, setPrimaryEmployerName] = useState('');
  const [primaryLaborContractNo, setPrimaryLaborContractNo] = useState('');
  const [primaryBhxhCode, setPrimaryBhxhCode] = useState('');
  const [hasTaxCommitmentForm, setHasTaxCommitmentForm] = useState(false);
  const [allocatedBudget, setAllocatedBudget] = useState<number>(50000000);
  const [notes, setNotes] = useState('');

  // Statistics calculation
  const totalWorkers = workers.length;
  const totalBudget = workers.reduce((sum, w) => sum + (w.allocatedBudget || 0), 0);
  const workersWithTaxForm = workers.filter(w => w.hasTaxCommitmentForm).length;
  const workersNeedWithholding = totalWorkers - workersWithTaxForm;

  const openCreateModal = () => {
    setEditingWorker(null);
    setFullName('');
    setBirthDate('1985-01-01');
    setCccdNumber('');
    setCccdDate('2022-01-01');
    setCccdPlace('Cục Cảnh sát QLHC về TTXH');
    setAddress('TP. Nha Trang, Tỉnh Khánh Hòa');
    setTaxCode('');
    setPhone('');
    setBankAccount('');
    setBankName('Vietcombank - CN Khánh Hòa');
    setSocialStatus('freelance');
    setPensionBookNumber('');
    setPrimaryEmployerName('');
    setPrimaryLaborContractNo('');
    setPrimaryBhxhCode('');
    setHasTaxCommitmentForm(false);
    setAllocatedBudget(50000000);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (w: WorkerContractor) => {
    setEditingWorker(w);
    setFullName(w.fullName);
    setBirthDate(w.birthDate);
    setCccdNumber(w.cccdNumber);
    setCccdDate(w.cccdDate);
    setCccdPlace(w.cccdPlace);
    setAddress(w.address);
    setTaxCode(w.taxCode);
    setPhone(w.phone);
    setBankAccount(w.bankAccount);
    setBankName(w.bankName);
    setSocialStatus(w.socialStatus);
    setPensionBookNumber(w.pensionBookNumber || '');
    setPrimaryEmployerName(w.primaryEmployerName || '');
    setPrimaryLaborContractNo(w.primaryLaborContractNo || '');
    setPrimaryBhxhCode(w.primaryBhxhCode || '');
    setHasTaxCommitmentForm(w.hasTaxCommitmentForm);
    setAllocatedBudget(w.allocatedBudget || 50000000);
    setNotes(w.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !cccdNumber.trim()) {
      alert('Vui lòng nhập Họ tên và số CCCD');
      return;
    }

    const worker: WorkerContractor = {
      id: editingWorker ? editingWorker.id : `w-${Date.now()}`,
      fullName,
      birthDate,
      cccdNumber,
      cccdDate,
      cccdPlace,
      address,
      taxCode,
      phone,
      bankAccount,
      bankName,
      socialStatus,
      pensionBookNumber: socialStatus === 'retired' ? pensionBookNumber : undefined,
      primaryEmployerName: socialStatus === 'dual_employer' ? primaryEmployerName : undefined,
      primaryLaborContractNo: socialStatus === 'dual_employer' ? primaryLaborContractNo : undefined,
      primaryBhxhCode: socialStatus === 'dual_employer' ? primaryBhxhCode : undefined,
      hasTaxCommitmentForm: socialStatus === 'dual_employer' ? false : hasTaxCommitmentForm,
      allocatedBudget: Number(allocatedBudget),
      notes,
      createdAt: editingWorker ? editingWorker.createdAt : new Date().toISOString(),
    };

    onSaveWorker(worker);
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (workerToDelete) {
      onDeleteWorker(workerToDelete.id);
      setWorkerToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredWorkers = workers.filter(w => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      w.fullName.toLowerCase().includes(term) ||
      w.cccdNumber.includes(term) ||
      w.address.toLowerCase().includes(term) ||
      w.taxCode.includes(term) ||
      w.phone.includes(term) ||
      w.bankAccount.includes(term)
    );

    if (!matchesSearch) return false;

    if (statusFilter === 'freelance') return w.socialStatus === 'freelance';
    if (statusFilter === 'retired') return w.socialStatus === 'retired';
    if (statusFilter === 'dual_employer') return w.socialStatus === 'dual_employer';
    if (statusFilter === 'has_tax_form') return w.hasTaxCommitmentForm;
    if (statusFilter === 'no_tax_form') return !w.hasTaxCommitmentForm;

    return true;
  });

  return (
    <div className="space-y-5">
      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Tổng số lao động</span>
          </div>
          <div className="text-lg font-bold text-slate-900">
            {totalWorkers} <span className="text-xs font-normal text-slate-500">người</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tổng ngân sách giao khoán</span>
          </div>
          <div className="text-lg font-bold text-blue-700 font-mono">
            {formatNumber(totalBudget)} <span className="text-xs font-normal text-slate-500">₫</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã nộp cam kết 08/CK</span>
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {workersWithTaxForm} <span className="text-xs font-normal text-slate-500">hồ sơ (Miễn 10%)</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <FileX className="w-3.5 h-3.5 text-amber-600" />
            <span>Chưa nộp 08/CK</span>
          </div>
          <div className="text-lg font-bold text-amber-700">
            {workersNeedWithholding} <span className="text-xs font-normal text-slate-500">hồ sơ (Trừ 10%)</span>
          </div>
        </div>
      </div>

      {/* Control bar: Search, Filter Tabs, View Switcher & Add Worker */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, CCCD, MST, SĐT, số tài khoản, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Mode Switcher and Create Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng bảng lưới dữ liệu chuẩn hành chính"
              >
                <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Bảng lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Xem dạng thẻ lưới thông tin trực quan"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                <span>Thẻ lưới</span>
              </button>
            </div>

            {canCreate ? (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Hồ Sơ Lao Động</span>
              </button>
            ) : (
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg"
                title="Chỉ Admin mới có quyền thêm hoặc sửa hồ sơ người nhận khoán"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Trạm: Xem danh bạ</span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-400 flex items-center gap-1 pr-1 text-[11px]">
            <Filter className="w-3 h-3" /> Lọc:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({workers.length})
          </button>
          <button
            onClick={() => setStatusFilter('freelance')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'freelance'
                ? 'bg-blue-600 text-white font-medium'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Tự do vãng lai ({workers.filter(w => w.socialStatus === 'freelance').length})
          </button>
          <button
            onClick={() => setStatusFilter('retired')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'retired'
                ? 'bg-emerald-600 text-white font-medium'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Hưu trí ({workers.filter(w => w.socialStatus === 'retired').length})
          </button>
          <button
            onClick={() => setStatusFilter('dual_employer')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'dual_employer'
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Có BHXH đơn vị 1 ({workers.filter(w => w.socialStatus === 'dual_employer').length})
          </button>
          <button
            onClick={() => setStatusFilter('has_tax_form')}
            className={`px-2.5 py-1 rounded-full cursor-pointer transition-colors whitespace-nowrap ${
              statusFilter === 'has_tax_form'
                ? 'bg-teal-600 text-white font-medium'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            Đã nộp 08/CK ({workers.filter(w => w.hasTaxCommitmentForm).length})
          </button>
        </div>
      </div>

      {/* Main Content: Bảng Lưới (Table View) or Thẻ Lưới (Card Grid) */}
      {viewMode === 'table' ? (
        /* DẠNG BẢNG LƯỚI (DATA GRID TABLE VIEW) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center border-r border-slate-200">STT</th>
                  <th className="py-3 px-4 min-w-[200px] border-r border-slate-200">Họ tên & CCCD</th>
                  <th className="py-3 px-3 min-w-[140px] border-r border-slate-200">Chế độ an sinh / BHXH</th>
                  <th className="py-3 px-4 min-w-[220px] border-r border-slate-200">Địa chỉ & Liên hệ</th>
                  <th className="py-3 px-4 min-w-[200px] border-r border-slate-200">Tài khoản Ngân hàng</th>
                  <th className="py-3 px-3 min-w-[150px] border-r border-slate-200">Mã số thuế & 08/CK</th>
                  <th className="py-3 px-4 min-w-[140px] text-right border-r border-slate-200">Hạn mức ngân sách</th>
                  <th className="py-3 px-3 w-24 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      Không tìm thấy hồ sơ người nhận khoán nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Họ tên & CCCD */}
                      <td className="py-3.5 px-4 border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {getInitials(w.fullName)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">{w.fullName}</div>
                            <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                              CCCD: <strong className="text-slate-700">{w.cccdNumber}</strong>
                            </div>
                            {w.birthDate && (
                              <div className="text-[10px] text-slate-400">
                                Sinh năm: {w.birthDate.split('-')[0]}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Chế độ an sinh / BHXH */}
                      <td className="py-3.5 px-3 border-r border-slate-200">
                        <div>
                          <span
                            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${
                              w.socialStatus === 'retired'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : w.socialStatus === 'dual_employer'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {w.socialStatus === 'retired'
                              ? 'Hưu trí'
                              : w.socialStatus === 'dual_employer'
                              ? 'Có BHXH đơn vị 1'
                              : 'Tự do vãng lai'}
                          </span>

                          {w.socialStatus === 'retired' && w.pensionBookNumber && (
                            <div className="text-[10px] text-slate-500 mt-1 font-mono">
                              Sổ: {w.pensionBookNumber}
                            </div>
                          )}

                          {w.socialStatus === 'dual_employer' && w.primaryEmployerName && (
                            <div className="text-[10px] text-slate-500 mt-1 line-clamp-1" title={w.primaryEmployerName}>
                              {w.primaryEmployerName}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Địa chỉ & Liên hệ */}
                      <td className="py-3.5 px-4 border-r border-slate-200">
                        <div className="space-y-1">
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="leading-snug">{w.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{w.phone || 'Chưa cập nhật SĐT'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Tài khoản Ngân hàng */}
                      <td className="py-3.5 px-4 border-r border-slate-200">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-900 font-mono font-semibold text-[12px]">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{w.bankAccount || 'Chưa có STK'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 pl-5">
                            {w.bankName || 'Ngân hàng chưa cập nhật'}
                          </div>
                        </div>
                      </td>

                      {/* Mã số thuế & 08/CK */}
                      <td className="py-3.5 px-3 border-r border-slate-200">
                        <div className="space-y-1.5">
                          <div className="text-slate-800 font-mono text-[11px]">
                            MST: <strong>{w.taxCode || 'Chưa có'}</strong>
                          </div>
                          <div>
                            {w.hasTaxCommitmentForm ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Đã nộp 08/CK (Miễn 10%)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded">
                                <AlertCircle className="w-3 h-3" />
                                <span>Chưa nộp (Khấu trừ 10%)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Hạn mức ngân sách */}
                      <td className="py-3.5 px-4 text-right border-r border-slate-200">
                        <div className="font-mono font-bold text-blue-700 text-[13px]">
                          {formatNumber(w.allocatedBudget)} ₫
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Trần chi trả năm
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(w)}
                            title={canEdit ? 'Chỉnh sửa thông tin hồ sơ' : 'Xem chi tiết thông tin hồ sơ (Trạm chỉ xem)'}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            {canEdit ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => setWorkerToDelete(w)}
                              title="Xóa hồ sơ người nhận khoán"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Hiển thị <strong>{filteredWorkers.length}</strong> / {workers.length} hồ sơ lao động nhận khoán</span>
            <span>Chi nhánh Vận tải đường sắt Nha Trang</span>
          </div>
        </div>
      ) : (
        /* DẠNG THẺ LƯỚI (STRUCTURED CARD GRID VIEW) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredWorkers.map((w) => (
            <div
              key={w.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {getInitials(w.fullName)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{w.fullName}</h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        CCCD: <strong className="text-slate-800">{w.cccdNumber}</strong>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                      w.socialStatus === 'retired'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : w.socialStatus === 'dual_employer'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {w.socialStatus === 'retired'
                      ? 'Hưu trí'
                      : w.socialStatus === 'dual_employer'
                      ? 'Có BHXH đơn vị 1'
                      : 'Tự do vãng lai'}
                  </span>
                </div>
              </div>

              {/* Card Middle: Thông tin liên hệ & Ngân hàng */}
              <div className="p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-800 leading-snug">{w.address}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-700 font-medium">{w.phone || 'Chưa có SĐT'}</span>
                </div>
                <div className="flex items-center gap-2 font-mono pt-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-900 font-semibold">{w.bankAccount}</span>
                  <span className="text-slate-500 text-[11px] truncate">({w.bankName})</span>
                </div>
              </div>

              {/* Card Bottom: Lưới thông số Tài chính & Thuế (Structured Grid) */}
              <div className="mx-4 mb-3 border border-slate-200 rounded-lg bg-slate-50/80 overflow-hidden text-xs">
                <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                  <div className="p-2.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Mã số thuế</div>
                    <div className="font-mono font-bold text-slate-800">{w.taxCode || 'Chưa có'}</div>
                  </div>
                  <div className="p-2.5 text-right">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Hạn mức ngân sách</div>
                    <div className="font-mono font-bold text-blue-700">{formatNumber(w.allocatedBudget)} ₫</div>
                  </div>
                </div>

                <div className="px-3 py-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Cam kết thu nhập 08/CK:</span>
                  {w.hasTaxCommitmentForm ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã nộp (Miễn trừ 10%)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Chưa nộp (Khấu trừ 10%)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/50 border-t border-slate-100">
                {canEdit && (
                  <button
                    onClick={() => setWorkerToDelete(w)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                )}
                <button
                  onClick={() => openEditModal(w)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md shadow-2xs transition-colors cursor-pointer"
                >
                  {canEdit ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chỉnh sửa hồ sơ</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Xem chi tiết (Trạm)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {workerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Xác nhận xóa hồ sơ lao động</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bạn có chắc muốn xóa hồ sơ của <strong>{workerToDelete.fullName}</strong> (CCCD: {workerToDelete.cccdNumber})?
                </p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-200">
              Lưu ý: Hành động này sẽ loại bỏ người này khỏi danh bạ người nhận khoán của đơn vị.
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWorkerToDelete(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {canEdit
                    ? (editingWorker ? 'Chỉnh Sửa Hồ Sơ Người Nhận Khoán' : 'Thêm Người Nhận Khoán Mới')
                    : 'Xem Chi Tiết Hồ Sơ Người Nhận Khoán (Trạm chỉ xem)'}
                </h2>
                {!canEdit && (
                  <p className="text-xs text-amber-700 mt-0.5">
                    Chế độ chỉ xem. Chỉ Admin Chi nhánh mới có thẩm quyền chỉnh sửa hồ sơ người nhận khoán.
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Nguyễn Văn Hùng"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ngày Sinh</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Số CCCD <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cccdNumber}
                    onChange={(e) => setCccdNumber(e.target.value)}
                    placeholder="12 chữ số"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ngày Cấp</label>
                  <input
                    type="date"
                    value={cccdDate}
                    onChange={(e) => setCccdDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nơi Cấp</label>
                  <input
                    type="text"
                    value={cccdPlace}
                    onChange={(e) => setCccdPlace(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Địa Chỉ Thường Trú</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Địa chỉ cụ thể ghi trên CCCD"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mã Số Thuế Cá Nhân</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="MST cá nhân"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0913..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Hạn Mức Ngân Sách</label>
                  <FormattedNumberInput
                    value={allocatedBudget}
                    onChange={setAllocatedBudget}
                    suffix="VNĐ"
                    placeholder="50.000.000"
                    className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Đã nhập: <strong className="text-emerald-700">{formatVND(allocatedBudget)}</strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Số Tài Khoản Ngân Hàng</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Số tài khoản"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tên Ngân Hàng - Chi Nhánh</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="VD: Vietcombank - CN Khánh Hòa"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Tình trạng an sinh BHXH */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Chế Độ An Sinh Xã Hội (Căn cứ Luật BHXH 2024)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="socialStatus"
                      checked={socialStatus === 'freelance'}
                      onChange={() => setSocialStatus('freelance')}
                    />
                    <span>Tự do vãng lai</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="socialStatus"
                      checked={socialStatus === 'retired'}
                      onChange={() => setSocialStatus('retired')}
                    />
                    <span>Hưởng chế độ hưu trí</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="socialStatus"
                      checked={socialStatus === 'dual_employer'}
                      onChange={() => setSocialStatus('dual_employer')}
                    />
                    <span>Đang đóng BHXH đơn vị 1</span>
                  </label>
                </div>

                {socialStatus === 'retired' && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Số Sổ BHXH / Thẻ Hưu Trí</label>
                    <input
                      type="text"
                      value={pensionBookNumber}
                      onChange={(e) => setPensionBookNumber(e.target.value)}
                      placeholder="VD: 56982341 (Thẻ hưu trí BHXH Khánh Hòa)"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                )}

                {socialStatus === 'dual_employer' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Đơn vị công tác chính</label>
                      <input
                        type="text"
                        value={primaryEmployerName}
                        onChange={(e) => setPrimaryEmployerName(e.target.value)}
                        placeholder="Tên công ty/cơ quan"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Số HĐLĐ đơn vị 1</label>
                      <input
                        type="text"
                        value={primaryLaborContractNo}
                        onChange={(e) => setPrimaryLaborContractNo(e.target.value)}
                        placeholder="HĐLĐ số..."
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Mã số BHXH / VssID</label>
                      <input
                        type="text"
                        value={primaryBhxhCode}
                        onChange={(e) => setPrimaryBhxhCode(e.target.value)}
                        placeholder="Mã BHXH..."
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono"
                      />
                    </div>
                  </div>
                )}

                {socialStatus !== 'dual_employer' && (
                  <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasTaxCommitmentForm}
                      onChange={(e) => setHasTaxCommitmentForm(e.target.checked)}
                      className="rounded"
                    />
                    <span>
                      Đã ký Bản cam kết thu nhập 08/CK-TNCN (Cá nhân duy nhất có 1 nguồn thu chưa đến mức nộp thuế)
                    </span>
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  {canEdit ? 'Hủy' : 'Đóng (Chỉ Xem)'}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Lưu Hồ Sơ
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
