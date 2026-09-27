import React, { useState, useEffect, useRef } from 'react';
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
  Info,
  Sliders,
  AlignJustify,
  AlignLeft,
  Plus
} from 'lucide-react';
import { Contract, WorkerContractor, ContractTemplateType, UserRole, CustomContractContent } from '../types';
import { DEFAULT_PARTY_A } from '../data/mockData';
import { FormattedNumberInput } from './FormattedNumberInput';
import { formatNumber } from '../services/numberToWords';
import { getUserRoleProfile } from '../services/authRoles';
import { 
  getDefaultContractClauses, 
  getDefaultFullContractContent,
  getContractPages, 
  getDefaultSafetyCommitmentContent, 
  getSafetyCommitmentPages 
} from '../services/exportDoc';
import { WysiwygClauseEditor, WysiwygClauseEditorRef } from './WysiwygClauseEditor';

interface ContractEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Contract) => void;
  workers: WorkerContractor[];
  contractToEdit?: Contract | null;
  currentRole?: UserRole;
  initialTab?: 'basic' | 'clauses' | 'safety' | 'preview';
  focusClause?: number;
}

export const ContractEditorModal: React.FC<ContractEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  workers,
  contractToEdit,
  currentRole = 'admin',
  initialTab = 'basic',
  focusClause,
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const isAdmin = currentRole === 'admin';
  const canEditMasterClauses = roleProfile.canEditContractContent;
  const canSave = contractToEdit ? roleProfile.canEditContractDetails : roleProfile.canCreateContract;
  const canEditDetails = roleProfile.canEditContractDetails;

  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'clauses' | 'safety' | 'preview'>(initialTab);

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
  const [customFullContract, setCustomFullContract] = useState<string>(''); // Toàn bộ nội dung hợp đồng từ Điều 1 đến hết trong 1 khung
  const [customArticle1, setCustomArticle1] = useState<string>('');
  const [customArticle2, setCustomArticle2] = useState<string>('');
  const [customArticle3, setCustomArticle3] = useState<string>('');
  const [customArticle4, setCustomArticle4] = useState<string>('');
  const [customArticle5, setCustomArticle5] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [customSafetyCommitment, setCustomSafetyCommitment] = useState<string>('');

  // Document Formatting & Alignment State
  const [fontSize, setFontSize] = useState<number>(13);
  const [lineHeight, setLineHeight] = useState<number>(1.45);
  const [paragraphIndent, setParagraphIndent] = useState<number>(1.27);
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>('justify');
  const [showPage1Header, setShowPage1Header] = useState<boolean>(false);

  // Clause container reference for quick navigation
  const fullContractEditorRef = useRef<WysiwygClauseEditorRef>(null);

  useEffect(() => {
    if (activeModalTab === 'clauses') {
      setTimeout(() => {
        fullContractEditorRef.current?.scrollIntoView();
        fullContractEditorRef.current?.focus();
      }, 150);
    }
  }, [activeModalTab, focusClause]);

  const appendBullet = (setter: React.Dispatch<React.SetStateAction<string>>, current: string) => {
    const trimmed = current.trimEnd();
    setter(trimmed ? `${trimmed}\n- ` : '- ');
  };

  const appendNumber = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, num: number) => {
    const trimmed = current.trimEnd();
    setter(trimmed ? `${trimmed}\n${num}. ` : `${num}. `);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveModalTab(initialTab || 'basic');
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;

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

      const activeWorker = workers.find(w => w.id === contractToEdit.workerId) || workers[0] || {
        id: contractToEdit.workerId || 'w-default',
        fullName: 'NGUYỄN VĂN AN',
        idCardNumber: '056085001234',
        idCardDate: '2021-05-15',
        idCardPlace: 'Cục Cảnh sát QLHC về TTXH',
        permanentAddress: 'Phường Vĩnh Hải, TP. Nha Trang, Tỉnh Khánh Hòa',
        phoneNumber: '0912345678',
        status: 'active',
        isRetired: false,
        taxCode: '8012345678',
      };
      const defaults = getDefaultContractClauses(contractToEdit, activeWorker);

      // CRITICAL FIX: "Lấy các nội dung lên" - Always pre-populate with rich content!
      setCustomTitle(contractToEdit.customContent?.customTitle?.trim() || defaults.title);
      setCustomLegalBasis(contractToEdit.customContent?.customLegalBasis?.trim() || defaults.legalBasis);
      if (contractToEdit.customContent?.customFullContract?.trim()) {
        setCustomFullContract(contractToEdit.customContent.customFullContract.trim());
      } else {
        setCustomFullContract(getDefaultFullContractContent(contractToEdit, activeWorker));
      }
      setCustomArticle1(contractToEdit.customContent?.customArticle1?.trim() || defaults.article1);
      setCustomArticle2(contractToEdit.customContent?.customArticle2?.trim() || defaults.article2);
      setCustomArticle3(contractToEdit.customContent?.customArticle3?.trim() || defaults.article3);
      setCustomArticle4(contractToEdit.customContent?.customArticle4?.trim() || defaults.article4);
      setCustomArticle5(contractToEdit.customContent?.customArticle5?.trim() || defaults.article5);
      setCustomNotes(contractToEdit.customContent?.customNotes || '');
      setCustomSafetyCommitment(contractToEdit.customContent?.customSafetyCommitment?.trim() || getDefaultSafetyCommitmentContent(contractToEdit, activeWorker));

      if (contractToEdit.customContent?.formatting) {
        setFontSize(contractToEdit.customContent.formatting.fontSize || 13);
        setLineHeight(contractToEdit.customContent.formatting.lineHeight || 1.45);
        setParagraphIndent(contractToEdit.customContent.formatting.paragraphIndent !== undefined ? contractToEdit.customContent.formatting.paragraphIndent : 1.27);
        setTextAlign(contractToEdit.customContent.formatting.textAlign || 'justify');
        setShowPage1Header(Boolean(contractToEdit.customContent.formatting.showPage1Header));
      }
    } else {
      // Default new contract
      const year = new Date().getFullYear();
      const randomSeq = String(Math.floor(Math.random() * 90) + 10);
      setContractNumber(`${randomSeq}/${year}/HĐGK-SP-NT`);
      const targetWorkerId = workers.length > 0 ? (workerId || workers[0].id) : '';
      if (!workerId && targetWorkerId) {
        setWorkerId(targetWorkerId);
      }
      
      const now = new Date();
      const start = now.toISOString().split('T')[0];
      setStartDate(start);
      setSignDate(start);
      
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      nextYear.setDate(nextYear.getDate() - 1);
      setEndDate(nextYear.toISOString().split('T')[0]);

      if (roleProfile.isStation) {
        setStationLocation(roleProfile.stationName);
      } else {
        setStationLocation('Ga Nha Trang');
      }

      const activeWorker = workers.find(w => w.id === targetWorkerId) || workers[0];
      if (activeWorker) {
        const dummyNew: Contract = {
          id: 'new',
          contractNumber: `${randomSeq}/${year}/HĐGK-SP-NT`,
          templateType: 'CLEANING_FREELANCE',
          workerId: activeWorker.id,
          partyA: DEFAULT_PARTY_A,
          stationLocation: 'Ga Nha Trang',
          signDate: start,
          signPlace: 'Chi nhánh Vận tải đường sắt Nha Trang',
          startDate: start,
          endDate: nextYear.toISOString().split('T')[0],
          rateExteriorWash: 65000,
          rateInteriorWash: 80000,
          rateCargoPackage: 48000,
          rateCargoBulk: 38000,
          status: 'active',
          createdAt: now.toISOString(),
        };
        const defaults = getDefaultContractClauses(dummyNew, activeWorker);
        setCustomTitle(defaults.title);
        setCustomLegalBasis(defaults.legalBasis);
        setCustomFullContract(getDefaultFullContractContent(dummyNew, activeWorker));
        setCustomArticle1(defaults.article1);
        setCustomArticle2(defaults.article2);
        setCustomArticle3(defaults.article3);
        setCustomArticle4(defaults.article4);
        setCustomArticle5(defaults.article5);
        setCustomNotes('');
        setCustomSafetyCommitment(getDefaultSafetyCommitmentContent(dummyNew, activeWorker));
      }
    }
  }, [contractToEdit, isOpen, workers, roleProfile.isStation, roleProfile.stationName]);

  const resetCustomClauses = () => {
    if (!selectedWorker) return;
    const defaults = getDefaultContractClauses(currentContractSnapshot, selectedWorker);
    setCustomTitle(defaults.title);
    setCustomLegalBasis(defaults.legalBasis);
    setCustomFullContract(getDefaultFullContractContent(currentContractSnapshot, selectedWorker));
    setCustomArticle1(defaults.article1);
    setCustomArticle2(defaults.article2);
    setCustomArticle3(defaults.article3);
    setCustomArticle4(defaults.article4);
    setCustomArticle5(defaults.article5);
    setCustomNotes('');
  };

  const handleLoadDefaultSafetyCommitment = () => {
    if (!selectedWorker) return;
    const defaultCommitment = getDefaultSafetyCommitmentContent(currentContractSnapshot, selectedWorker);
    setCustomSafetyCommitment(defaultCommitment);
  };

  // Adjust defaults when template changes
  const handleTemplateChange = (type: ContractTemplateType) => {
    if (!canEditDetails) return;
    setTemplateType(type);
    const year = new Date().getFullYear();
    const prefix = contractNumber.split('/')[0] || '10';

    if (type === 'CARGO_PRINCIPLE_VTHN') {
      setContractNumber(`${prefix}/${year}/HĐNT-VTHN-NT`);
      setStationLocation(roleProfile.isStation ? roleProfile.stationName : 'Hóa vận Ga Nha Trang');
      setRateCargoPackage(48000);
      setRateCargoBulk(38000);
    } else if (type === 'CARGO_DUAL_EMPLOYER') {
      setContractNumber(`${prefix}/${year}/HĐGK-VTHN-NT`);
      setStationLocation(roleProfile.isStation ? roleProfile.stationName : 'Hóa vận Ga Nha Trang');
      setRateCargoPackage(45000);
      setRateCargoBulk(35000);
    } else {
      setContractNumber(`${prefix}/${year}/HĐGK-SP-NT`);
      setStationLocation(roleProfile.isStation ? roleProfile.stationName : 'Ga Nha Trang');
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
      customFullContract: customFullContract.trim() || undefined,
      customArticle1: customArticle1.trim() || undefined,
      customArticle2: customArticle2.trim() || undefined,
      customArticle3: customArticle3.trim() || undefined,
      customArticle4: customArticle4.trim() || undefined,
      customArticle5: customArticle5.trim() || undefined,
      customNotes: customNotes.trim() || undefined,
      customSafetyCommitment: customSafetyCommitment.trim() || undefined,
      formatting: {
        fontSize,
        lineHeight,
        paragraphIndent,
        textAlign,
        showPage1Header,
        showPageNumbers: true,
      }
    }
  };

  const currentDefaults = selectedWorker ? getDefaultContractClauses(currentContractSnapshot, selectedWorker) : null;

  const handleLoadTemplateClauses = () => {
    if (!selectedWorker) return;
    const defaults = getDefaultContractClauses(currentContractSnapshot, selectedWorker);
    setCustomTitle(defaults.title);
    setCustomLegalBasis(defaults.legalBasis);
    setCustomFullContract(getDefaultFullContractContent(currentContractSnapshot, selectedWorker));
    setCustomArticle1(defaults.article1);
    setCustomArticle2(defaults.article2);
    setCustomArticle3(defaults.article3);
    setCustomArticle4(defaults.article4);
    setCustomArticle5(defaults.article5);
    setCustomNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) {
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

    let customContentObj: CustomContractContent | undefined = undefined;

    if (isAdmin) {
      const hasAnyCustom = Boolean(
        customTitle.trim() ||
        customLegalBasis.trim() ||
        customFullContract.trim() ||
        customArticle1.trim() ||
        customArticle2.trim() ||
        customArticle3.trim() ||
        customArticle4.trim() ||
        customArticle5.trim() ||
        customNotes.trim() ||
        customSafetyCommitment.trim() ||
        fontSize !== 13 ||
        lineHeight !== 1.45 ||
        paragraphIndent !== 1.27 ||
        textAlign !== 'justify'
      );

      customContentObj = hasAnyCustom ? {
        customTitle: customTitle.trim() || undefined,
        customLegalBasis: customLegalBasis.trim() || undefined,
        customFullContract: customFullContract.trim() || undefined,
        customArticle1: customArticle1.trim() || undefined,
        customArticle2: customArticle2.trim() || undefined,
        customArticle3: customArticle3.trim() || undefined,
        customArticle4: customArticle4.trim() || undefined,
        customArticle5: customArticle5.trim() || undefined,
        customNotes: customNotes.trim() || undefined,
        customSafetyCommitment: customSafetyCommitment.trim() || undefined,
        formatting: {
          fontSize,
          lineHeight,
          paragraphIndent,
          textAlign,
          showPage1Header,
          showPageNumbers: true,
        },
        lastEditedAt: new Date().toISOString(),
        lastEditedBy: roleProfile.name,
      } : undefined;
    } else {
      // Non-admin roles (Trạm) create contracts using default preset legal clauses, retaining existing if editing
      customContentObj = contractToEdit?.customContent;
    }

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

  const previewContractPages = selectedWorker ? getContractPages(currentContractSnapshot, selectedWorker) : [];
  const previewSafetyPages = selectedWorker ? getSafetyCommitmentPages(currentContractSnapshot, selectedWorker) : [];
  const previewPages = [...previewContractPages, ...previewSafetyPages];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isAdmin ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <Train className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {contractToEdit ? 'Chỉnh Sửa Hợp Đồng Giao Khoán' : 'Tạo Hợp Đồng Giao Khoán Mới'}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {isAdmin ? 'Admin Toàn Quyền' : `${roleProfile.name}`}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAdmin 
                  ? 'Quyền Quản trị viên: Có thẩm quyền điều chỉnh điều khoản pháp lý, đơn giá và nội dung hợp đồng'
                  : 'Cấp Trạm: Khai báo người nhận khoán, đơn giá và ga tác nghiệp. Điều khoản pháp lý mẫu do Admin phê duyệt.'}
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
        {!isAdmin && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-start gap-3 shrink-0">
            <Train className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Phân quyền theo Trạm:</strong> Bạn đang đăng nhập với quyền <strong>{roleProfile.name}</strong>. Bạn có quyền lập hợp đồng, chọn người lao động, đơn giá và ga tác nghiệp. Các điều khoản pháp lý khung (Điều 1 - 5) được bảo vệ bởi Admin Chi nhánh.
            </div>
          </div>
        )}

        {/* Tab Navigation inside Modal */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 pt-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveModalTab('basic')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModalTab === 'clauses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>2. Nội dung Hợp đồng (Từ Điều 1 đến hết)</span>
            {canEditMasterClauses ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-700 font-mono font-bold">
                Admin
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-100 text-blue-700 font-mono font-bold">
                Xem
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('safety')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModalTab === 'safety'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Bản Cam Kết An Toàn</span>
            {canEditMasterClauses ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                WYSIWYG
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-100 text-slate-700 font-mono font-bold">
                Xem
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveModalTab('preview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModalTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>4. Xem trước Văn bản A4 In ấn</span>
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
                      canEditDetails ? 'cursor-pointer' : 'cursor-default'
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
                      canEditDetails ? 'cursor-pointer' : 'cursor-default'
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
                      canEditDetails ? 'cursor-pointer' : 'cursor-default'
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
                      canEditDetails ? 'cursor-pointer' : 'cursor-default'
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

                  {canEditDetails ? (
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
                    disabled={!canEditDetails}
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
                    disabled={!canEditDetails}
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
                    disabled={!canEditDetails}
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
                    disabled={!canEditDetails}
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
                    disabled={!canEditDetails}
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
                    disabled={!canEditDetails}
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
                      {canEditDetails ? (
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
                      {canEditDetails ? (
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
                      {canEditDetails ? (
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
                      {canEditDetails ? (
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
                  disabled={!canEditDetails}
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
              {/* Guidance Banner Answering User's Request */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-xl flex items-start gap-3 shadow-2xs">
                <div className="p-2 bg-[#0f5499] text-white rounded-lg shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-800 leading-relaxed space-y-2 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                      <span>Soạn thảo toàn bộ nội dung hợp đồng trong một khung duy nhất:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Từ Điều 1 đến hết hợp đồng trong 1 khung liền mạch</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-700">
                    • <strong>Toàn bộ nội dung trong 1 khung:</strong> Toàn bộ điều khoản từ Điều 1 đến Điều 5 (Phạm vi công việc, Đơn giá & thanh toán, BHXH & Thuế TNCN 10%, An toàn lao động, Hiệu lực thi hành) hiển thị liền mạch trong duy nhất một khung soạn thảo bên dưới, không còn tách rời nhau.
                  </p>
                  <p className="text-slate-700">
                    • <strong>Định dạng trực quan WYSIWYG:</strong> Bôi đen văn bản để chọn <strong>In đậm</strong>, <em>In nghiêng</em>, <u>Gạch chân</u>, Đổi màu chữ, <strong>Căn đều 2 bên (Justify)</strong>, <strong>Thụt đầu dòng 1.27cm</strong>, chèn ý gạch đầu dòng (<code>-</code>) hoặc khoản số (<code>1.</code>, <code>2.</code>).
                  </p>
                  <p className="text-slate-700 font-medium">
                    • <strong>Đồng bộ tức thì:</strong> Sau khi chỉnh sửa và lưu, nội dung xuất nguyên bản lên văn bản A4, lệnh In/PDF và file Word (.doc).
                  </p>
                </div>
              </div>

              {!canEditMasterClauses && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Quyền hạn cấp Trạm:</span> Các điều khoản pháp lý mẫu (Điều 1 - 5) được thẩm định và ban hành bởi Ban Giám đốc Chi nhánh (Admin). Tài khoản <strong>{roleProfile.name}</strong> chỉ có quyền xem văn bản.
                  </div>
                </div>
              )}

              {/* Header Action Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Toàn Bộ Nội Dung Hợp Đồng (Từ Điều 1 Đến Hết Hợp Đồng)
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      canEditMasterClauses ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {canEditMasterClauses ? 'Một khung soạn thảo duy nhất' : 'Trạm: Chỉ xem'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nội dung soạn thảo lưu lại sẽ xuất nguyên bản sang văn bản in ấn A4 và file Word (.doc)
                  </p>
                </div>

                {canEditMasterClauses && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleLoadTemplateClauses}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                      title="Nạp lại toàn bộ nội dung mẫu biểu hiện hành vào khung soạn thảo bên dưới"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Nạp Lại Mẫu Chuẩn (Điều 1 - 5)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalTab('preview')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                      title="Xem trước kết quả định dạng trên bản in A4"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Xem Trước Bản In A4</span>
                    </button>

                    <button
                      type="button"
                      onClick={resetCustomClauses}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Khôi phục nguyên bản điều khoản hệ thống"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục mẫu</span>
                    </button>
                  </div>
                )}
              </div>

              {/* BỘ CÔNG CỤ CANH LỀ & ĐỊNH DẠNG VĂN BẢN TRỰC TIẾP */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Bộ công cụ Canh lề & Định dạng đoạn văn bản</span>
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Căn lề chuẩn A4: Trái 3cm · Phải 2cm · Trên 2cm · Dưới 2cm
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Căn lề */}
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Căn lề văn bản</label>
                    <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                      <button
                        type="button"
                        onClick={() => setTextAlign('justify')}
                        className={`flex-1 py-1 px-1 rounded text-center text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          textAlign === 'justify' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Căn đều hai bên (Justify)"
                      >
                        <AlignJustify className="w-3 h-3" />
                        <span>Căn đều</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextAlign('left')}
                        className={`flex-1 py-1 px-1 rounded text-center text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                          textAlign === 'left' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Căn trái (Align Left)"
                      >
                        <AlignLeft className="w-3 h-3" />
                        <span>Căn trái</span>
                      </button>
                    </div>
                  </div>

                  {/* Thụt đầu dòng */}
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Thụt đầu dòng</label>
                    <select
                      value={paragraphIndent}
                      onChange={(e) => setParagraphIndent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                    >
                      <option value={1.27}>1.27 cm (Chuẩn Word / NĐ 30)</option>
                      <option value={1.0}>1.0 cm (Gọn gàng)</option>
                      <option value={0}>0 cm (Không thụt)</option>
                    </select>
                  </div>

                  {/* Giãn dòng */}
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Khoảng cách dòng</label>
                    <select
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                    >
                      <option value={1.35}>1.35x (Chuẩn dễ đọc)</option>
                      <option value={1.45}>1.45x (Thông thoáng)</option>
                      <option value={1.2}>1.2x (Khít dòng vừa trang)</option>
                    </select>
                  </div>

                  {/* Cỡ chữ */}
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1 font-semibold">Cỡ chữ văn bản</label>
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:ring-1 focus:ring-blue-600"
                    >
                      <option value={13}>13 pt (Chuẩn NĐ 30/2020)</option>
                      <option value={12}>12 pt (Gọn trang)</option>
                      <option value={14}>14 pt (To rõ nét)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tùy chọn Tiêu đề & Căn cứ pháp lý (Thu gọn lại để không chiếm diện tích) */}
              <details className="group border border-slate-200 rounded-xl bg-slate-50/80 overflow-hidden text-xs">
                <summary className="px-4 py-2.5 font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-100 select-none transition-colors">
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tùy chỉnh Tiêu đề & Căn cứ pháp lý Hợp đồng (Nhấp để mở rộng nếu cần sửa)</span>
                  </span>
                  <span className="text-[10.5px] font-normal text-slate-500 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="p-4 space-y-3 bg-white border-t border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Tiêu đề Hợp đồng
                      </label>
                      {currentDefaults?.title && (
                        <button
                          type="button"
                          onClick={() => setCustomTitle(currentDefaults.title)}
                          className="text-[10px] text-blue-700 hover:underline cursor-pointer"
                        >
                          Khôi phục tiêu đề gốc
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={customTitle}
                      readOnly={!canEditMasterClauses}
                      placeholder="Mặc định: HỢP ĐỒNG GIAO KHOÁN CÔNG VIỆC THEO SẢN PHẨM..."
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-600 font-bold uppercase text-slate-900 tracking-wide"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Căn cứ pháp lý ban hành
                      </label>
                      {currentDefaults?.legalBasis && (
                        <button
                          type="button"
                          onClick={() => setCustomLegalBasis(currentDefaults.legalBasis)}
                          className="text-[10px] text-blue-700 hover:underline cursor-pointer"
                        >
                          Khôi phục căn cứ gốc
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={customLegalBasis}
                      readOnly={!canEditMasterClauses}
                      onChange={(e) => setCustomLegalBasis(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 read-only:bg-slate-100 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-600 italic text-slate-800 leading-relaxed font-serif"
                    />
                  </div>
                </div>
              </details>

              {/* TOÀN BỘ NỘI DUNG HỢP ĐỒNG (TỪ ĐIỀU 1 ĐẾN HẾT HỢP ĐỒNG) - MỘT KHUNG DUY NHẤT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Nội dung toàn bộ hợp đồng (Từ Điều 1 đến hết hợp đồng trong một khung duy nhất)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Một khung soạn thảo liền mạch</span>
                  </span>
                </div>

                <WysiwygClauseEditor
                  ref={fullContractEditorRef}
                  clauseId="full-contract-editor"
                  title="TOÀN BỘ NỘI DUNG ĐIỀU KHOẢN HỢP ĐỒNG (TỪ ĐIỀU 1 ĐẾN HẾT HỢP ĐỒNG)"
                  pageLabel="Soạn thảo trọn gói Điều 1 - 5 trong 1 khung duy nhất"
                  value={customFullContract}
                  defaultValue={selectedWorker ? getDefaultFullContractContent(currentContractSnapshot, selectedWorker) : ''}
                  onChange={setCustomFullContract}
                  readOnly={!canEditMasterClauses}
                  minHeight="600px"
                  globalFormatting={{
                    textAlign,
                    lineHeight,
                    paragraphIndent,
                    fontSize,
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: SAFETY COMMITMENT (WYSIWYG ADMIN EDITOR) */}
          {activeModalTab === 'safety' && (
            <div className="space-y-6">
              {/* Top Banner for Safety Commitment */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Tùy Biến Nội Dung Bản Cam Kết An Toàn Lao Động Tại Ga Tàu
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      WYSIWYG
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Toàn bộ nội dung điều khoản cam kết (sức khỏe, trang bị BHLĐ, quy tắc an toàn đường sắt, rủi ro) được áp dụng trực tiếp lên văn bản in A4 của người nhận khoán.
                  </p>
                </div>

                {canEditMasterClauses && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('preview')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                      title="Xem trước kết quả định dạng trên bản in A4"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Xem Trước Bản In</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadDefaultSafetyCommitment}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Khôi phục nội dung cam kết mẫu chuẩn của Tập đoàn"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục mẫu</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Append Helper Toolbar */}
              {canEditMasterClauses && (
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mẫu đoạn quy chuẩn an toàn nhanh:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => appendNumber(setCustomSafetyCommitment, customSafetyCommitment, 1)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      + Điều khoản mới
                    </button>
                    <button
                      type="button"
                      onClick={() => appendBullet(setCustomSafetyCommitment, customSafetyCommitment)}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-medium transition-colors cursor-pointer"
                    >
                      + Gạch đầu dòng
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const gearText = '\n<p style="margin: 4px 0 4px 20px;">- Trang bị bổ sung: Dây đai an toàn trên cao, ủng cách điện, kính chắn bụi áp lực cao.</p>';
                        setCustomSafetyCommitment(prev => (prev || '') + gearText);
                      }}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      + Thêm BHLĐ đặc thù
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const trainSafety = '\n<p style="margin: 4px 0 4px 20px;">- Tuyệt đối không đứng trong phạm vi tĩnh không đường sắt khi tín hiệu thông qua đang mở hoặc đầu máy đang vào ke ga.</p>';
                        setCustomSafetyCommitment(prev => (prev || '') + trainSafety);
                      }}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-md font-medium transition-colors cursor-pointer"
                    >
                      + Thêm quy tắc chạy tàu
                    </button>
                  </div>
                </div>
              )}

              {/* Rich WYSIWYG Editor for Safety Commitment Document */}
              <div className="space-y-4">
                <WysiwygClauseEditor
                  clauseId="safety-commitment-editor"
                  title="Nội dung Chi tiết Bản Cam Kết An Toàn Lao Động Tại Ga Tàu"
                  pageLabel="Tài liệu đính kèm hợp đồng"
                  value={customSafetyCommitment}
                  defaultValue={getDefaultSafetyCommitmentContent(currentContractSnapshot, selectedWorker)}
                  onChange={setCustomSafetyCommitment}
                  readOnly={!canEditMasterClauses}
                  minHeight="350px"
                  globalFormatting={{
                    textAlign,
                    lineHeight,
                    paragraphIndent,
                    fontSize,
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: A4 LIVE PREVIEW */}
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
              {currentRole === 'admin' ? (
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Chi nhánh: Toàn quyền phê duyệt điều khoản và ban hành hợp đồng
                </span>
              ) : (
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <Train className="w-3.5 h-3.5" />
                  {roleProfile.name}: Khai báo thông tin theo trạm (Điều khoản pháp lý mẫu do Admin duyệt)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>

              {canSave && (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{contractToEdit ? 'Lưu Thay Đổi Thông Tin' : 'Tạo Hợp Đồng Mới'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
