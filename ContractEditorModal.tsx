import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  PackageCheck,
  Shield, 
  Train, 
  Lock, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Sparkles,
  Info
} from 'lucide-react';
import { Contract, WorkerContractor, ContractTemplateType, UserRole, CustomContractContent } from '../types';
import { DEFAULT_PARTY_A } from '../data/mockData';
import { FormattedNumberInput } from './FormattedNumberInput';
import { formatNumber } from '../services/numberToWords';
import { getUserRoleProfile } from '../services/authRoles';
import { getDefaultContractClauses, getContractPages } from '../services/exportDoc';

interface ContractEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Contract) => void;
  workers: WorkerContractor[];
  contractToEdit?: Contract | null;
  currentRole?: UserRole;
}

export const ContractEditorModal: React.FC<ContractEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  workers,
  contractToEdit,
  currentRole = 'admin',
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const canEdit = roleProfile.canEditContractContent;

  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'clauses' | 'preview'>('basic');

  const [templateType, setTemplateType] = useState<ContractTemplateType>('CLEANING_FREELANCE');
  const [workerId, setWorkerId] = useState<string>('');
  const [contractNumber, setContractNumber] = useState<string>('');
  const [stationLocation, setStationLocation] = useState<string>('Ga Nha Trang');
  const [signDate, setSignDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [signPlace, setSignPlace] = useState<string>('Chi nhánh Vận tải đường sắt Nha Trang');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  
  // Rate numbers
  const [rateExteriorWash, setRateExteriorWash] = useState<number>(65000);
  const [rateInteriorWash, setRateInteriorWash] = useState<number>(80000);
  const [rateCargoPackage, setRateCargoPackage] = useState<number>(48000);
  const [rateCargoBulk, setRateCargoBulk] = useState<number>(38000);
  
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Admin Custom Clauses State
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customLegalBasis, setCustomLegalBasis] = useState<string>('');
  const [customArticle1, setCustomArticle1] = useState<string>('');
  const [customArticle2, setCustomArticle2] = useState<string>('');
  const [customArticle3, setCustomArticle3] = useState<string>('');
  const [customArticle4, setCustomArticle4] = useState<string>('');
  const [customArticle5, setCustomArticle5] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');

  useEffect(() => {
    if (contractToEdit) {
      setTemplateType(contractToEdit.templateType);
      setWorkerId(contractToEdit.workerId);
      setContractNumber(contractToEdit.contractNumber);
      setStationLocation(contractToEdit.stationLocation);
      setSignDate(contractToEdit.signDate);
      setSignPlace(contractToEdit.signPlace);
      setStartDate(contractToEdit.startDate);
      setEndDate(contractToEdit.endDate);
      setRateExteriorWash(contractToEdit.rateExteriorWash || 65000);
      setRateInteriorWash(contractToEdit.rateInteriorWash || 80000);
      setRateCargoPackage(contractToEdit.rateCargoPackage || 48000);
      setRateCargoBulk(contractToEdit.rateCargoBulk || 38000);
      setNotes(contractToEdit.notes || '');

      // Load custom clauses if present
      if (contractToEdit.customContent) {
        setCustomTitle(contractToEdit.customContent.customTitle || '');
        setCustomLegalBasis(contractToEdit.customContent.customLegalBasis || '');
        setCustomArticle1(contractToEdit.customContent.customArticle1 || '');
        setCustomArticle2(contractToEdit.customContent.customArticle2 || '');
        setCustomArticle3(contractToEdit.customContent.customArticle3 || '');
        setCustomArticle4(contractToEdit.customContent.customArticle4 || '');
        setCustomArticle5(contractToEdit.customContent.customArticle5 || '');
        setCustomNotes(contractToEdit.customContent.customNotes || '');
      } else {
        resetCustomClauses();
      }
    } else {
      // Default new contract
      const year = new Date().getFullYear();
      const randomSeq = String(Math.floor(Math.random() * 90) + 10);
      setContractNumber(`${randomSeq}/${year}/HĐGK-SP-NT`);
      if (workers.length > 0 && !workerId) {
        setWorkerId(workers[0].id);
      }
      
      const now = new Date();
      const start = now.toISOString().split('T')[0];
      setStartDate(start);
      setSignDate(start);
      
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      nextYear.setDate(nextYear.getDate() - 1);
      setEndDate(nextYear.toISOString().split('T')[0]);

      resetCustomClauses();
    }
  }, [contractToEdit, isOpen, workers]);

  const resetCustomClauses = () => {
    setCustomTitle('');
    setCustomLegalBasis('');
    setCustomArticle1('');
    setCustomArticle2('');
    setCustomArticle3('');
    setCustomArticle4('');
    setCustomArticle5('');
    setCustomNotes('');
  };

  // Adjust defaults when template changes
  const handleTemplateChange = (type: ContractTemplateType) => {
    if (!canEdit) return;
    setTemplateType(type);
    const year = new Date().getFullYear();
    const prefix = contractNumber.split('/')[0] || '10';

    if (type === 'CARGO_PRINCIPLE_VTHN') {
      setContractNumber(`${prefix}/${year}/HĐNT-VTHN-NT`);
      setStationLocation('Hóa vận Ga Nha Trang');
      setRateCargoPackage(48000);
      setRateCargoBulk(38000);
    } else if (type === 'CARGO_DUAL_EMPLOYER') {
      setContractNumber(`${prefix}/${year}/HĐGK-VTHN-NT`);
      setRateCargoPackage(45000);
      setRateCargoBulk(35000);
    } else {
      setContractNumber(`${prefix}/${year}/HĐGK-SP-NT`);
      setRateExteriorWash(65000);
      setRateInteriorWash(80000);
    }
  };

  const selectedWorker = workers.find(w => w.id === workerId) || workers[0];
  const isCargoContract = templateType === 'CARGO_DUAL_EMPLOYER' || templateType === 'CARGO_PRINCIPLE_VTHN';

  // Build current contract representation for preview & loading defaults
  const currentContractSnapshot: Contract = {
    id: contractToEdit ? contractToEdit.id : 'temp-id',
    contractNumber: contractNumber || '01/2026/HĐGK-SP-NT',
    templateType,
    workerId: selectedWorker ? selectedWorker.id : 'w-1',
    partyA: contractToEdit?.partyA || DEFAULT_PARTY_A,
    stationLocation,
    signDate,
    signPlace,
    startDate,
    endDate: endDate || startDate,
    rateExteriorWash: !isCargoContract ? Number(rateExteriorWash) : 0,
    rateInteriorWash: !isCargoContract ? Number(rateInteriorWash) : 0,
    rateCargoPackage: isCargoContract ? Number(rateCargoPackage) : 0,
    rateCargoBulk: isCargoContract ? Number(rateCargoBulk) : 0,
    status: 'active',
    notes,
    createdAt: contractToEdit ? contractToEdit.createdAt : new Date().toISOString(),
    customContent: {
      customTitle: customTitle.trim() || undefined,
      customLegalBasis: customLegalBasis.trim() || undefined,
      customArticle1: customArticle1.trim() || undefined,
      customArticle2: customArticle2.trim() || undefined,
      customArticle3: customArticle3.trim() || undefined,
      customArticle4: customArticle4.trim() || undefined,
      customArticle5: customArticle5.trim() || undefined,
      customNotes: customNotes.trim() || undefined,
    }
  };

  const handleLoadTemplateClauses = () => {
    if (!selectedWorker) return;
    const defaults = getDefaultContractClauses(currentContractSnapshot, selectedWorker);
    setCustomTitle(defaults.title);
    setCustomLegalBasis(defaults.legalBasis);
    setCustomArticle1(defaults.article1);
    setCustomArticle2(defaults.article2);
    setCustomArticle3(defaults.article3);
    setCustomArticle4(defaults.article4);
    setCustomArticle5(defaults.article5);
    setCustomNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      onClose();
      return;
    }

    if (!contractNumber.trim()) {
      setError('Vui lòng nhập số hợp đồng');
      return;
    }
    if (!workerId) {
      setError('Vui lòng chọn người nhận khoán');
      return;
    }

    const hasAnyCustom = Boolean(
      customTitle.trim() ||
      customLegalBasis.trim() ||
      customArticle1.trim() ||
      customArticle2.trim() ||
      customArticle3.trim() ||
      customArticle4.trim() ||
      customArticle5.trim() ||
      customNotes.trim()
    );

    const customContentObj: CustomContractContent | undefined = hasAnyCustom ? {
      customTitle: customTitle.trim() || undefined,
      customLegalBasis: customLegalBasis.trim() || undefined,
      customArticle1: customArticle1.trim() || undefined,
      customArticle2: customArticle2.trim() || undefined,
      customArticle3: customArticle3.trim() || undefined,
      customArticle4: customArticle4.trim() || undefined,
      customArticle5: customArticle5.trim() || undefined,
      customNotes: customNotes.trim() || undefined,
      lastEditedAt: new Date().toISOString(),
      lastEditedBy: roleProfile.name,
    } : undefined;

    const newContract: Contract = {
      id: contractToEdit ? contractToEdit.id : `c-${Date.now()}`,
      contractNumber,
      templateType,
      workerId,
      partyA: DEFAULT_PARTY_A,
      stationLocation,
      signDate,
      signPlace,
      startDate,
      endDate: endDate || startDate,
      rateExteriorWash: !isCargoContract ? Number(rateExteriorWash) : 0,
      rateInteriorWash: !isCargoContract ? Number(rateInteriorWash) : 0,
      rateCargoPackage: isCargoContract ? Number(rateCargoPackage) : 0,
      rateCargoBulk: isCargoContract ? Number(rateCargoBulk) : 0,
      status: 'active',
      notes,
      createdAt: contractToEdit ? contractToEdit.createdAt : new Date().toISOString(),
      customContent: customContentObj,
    };

    onSave(newContract);
    onClose();
  };

  if (!isOpen) return null;

  const previewPages = selectedWorker ? getContractPages(currentContractSnapshot, selectedWorker) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              canEdit ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {canEdit ? <Shield className="w-5 h-5" /> : <Train className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {canEdit 
                    ? (contractToEdit ? 'Chỉnh Sửa Hợp Đồng & Điều Khoản' : 'Tạo Hợp Đồng Giao Khoán Mới')
                    : 'Xem Nội Dung Hợp Đồng (Phân quyền Trạm)'}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  canEdit ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {canEdit ? 'Admin Toàn Quyền' : `${roleProfile.name}: Chỉ Xem`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {canEdit 
                  ? 'Quyền Quản trị viên: Có thẩm quyền điều chỉnh điều khoản pháp lý, đơn giá và nội dung hợp đồng'
                  : 'Trạm chỉ xem nội dung hợp đồng theo quy chế phân quyền. Không được sửa đổi điều khoản văn bản.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Control Notice for Station Users */}
        {!canEdit && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-3 shrink-0">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Quy định phân quyền:</strong> Bạn đang đăng nhập với quyền <strong>{roleProfile.name}</strong>. Trạm chỉ có quyền tra cứu, xem nội dung hợp đồng và lập Biên bản nghiệm thu tác nghiệp tại ga phụ trách. Chỉ có <strong>Ban Giám đốc & Phòng Kế hoạch Chi nhánh (Admin)</strong> mới được quyền sửa đổi nội dung và điều khoản hợp đồng.
            </div>
          </div>
        )}

        {/* Tab Navigation inside Modal */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveModalTab('basic')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'basic'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Thông tin Hợp đồng & Đơn giá</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('clauses')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'clauses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>2. Nội dung & Điều khoản (Điều 1 - 5)</span>
            {canEdit && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-700 font-mono font-bold">
                Admin
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('preview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeModalTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3. Xem trước Văn bản A4 In ấn</span>
          </button>
        </div>

        {/* Form Body with scrollable content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFORMATION */}
          {activeModalTab === 'basic' && (
            <div className="space-y-6">
              {/* 1. Chọn Mẫu Hợp Đồng */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Mẫu Hợp Đồng Tiêu Chuẩn (4 Mẫu biểu HR & Đường Sắt)
                  </label>
                  <span className="text-[11px] text-blue-600 font-medium">
                    Chuẩn Bộ luật Dân sự & Luật BHXH 2024
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Mẫu 1 */}
                  <div
                    onClick={() => handleTemplateChange('CLEANING_FREELANCE')}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      canEdit ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      templateType === 'CLEANING_FREELANCE'
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Mẫu 1: Rửa Toa Xe Vãng Lai</span>
                        {templateType === 'CLEANING_FREELANCE' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Cá nhân tự do vãng lai, tự chủ phương tiện và thời gian, không BHXH bắt buộc.
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-blue-700 font-semibold">Khoán theo toa xe</div>
                  </div>

                  {/* Mẫu 2 */}
                  <div
                    onClick={() => handleTemplateChange('CLEANING_RETIRED')}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      canEdit ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      templateType === 'CLEANING_RETIRED'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Mẫu 2: Rửa Toa Xe Hưu Trí</span>
                        {templateType === 'CLEANING_RETIRED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Người hưởng lương hưu theo Điểm a Khoản 7 Điều 2 Luật BHXH 2024.
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-emerald-700 font-semibold">Miễn BHXH bắt buộc</div>
                  </div>

                  {/* Mẫu 3 */}
                  <div
                    onClick={() => handleTemplateChange('CARGO_DUAL_EMPLOYER')}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      canEdit ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      templateType === 'CARGO_DUAL_EMPLOYER'
                        ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Mẫu 3: Bốc Dỡ Hàng Có BHXH 1</span>
                        {templateType === 'CARGO_DUAL_EMPLOYER' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Người đã tham gia BHXH tại nơi làm việc thứ nhất, bốc xếp ngoài giờ.
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-purple-700 font-semibold">Khoán theo tấn hàng</div>
                  </div>

                  {/* Mẫu 4 */}
                  <div
                    onClick={() => handleTemplateChange('CARGO_PRINCIPLE_VTHN')}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      canEdit ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      templateType === 'CARGO_PRINCIPLE_VTHN'
                        ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-600'
                        : 'border-amber-300 hover:border-amber-400 bg-amber-50/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950">Mẫu 4: HĐNT Bốc Xếp (PDF)</span>
                        {templateType === 'CARGO_PRINCIPLE_VTHN' && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
                      </div>
                      <div className="text-[11px] text-amber-900 mt-1 leading-relaxed font-medium">
                        Hợp đồng nguyên tắc với LĐ vãng lai theo mẫu Chi nhánh VTĐS.
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-amber-800 font-bold">Mẫu chuẩn theo PDF</div>
                  </div>
                </div>
              </div>

              {/* 2. Bên Giao Khoán & Bên Nhận Khoán */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bên A */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Bên Giao Khoán (Bên A)
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                      Cố định
                    </span>
                  </div>
                  <div className="text-xs space-y-1 text-slate-700">
                    <p className="font-semibold text-slate-900">{DEFAULT_PARTY_A.organizationName}</p>
                    <p className="text-[11px] text-slate-500">Đại diện: {DEFAULT_PARTY_A.representativeName} - {DEFAULT_PARTY_A.representativeTitle}</p>
                    <p className="text-[11px] text-slate-500">Địa chỉ: {DEFAULT_PARTY_A.address}</p>
                  </div>
                </div>

                {/* Bên B */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Người Nhận Khoán (Bên B) *
                    </label>
                    <span className="text-[10px] text-blue-600 font-medium">Từ danh bạ lao động</span>
                  </div>

                  {canEdit ? (
                    <select
                      value={workerId}
                      onChange={(e) => setWorkerId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 cursor-pointer font-medium"
                    >
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.fullName} — CCCD: {w.cccdNumber} ({w.taxCode ? `MST: ${w.taxCode}` : 'Chưa có MST'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800">
                      {selectedWorker?.fullName} (CCCD: {selectedWorker?.cccdNumber})
                    </div>
                  )}

                  {selectedWorker && (
                    <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                      <p>Địa chỉ: {selectedWorker.address}</p>
                      <p>Tài khoản: {selectedWorker.bankAccount} tại {selectedWorker.bankName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Chi Tiết Hợp Đồng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Số hợp đồng *
                  </label>
                  <input
                    type="text"
                    value={contractNumber}
                    disabled={!canEdit}
                    onChange={(e) => setContractNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ga tác nghiệp / Địa điểm *
                  </label>
                  <input
                    type="text"
                    value={stationLocation}
                    disabled={!canEdit}
                    onChange={(e) => setStationLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ngày ký hợp đồng
                  </label>
                  <input
                    type="date"
                    value={signDate}
                    disabled={!canEdit}
                    onChange={(e) => setSignDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Địa điểm ký
                  </label>
                  <input
                    type="text"
                    value={signPlace}
                    disabled={!canEdit}
                    onChange={(e) => setSignPlace(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ngày bắt đầu hiệu lực
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    disabled={!canEdit}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ngày hết hạn (Thời hạn 01 năm)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    disabled={!canEdit}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* 4. Đơn giá Thỏa Thuận Theo Sản Phẩm */}
              <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      {isCargoContract 
                        ? 'Đơn giá khoán bốc xếp, dỡ hàng hóa theo sản phẩm (đồng/tấn)' 
                        : 'Đơn giá khoán rửa toa xe theo sản phẩm (đồng/toa)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Số tiền hiển thị phân cách hàng ngàn chuẩn Việt Nam
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    {isCargoContract ? 'Đơn vị: VNĐ / tấn' : 'Đơn vị: VNĐ / toa'}
                  </span>
                </div>

                {isCargoContract ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Hàng bao kiện, đóng gói (đồng/tấn)
                      </label>
                      {canEdit ? (
                        <FormattedNumberInput
                          value={rateCargoPackage}
                          onChange={setRateCargoPackage}
                          suffix="đ/tấn"
                          placeholder="48.000"
                          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 text-slate-900 shadow-2xs font-bold"
                        />
                      ) : (
                        <div className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono">
                          {formatNumber(rateCargoPackage)} đ/tấn
                        </div>
                      )}
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Đã ghi nhận: <strong className="text-emerald-700">{formatNumber(rateCargoPackage)} đồng/tấn</strong>
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Hàng rời, dỡ chuyển tải (đồng/tấn)
                      </label>
                      {canEdit ? (
                        <FormattedNumberInput
                          value={rateCargoBulk}
                          onChange={setRateCargoBulk}
                          suffix="đ/tấn"
                          placeholder="38.000"
                          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 text-slate-900 shadow-2xs font-bold"
                        />
                      ) : (
                        <div className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono">
                          {formatNumber(rateCargoBulk)} đ/tấn
                        </div>
                      )}
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Đã ghi nhận: <strong className="text-emerald-700">{formatNumber(rateCargoBulk)} đồng/tấn</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Rửa sạch vỏ ngoài toa xe khách (đồng/toa)
                      </label>
                      {canEdit ? (
                        <FormattedNumberInput
                          value={rateExteriorWash}
                          onChange={setRateExteriorWash}
                          suffix="đ/toa"
                          placeholder="65.000"
                          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 text-slate-900 shadow-2xs font-bold"
                        />
                      ) : (
                        <div className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono">
                          {formatNumber(rateExteriorWash)} đ/toa
                        </div>
                      )}
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Đã ghi nhận: <strong className="text-emerald-700">{formatNumber(rateExteriorWash)} đồng/toa</strong>
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Vệ sinh nội thất toa xe khách (đồng/toa)
                      </label>
                      {canEdit ? (
                        <FormattedNumberInput
                          value={rateInteriorWash}
                          onChange={setRateInteriorWash}
                          suffix="đ/toa"
                          placeholder="80.000"
                          className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 text-slate-900 shadow-2xs font-bold"
                        />
                      ) : (
                        <div className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800 font-mono">
                          {formatNumber(rateInteriorWash)} đ/toa
                        </div>
                      )}
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Đã ghi nhận: <strong className="text-emerald-700">{formatNumber(rateInteriorWash)} đồng/toa</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ghi chú tác nghiệp</label>
                <input
                  type="text"
                  value={notes}
                  disabled={!canEdit}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Phục vụ bốc xếp phân bón, lương thực, giải phóng nhanh toa xe..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CLAUSES EDITOR & CUSTOMIZATION */}
          {activeModalTab === 'clauses' && (
            <div className="space-y-5">
              {/* Header Action Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Tùy Chỉnh Nội Dung Văn Bản Hợp Đồng (Điều 1 - Điều 5)
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      Thẩm quyền Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nội dung sửa đổi tại đây sẽ trực tiếp xuất ra văn bản in ấn A4 và file Word (.doc)
                  </p>
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadTemplateClauses}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      title="Nạp toàn bộ nội dung mẫu biểu hiện hành vào các ô nhập liệu bên dưới để chỉnh sửa"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tải Nội Dung Mẫu Chuẩn</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetCustomClauses}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Xóa trắng tùy chỉnh để sử dụng nguyên bản điều khoản hệ thống"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục mặc định</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Clause Fields */}
              <div className="space-y-4">
                {/* Custom Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tiêu đề Hợp đồng
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    readOnly={!canEdit}
                    placeholder="Mặc định: HỢP ĐỒNG GIAO KHOÁN CÔNG VIỆC hoặc HỢP ĐỒNG NGUYÊN TẮC VỚI LAO ĐỘNG VÃNG LAI..."
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 font-semibold text-slate-900"
                  />
                </div>

                {/* Custom Legal Basis */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Căn cứ pháp lý (Mỗi dòng là một căn cứ)
                  </label>
                  <textarea
                    rows={3}
                    value={customLegalBasis}
                    readOnly={!canEdit}
                    placeholder="Căn cứ Bộ luật Dân sự 2015;&#10;Căn cứ Luật BHXH 2024;&#10;Căn cứ Nghị định 253/2026/NĐ-CP..."
                    onChange={(e) => setCustomLegalBasis(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800"
                  />
                </div>

                {/* Article 1 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Điều 1: Nội Dung, Địa Điểm Và Nguyên Tắc Giao Khoán
                    </label>
                    <span className="text-[10px] text-slate-400">Xuất hiện trên Trang 1</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customArticle1}
                    readOnly={!canEdit}
                    placeholder="Nhập nội dung Điều 1 (tự động phân đoạn theo từng dòng hoặc theo dấu chấm phẩy)..."
                    onChange={(e) => setCustomArticle1(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800 font-sans"
                  />
                </div>

                {/* Article 2 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Điều 2: Đơn Giá Thỏa Thuận Và Phương Thức Thanh Toán
                    </label>
                    <span className="text-[10px] text-slate-400">Xuất hiện trên Trang 1</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customArticle2}
                    readOnly={!canEdit}
                    placeholder="Nhập nội dung Điều 2..."
                    onChange={(e) => setCustomArticle2(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800 font-sans"
                  />
                </div>

                {/* Article 3 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Điều 3: Bảo Hiểm Xã Hội Và Thuế Thu Nhập Cá Nhân (TNCN)
                    </label>
                    <span className="text-[10px] text-slate-400">Xuất hiện trên Trang 2</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customArticle3}
                    readOnly={!canEdit}
                    placeholder="Quy định khấu trừ 10% thuế TNCN theo NĐ 253/2026/NĐ-CP và miễn trừ BHXH bắt buộc..."
                    onChange={(e) => setCustomArticle3(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800 font-sans"
                  />
                </div>

                {/* Article 4 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Điều 4: An Toàn Lao Động Và Bồi Thường Thiệt Hại
                    </label>
                    <span className="text-[10px] text-slate-400">Xuất hiện trên Trang 2</span>
                  </div>
                  <textarea
                    rows={4}
                    value={customArticle4}
                    readOnly={!canEdit}
                    placeholder="Quy định an toàn tác nghiệp trong phạm vi ga tàu, đường sắt chạy tàu..."
                    onChange={(e) => setCustomArticle4(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800 font-sans"
                  />
                </div>

                {/* Article 5 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Điều 5: Điều Khoản Thi Hành & Hiệu Lực
                    </label>
                    <span className="text-[10px] text-slate-400">Xuất hiện trên Trang 2</span>
                  </div>
                  <textarea
                    rows={3}
                    value={customArticle5}
                    readOnly={!canEdit}
                    placeholder="Hợp đồng lập thành bao nhiêu bản, hiệu lực kể từ ngày ký..."
                    onChange={(e) => setCustomArticle5(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800 font-sans"
                  />
                </div>

                {/* Custom Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ghi chú bổ sung từ Ban Giám đốc Chi nhánh
                  </label>
                  <textarea
                    rows={2}
                    value={customNotes}
                    readOnly={!canEdit}
                    placeholder="Ghi chú in kèm dưới Điều 5..."
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900 leading-relaxed text-slate-800 font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: A4 LIVE PREVIEW */}
          {activeModalTab === 'preview' && (
            <div className="space-y-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Bản xem trước trực tiếp theo khổ giấy <strong>A4 tiêu chuẩn (210 x 297mm)</strong>, căn lề chuẩn hành chính Việt Nam.
                  </span>
                </div>
                <span className="font-mono font-bold text-blue-800">
                  {previewPages.length} trang văn bản
                </span>
              </div>

              <div className="flex flex-col items-center gap-8 py-4 bg-slate-200/80 rounded-xl p-6 overflow-x-auto">
                {previewPages.map((page) => (
                  <div
                    key={page.id}
                    className="bg-white text-slate-900 shadow-xl border border-slate-300 w-[210mm] min-h-[297mm] p-[20mm_15mm_20mm_25mm] box-border relative rounded-xs"
                    style={{
                      fontFamily: '"Times New Roman", Times, serif',
                      fontSize: '11pt',
                      lineHeight: '1.4',
                      transformOrigin: 'top center',
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 bg-white sticky bottom-0">
            <div className="text-xs text-slate-500">
              {canEdit ? (
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Admin: Mọi thay đổi sẽ có hiệu lực tức thì trên toàn hệ thống
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Trạm chỉ xem nội dung văn bản
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {canEdit ? 'Hủy Bỏ' : 'Đóng (Chỉ Xem)'}
              </button>

              {canEdit && (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{contractToEdit ? 'Lưu Thay Đổi Nội Dung' : 'Tạo Hợp Đồng & Bộ Hồ Sơ'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
