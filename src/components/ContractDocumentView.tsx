import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  FileDown, 
  ArrowLeft, 
  ShieldAlert, 
  Edit3, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  ListOrdered,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers,
  Sliders,
  AlignJustify,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Contract, WorkerContractor, AcceptanceReport } from '../types';
import { 
  generateContractHtmlContent, 
  generateSafetyCommitmentHtml, 
  generateAcceptanceHtml, 
  exportHtmlToWordDoc,
  getContractPages,
  getSafetyCommitmentPages,
  getAcceptancePages,
  getAllDocumentPages,
  DocumentPage
} from '../services/exportDoc';
import { printDocumentHtml } from '../services/printService';
import { UserRole, DocumentFormattingOptions } from '../types';
import { getUserRoleProfile } from '../services/authRoles';
import { X } from 'lucide-react';

interface ContractDocumentViewProps {
  contract: Contract;
  worker: WorkerContractor;
  acceptances: AcceptanceReport[];
  onBack: () => void;
  onEdit: (initialTab?: 'basic' | 'clauses' | 'safety' | 'preview', focusClause?: number) => void;
  onCheckLegal: () => void;
  currentRole?: UserRole;
  onUpdateContract?: (updated: Contract) => void;
  onDeleteContract?: (contractId: string) => void;
}

export const ContractDocumentView: React.FC<ContractDocumentViewProps> = ({
  contract,
  worker,
  acceptances,
  onBack,
  onEdit,
  onCheckLegal,
  currentRole = 'admin',
  onUpdateContract,
  onDeleteContract,
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const canEdit = roleProfile.canEditContractContent;
  const canDelete = roleProfile.canDeleteContract;

  const [docTab, setDocTab] = useState<'contract' | 'safety' | 'acceptance' | 'all'>('contract');
  const [selectedReportId, setSelectedReportId] = useState<string>(
    acceptances.length > 0 ? acceptances[0].id : ''
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  
  // Word Online UI settings
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [showGuideBanner, setShowGuideBanner] = useState<boolean>(true);

  // Live Formatting & Alignment State (synced with contract)
  const fmt = contract.customContent?.formatting;
  const [fontSize, setFontSize] = useState<number>(fmt?.fontSize || 13);
  const [lineHeight, setLineHeight] = useState<number>(fmt?.lineHeight || 1.45);
  const [paragraphIndent, setParagraphIndent] = useState<number>(
    fmt?.paragraphIndent !== undefined ? fmt.paragraphIndent : 1.27
  );
  const [textAlign, setTextAlign] = useState<'justify' | 'left'>(fmt?.textAlign || 'justify');
  // showRunningHeader defaults to false: Page 1 NEVER shows running header (removes the red highlighted part!)
  const [showRunningHeader, setShowRunningHeader] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedReport = acceptances.find(a => a.id === selectedReportId) || acceptances[0];

  const updateFormatting = (newFmt: Partial<DocumentFormattingOptions>) => {
    if (!canEdit) return;
    const updated: DocumentFormattingOptions = {
      fontSize: newFmt.fontSize !== undefined ? newFmt.fontSize : fontSize,
      lineHeight: newFmt.lineHeight !== undefined ? newFmt.lineHeight : lineHeight,
      paragraphIndent: newFmt.paragraphIndent !== undefined ? newFmt.paragraphIndent : paragraphIndent,
      textAlign: newFmt.textAlign !== undefined ? newFmt.textAlign : textAlign,
      showPage1Header: false,
      showPageNumbers,
    };
    if (newFmt.fontSize !== undefined) setFontSize(newFmt.fontSize);
    if (newFmt.lineHeight !== undefined) setLineHeight(newFmt.lineHeight);
    if (newFmt.paragraphIndent !== undefined) setParagraphIndent(newFmt.paragraphIndent);
    if (newFmt.textAlign !== undefined) setTextAlign(newFmt.textAlign);

    if (onUpdateContract) {
      onUpdateContract({
        ...contract,
        customContent: {
          ...contract.customContent,
          formatting: updated,
          lastEditedAt: new Date().toISOString(),
          lastEditedBy: roleProfile.name,
        }
      });
    }
  };

  const handleDocumentClick = (e: React.MouseEvent) => {
    if (!canEdit) return;
    const target = e.target as HTMLElement;
    const clauseEl = target.closest('[data-clause]');
    if (clauseEl) {
      const clauseNum = Number(clauseEl.getAttribute('data-clause'));
      if (clauseNum >= 1 && clauseNum <= 5) {
        onEdit('clauses', clauseNum);
        return;
      }
    }
    const safetyEl = target.closest('.safety-wysiwyg-content, [data-safety-page]');
    if (safetyEl || docTab === 'safety') {
      onEdit('safety');
      return;
    }
  };

  // Resolve pages based on current selected document tab
  let currentPages: DocumentPage[] = [];
  if (docTab === 'contract') {
    currentPages = getContractPages(contract, worker);
  } else if (docTab === 'safety') {
    currentPages = getSafetyCommitmentPages(contract, worker);
  } else if (docTab === 'acceptance' && selectedReport) {
    currentPages = getAcceptancePages(selectedReport, contract, worker);
  } else {
    currentPages = getAllDocumentPages(contract, worker, selectedReport);
  }

  // Scroll spy to detect active page
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollPos = containerRef.current.scrollTop + 200;
      
      for (let i = pageRefs.current.length - 1; i >= 0; i--) {
        const el = pageRefs.current[i];
        if (el && el.offsetTop <= scrollPos) {
          setActivePageIndex(i);
          break;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPages]);

  const scrollToPage = (index: number) => {
    setActivePageIndex(index);
    if (pageRefs.current[index]) {
      pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    let htmlContent = '';
    let docTitle = '';

    if (docTab === 'contract') {
      htmlContent = generateContractHtmlContent(contract, worker);
      docTitle = `Hop_Dong_${contract.contractNumber.replace(/\//g, '_')}`;
    } else if (docTab === 'safety') {
      htmlContent = generateSafetyCommitmentHtml(contract, worker);
      docTitle = `Cam_Ket_An_Toan_${worker.fullName.replace(/\s+/g, '_')}`;
    } else if (docTab === 'acceptance' && selectedReport) {
      htmlContent = generateAcceptanceHtml(selectedReport, contract, worker);
      docTitle = `Bien_Ban_Nghiem_Thu_${selectedReport.reportNumber.replace(/\//g, '_')}`;
    } else {
      htmlContent = `
        ${generateContractHtmlContent(contract, worker)}
        <div style="page-break-before: always; break-before: page;"></div>
        ${generateSafetyCommitmentHtml(contract, worker)}
        ${selectedReport ? `
          <div style="page-break-before: always; break-before: page;"></div>
          ${generateAcceptanceHtml(selectedReport, contract, worker)}
        ` : ''}
      `;
      docTitle = `Ho_So_Tron_Goi_${contract.contractNumber.replace(/\//g, '_')}`;
    }

    printDocumentHtml(htmlContent, docTitle);
  };

  const handleExportWord = () => {
    let htmlContent = '';
    let docName = '';

    if (docTab === 'contract') {
      htmlContent = generateContractHtmlContent(contract, worker);
      docName = `Hop_Dong_${contract.contractNumber.replace(/\//g, '_')}`;
    } else if (docTab === 'safety') {
      htmlContent = generateSafetyCommitmentHtml(contract, worker);
      docName = `Cam_Ket_An_Toan_${worker.fullName.replace(/\s+/g, '_')}`;
    } else if (docTab === 'acceptance' && selectedReport) {
      htmlContent = generateAcceptanceHtml(selectedReport, contract, worker);
      docName = `Bien_Ban_Nghiem_Thu_${selectedReport.reportNumber.replace(/\//g, '_')}`;
    } else {
      htmlContent = `
        ${generateContractHtmlContent(contract, worker)}
        <br style="page-break-before: always; clear: both;" />
        ${generateSafetyCommitmentHtml(contract, worker)}
        ${selectedReport ? `
          <br style="page-break-before: always; clear: both;" />
          ${generateAcceptanceHtml(selectedReport, contract, worker)}
        ` : ''}
      `;
      docName = `Ho_So_Tron_Goi_${contract.contractNumber.replace(/\//g, '_')}`;
    }

    exportHtmlToWordDoc(htmlContent, docName);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 140));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Ruler tick marks (21 cm total: 0 to 21)
  const rulerMarks = Array.from({ length: 22 }, (_, i) => i);

  return (
    <div className={`flex flex-col bg-[#eef2f7] rounded-xl overflow-hidden border border-slate-300 shadow-xl ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'min-h-[850px]'}`}>
      {/* 1. MICROSOFT WORD ONLINE TOP APPLICATION HEADER */}
      <div className="print:hidden bg-[#0f5499] text-white select-none px-4 py-2.5 flex items-center justify-between border-b border-[#0b427b] shadow-xs">
        {/* Left: Word Icon & Document Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-white/15 rounded-md transition-colors text-white/90 hover:text-white cursor-pointer"
            title="Quay lại bảng danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Microsoft Word Logo Icon */}
          <div className="w-8 h-8 rounded-md bg-[#185abd] border border-blue-400/40 flex items-center justify-center font-bold text-base shadow-xs text-white">
            W
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                Hop_Dong_{contract.contractNumber.replace(/\//g, '_')}.docx
              </span>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-white/15 text-white/90 font-medium">
                Word Online · Đã lưu
              </span>
            </div>
            <div className="text-[11px] text-blue-100 flex items-center gap-1.5 opacity-90">
              <span>{worker.fullName}</span>
              <span>•</span>
              <span>Ga {contract.stationLocation}</span>
              <span>•</span>
              <span className="text-emerald-300 font-medium">Chuẩn in ấn A4 (Nghị định 30/2020/NĐ-CP)</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onCheckLegal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-400/40 rounded-md transition-colors cursor-pointer"
            title="Soát lỗi pháp lý theo Bộ luật Dân sự 2015 & NĐ 253/2026"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Soát Lỗi Pháp Lý</span>
          </button>

          {docTab === 'safety' ? (
            <button
              onClick={() => onEdit('safety')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer border shadow-xs ${
                canEdit
                  ? 'text-white bg-emerald-600 hover:bg-emerald-500 border-emerald-400 ring-2 ring-emerald-300/40'
                  : 'text-amber-200 bg-amber-900/30 hover:bg-amber-900/50 border-amber-400/40'
              }`}
              title={canEdit ? 'Chỉnh sửa toàn bộ nội dung Bản Cam Kết An Toàn bằng công cụ WYSIWYG' : 'Xem nội dung Bản Cam Kết'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>{canEdit ? 'Sửa Bản Cam Kết (WYSIWYG)' : 'Xem Bản Cam Kết'}</span>
            </button>
          ) : (
            <button
              onClick={() => onEdit('clauses')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer border shadow-xs ${
                canEdit
                  ? 'text-white bg-blue-600 hover:bg-blue-500 border-blue-400 ring-2 ring-blue-300/40'
                  : 'text-amber-200 bg-amber-900/30 hover:bg-amber-900/50 border-amber-400/40'
              }`}
              title={canEdit ? 'Chỉnh sửa toàn bộ nội dung hợp đồng từ Điều 1 đến hết trong 1 khung duy nhất' : 'Xem toàn bộ nội dung điều khoản hợp đồng'}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{canEdit ? 'Sửa Toàn Bộ Hợp Đồng (Điều 1 đến hết)' : 'Xem Điều Khoản (Trạm)'}</span>
            </button>
          )}

          <button
            onClick={handleExportWord}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0f5499] bg-white hover:bg-blue-50 rounded-md transition-colors cursor-pointer shadow-xs"
            title="Tải tệp định dạng Microsoft Word (.doc) căn lề sẵn"
          >
            <FileDown className="w-3.5 h-3.5 text-[#0f5499]" />
            <span>Tải File Word (.doc)</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors cursor-pointer shadow-xs"
            title="In trực tiếp hoặc Lưu file PDF chuẩn khổ A4"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In / Xuất PDF</span>
          </button>

          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-400/40 rounded-md transition-colors cursor-pointer"
              title="Xóa hợp đồng này khỏi hệ thống (Quyền Admin)"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-300" />
              <span className="hidden md:inline">Xóa HĐ</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DOCUMENT TABS STRIP (Hồ sơ trọn gói / Hợp đồng / Cam kết / Nghiệm thu) */}
      <div className="print:hidden bg-[#f3f6fa] border-b border-slate-300 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => setDocTab('contract')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              docTab === 'contract'
                ? 'bg-white text-[#0f5499] shadow-xs border border-slate-300 font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#185abd]" />
            <span>Hợp đồng Giao khoán ({getContractPages(contract, worker).length} trang)</span>
          </button>

          <button
            onClick={() => setDocTab('safety')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              docTab === 'safety'
                ? 'bg-white text-[#0f5499] shadow-xs border border-slate-300 font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bản Cam kết An toàn (1 trang)</span>
          </button>

          <button
            onClick={() => setDocTab('acceptance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              docTab === 'acceptance'
                ? 'bg-white text-[#0f5499] shadow-xs border border-slate-300 font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-purple-600" />
            <span>Biên bản Nghiệm thu (1 trang)</span>
          </button>

          <button
            onClick={() => setDocTab('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              docTab === 'all'
                ? 'bg-white text-[#0f5499] shadow-xs border border-slate-300 font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Toàn bộ Hồ sơ Trọn gói ({getAllDocumentPages(contract, worker, selectedReport).length} trang)</span>
          </button>
        </div>

        {/* If Acceptance tab is selected and multiple reports exist, allow picker */}
        {docTab === 'acceptance' && acceptances.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded border border-slate-300">
            <span className="text-slate-500 font-medium">Chọn đợt:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              {acceptances.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.reportNumber} ({acc.periodDescription})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. WORD ONLINE RIBBON TOOLBAR & PRINT MASTER SPECIFICATIONS */}
      <div className="print:hidden bg-white border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 select-none shadow-2xs">
        {/* Left: Typography & Paragraph format specs */}
        <div className="flex items-center gap-2 divide-x divide-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 font-serif font-bold text-slate-900" title="Phông chữ quy chuẩn văn bản">
              Times New Roman
            </span>
            
            {/* Interactive Font Size Selector */}
            <select
              value={fontSize}
              onChange={(e) => updateFormatting({ fontSize: Number(e.target.value) })}
              className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 font-mono text-[11px] font-bold text-slate-800 cursor-pointer focus:ring-1 focus:ring-blue-600"
              title="Cỡ chữ văn bản (Chuẩn NĐ 30 là 13pt)"
            >
              <option value={12}>12 pt</option>
              <option value={13}>13 pt (Chuẩn)</option>
              <option value={14}>14 pt</option>
            </select>
          </div>

          {/* Interactive Alignment & Formatting */}
          <div className="flex items-center gap-1 pl-2 text-slate-600">
            <button
              type="button"
              onClick={() => updateFormatting({ textAlign: 'justify' })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                textAlign === 'justify' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-400 font-bold' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Căn đều hai bên (Justify - chuẩn Nghị định 30)"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => updateFormatting({ textAlign: 'left' })}
              className={`p-1 rounded cursor-pointer transition-colors ${
                textAlign === 'left' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-400 font-bold' : 'hover:bg-slate-100 text-slate-600'
              }`}
              title="Căn lề trái"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>

            {/* Line Spacing Selector */}
            <select
              value={lineHeight}
              onChange={(e) => updateFormatting({ lineHeight: Number(e.target.value) })}
              className="ml-1 px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer focus:ring-1 focus:ring-blue-600"
              title="Khoảng cách dãn dòng"
            >
              <option value={1.2}>Dãn 1.2x</option>
              <option value={1.35}>Dãn 1.35x (Chuẩn)</option>
              <option value={1.45}>Dãn 1.45x</option>
              <option value={1.5}>Dãn 1.5x</option>
            </select>

            {/* Indent Selector */}
            <select
              value={paragraphIndent}
              onChange={(e) => updateFormatting({ paragraphIndent: Number(e.target.value) })}
              className="ml-1 px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-[11px] font-medium text-slate-700 cursor-pointer focus:ring-1 focus:ring-blue-600"
              title="Thụt đầu dòng đoạn văn bản"
            >
              <option value={1.27}>Thụt lề 1.27cm (Chuẩn NĐ 30)</option>
              <option value={1.0}>Thụt lề 1.0cm</option>
              <option value={0}>Không thụt lề</option>
            </select>
          </div>

          {/* Quick Edit Clauses & Safety Commitment Button right on Ribbon */}
          <div className="pl-2">
            {docTab === 'safety' ? (
              <button
                onClick={() => onEdit('safety')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Mở bảng chỉnh sửa chi tiết nội dung Bản cam kết an toàn (WYSIWYG)"
              >
                <Edit3 className="w-3 h-3 text-emerald-600" />
                <span>Sửa Bản Cam Kết An Toàn (WYSIWYG)</span>
              </button>
            ) : (
              <button
                onClick={() => onEdit('clauses')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Mở bảng chỉnh sửa toàn bộ nội dung từ Điều 1 đến hết hợp đồng trong 1 khung duy nhất"
              >
                <Edit3 className="w-3 h-3 text-blue-600" />
                <span>Sửa toàn bộ nội dung (Điều 1 đến hết)</span>
              </button>
            )}
          </div>

          {/* Page Setup Indicator (Matching Image 1: Page Setup) */}
          <div className="hidden xl:flex items-center gap-1.5 pl-2 text-[11px] font-mono">
            <span className="text-slate-400 font-sans">Lề A4:</span>
            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">T: 2cm</span>
            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">B: 2cm</span>
            <span className="bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-blue-800 font-bold" title="Lề trái 3cm đóng gáy hồ sơ">L: 3cm</span>
            <span className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">R: 2cm</span>
          </div>
        </div>

        {/* Right: View & Document display tools */}
        <div className="flex items-center gap-2">
          {/* Toggle Thumbnails */}
          <button
            onClick={() => setShowThumbnails(prev => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              showThumbnails
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Bật/Tắt cột trang thu nhỏ bên trái"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">Trang thu nhỏ</span>
          </button>

          {/* Toggle Ruler */}
          <button
            onClick={() => setShowRuler(prev => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              showRuler
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Bật/Tắt thước đo căn lề cm"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden sm:inline">Thước đo</span>
          </button>

          {/* Toggle Page Numbers */}
          <button
            onClick={() => setShowPageNumbers(prev => !prev)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
              showPageNumbers
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Bật/Tắt hiển thị đánh số trang"
          >
            <span className="text-[11px] font-mono font-bold">123</span>
            <span className="hidden sm:inline">Số trang</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-slate-100 rounded-md border border-slate-200 p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 hover:bg-white rounded cursor-pointer"
              title="Đặt lại 100%"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Phóng to (+)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Chế độ toàn màn hình Word'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4. WORKSPACE BODY: (Optional Sidebar Thumbnails) + (Ruler + Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Thumbnail Drawer */}
        {showThumbnails && (
          <aside className="print:hidden w-44 md:w-52 bg-slate-100 border-r border-slate-300 p-3 overflow-y-auto shrink-0 select-none space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0f5499]" />
                <span>Trang tài liệu ({currentPages.length})</span>
              </span>
            </div>

            <div className="space-y-3">
              {currentPages.map((page, idx) => (
                <div
                  key={page.id || idx}
                  onClick={() => scrollToPage(idx)}
                  className={`group relative rounded-lg border transition-all cursor-pointer p-2 ${
                    activePageIndex === idx
                      ? 'bg-blue-50/80 border-[#0f5499] shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      activePageIndex === idx ? 'bg-[#0f5499] text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Trang {page.pageNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">A4</span>
                  </div>

                  {/* Miniature simulated page thumbnail */}
                  <div className="w-full aspect-[210/297] bg-white border border-slate-200 rounded p-1.5 shadow-2xs overflow-hidden text-[5px] text-slate-300 leading-tight space-y-1 select-none pointer-events-none">
                    <div className="h-1 bg-slate-300 rounded w-2/3 mx-auto"></div>
                    <div className="h-0.5 bg-slate-200 rounded w-1/2 mx-auto"></div>
                    <div className="space-y-0.5 pt-1">
                      <div className="h-0.5 bg-slate-200 rounded w-full"></div>
                      <div className="h-0.5 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-0.5 bg-slate-200 rounded w-4/5"></div>
                      <div className="h-0.5 bg-slate-200 rounded w-full"></div>
                    </div>
                    <div className="pt-1.5 space-y-0.5">
                      <div className="h-0.5 bg-slate-200 rounded w-full"></div>
                      <div className="h-0.5 bg-slate-200 rounded w-3/4"></div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 mt-1 line-clamp-1 font-medium group-hover:text-slate-900">
                    {page.pageLabel}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Center / Main Canvas Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto bg-[#cbd5e1]/70 p-4 md:p-8 flex flex-col items-center"
        >
          {/* USER INSTRUCTION GUIDE BANNER (Directly answers user's request) */}
          {showGuideBanner && (
            <div 
              className="print:hidden mb-4 p-3.5 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-xl flex items-start justify-between gap-3 shadow-xs select-none transition-all"
              style={{
                width: `${210 * (zoomLevel / 100)}mm`,
                maxWidth: '100%',
              }}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-[#0f5499] text-white rounded-lg shrink-0 mt-0.5 shadow-2xs">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-800 leading-relaxed">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Hướng dẫn: Chỉnh sửa toàn bộ nội dung Hợp đồng (Từ Điều 1 đến hết) & Canh lề</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Đã bỏ phần tô đỏ đầu trang 1
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    • <strong>Chỉnh sửa nội dung ở đâu?</strong> Bấm nút <strong>"Sửa Toàn Bộ Hợp Đồng"</strong> hoặc nhấp chuột trực tiếp vào nội dung hợp đồng bên dưới để mở khung soạn thảo toàn bộ từ Điều 1 đến hết hợp đồng trong một khung duy nhất.
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    • <strong>Canh lề & thụt dòng chuẩn:</strong> Sử dụng các nút trên thanh công cụ phía trên để áp dụng <strong>Căn đều 2 bên (Justify)</strong>, <strong>Thụt đầu dòng {paragraphIndent}cm</strong>, <strong>Dãn dòng {lineHeight}x</strong> và lề A4 chuẩn đóng gáy (Trái 3cm, Phải 2cm, Trên 2cm, Dưới 2cm) theo Nghị định 30/2020/NĐ-CP.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideBanner(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200/50 cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* WORD HORIZONTAL RULER (Top Margin Indicator) */}
          {showRuler && (
            <div 
              className="print:hidden mb-4 bg-white border border-slate-300 shadow-sm rounded-t select-none transition-all sticky top-0 z-20"
              style={{
                width: `${210 * (zoomLevel / 100)}mm`,
                maxWidth: '100%',
              }}
            >
              {/* Ruler Bar (0 to 21 cm) */}
              <div className="relative h-6 flex text-[9px] font-mono text-slate-500 overflow-hidden border-b border-slate-200">
                {/* Left Margin (3cm) - Shaded area */}
                <div 
                  className="h-full bg-slate-200/90 border-r border-blue-500 relative flex items-center justify-center font-bold text-blue-800"
                  style={{ width: `${(3 / 21) * 100}%` }}
                  title="Lề trái: 3 cm (Khoảng chừa đóng gáy hồ sơ)"
                >
                  <span className="text-[8px] uppercase tracking-wider">Lề 3cm</span>
                  {/* Indent Triangle Marker */}
                  <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-blue-600"></div>
                  <div className="absolute right-0 bottom-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-blue-600"></div>
                </div>

                {/* Printable Content Area (16cm) - White background */}
                <div 
                  className="h-full bg-white relative flex items-center"
                  style={{ width: `${(16 / 21) * 100}%` }}
                >
                  {/* 16 cm Tick marks */}
                  {Array.from({ length: 16 }, (_, i) => (
                    <div 
                      key={i} 
                      className="absolute bottom-0 border-l border-slate-400 h-2 flex flex-col justify-end"
                      style={{ left: `${((i + 1) / 16) * 100}%` }}
                    >
                      <span className="text-[7.5px] -ml-1 text-slate-500 font-mono -mt-3.5">{i + 1}</span>
                    </div>
                  ))}
                  <div className="w-full text-center text-[8px] text-slate-400 font-sans">
                    Vùng in văn bản chuẩn A4: 16 cm (21cm - 3cm trái - 2cm phải)
                  </div>
                </div>

                {/* Right Margin (2cm) - Shaded area */}
                <div 
                  className="h-full bg-slate-200/90 border-l border-blue-500 relative flex items-center justify-center font-bold text-blue-800"
                  style={{ width: `${(2 / 21) * 100}%` }}
                  title="Lề phải: 2 cm"
                >
                  <span className="text-[8px] uppercase tracking-wider">Lề 2cm</span>
                  {/* Right Indent Triangle Marker */}
                  <div className="absolute left-0 bottom-0 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-blue-600"></div>
                </div>
              </div>
            </div>
          )}

          {/* RENDER PAGES (A4 SHEETS) */}
          <div 
            className="flex flex-col items-center space-y-10 print:space-y-0 transition-transform origin-top"
            style={{
              transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
            }}
          >
            {currentPages.map((page, idx) => (
              <div 
                key={page.id || idx}
                ref={(el) => {
                  pageRefs.current[idx] = el;
                }}
                className="group relative"
              >
                {/* Page Badge Above Sheet */}
                <div className="print:hidden flex items-center justify-between text-xs text-slate-600 mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-200">
                      <FileText className="w-3 h-3 text-[#0f5499]" />
                      Trang {page.pageNumber} / {page.totalInDoc}
                    </span>
                    <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
                      • {page.pageLabel}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 bg-white/60 px-2 py-0.5 rounded border border-slate-200/60">
                    Khổ A4 (210 × 297 mm) · Lề: 2 - 2 - 3 - 2 cm
                  </span>
                </div>

                {/* PHYSICAL A4 PAPER SHEET */}
                <div className="a4-word-page bg-white shadow-2xl border border-slate-300 relative text-black">
                  {/* Page Top Header (According to Admin Layout Standards) */}
                  {/* IMPORTANT: Page 1 MUST NOT have running header (removes the red highlighted bar requested by user) */}
                  {page.pageNumber > 1 && showRunningHeader && (
                    <div className="page-header select-none flex items-center justify-between text-[10pt] text-slate-500 font-serif border-b border-slate-200 pb-2 mb-6">
                      <span className="italic text-slate-500">
                        Tập đoàn Đường sắt Quốc gia Việt Nam - Chi nhánh Nha Trang
                      </span>
                      {showPageNumbers && (
                        <span className="font-semibold text-slate-700">
                          - {page.pageNumber} -
                        </span>
                      )}
                    </div>
                  )}

                  {/* Document Page HTML Body */}
                  <div 
                    className="page-content font-serif leading-relaxed text-justify cursor-pointer"
                    style={{
                      textAlign,
                      lineHeight,
                      fontSize: `${fontSize}pt`,
                    }}
                    onClick={handleDocumentClick}
                    title="Bấm vào nội dung để xem / chỉnh sửa điều khoản tương ứng"
                    dangerouslySetInnerHTML={{ __html: page.htmlContent }} 
                  />

                  {/* Page Bottom Footer */}
                  <div className="page-footer select-none flex items-center justify-between text-[9pt] text-slate-400 font-serif border-t border-slate-200 pt-3 mt-8">
                    <span>
                      Căn cứ Bộ luật Dân sự 2015 & Nghị định 253/2026/NĐ-CP
                    </span>
                    {showPageNumbers && (
                      <span className="font-bold text-slate-600">
                        Trang {page.pageNumber} / {page.totalInDoc}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. WORD ONLINE STATUS BAR (Classic Microsoft Word Blue Bar at Bottom) */}
      <footer className="print:hidden bg-[#0f5499] text-white text-xs select-none px-4 py-1 flex items-center justify-between border-t border-[#0b427b]">
        {/* Left Stats */}
        <div className="flex items-center gap-3">
          <span className="font-medium">
            Trang {activePageIndex + 1} trên {currentPages.length}
          </span>
          <span className="hidden sm:inline opacity-70">|</span>
          <span className="hidden sm:inline opacity-90">
            Khoảng 1.450 từ
          </span>
          <span className="hidden md:inline opacity-70">|</span>
          <span className="hidden md:inline opacity-90">
            Tiếng Việt (Việt Nam)
          </span>
          <span className="hidden lg:inline opacity-70">|</span>
          <span className="hidden lg:inline text-emerald-300 font-medium">
            Bố trí in ấn (Print Layout · Lề 2-2-3-2 cm)
          </span>
        </div>

        {/* Right Zoom Slider */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-white/10 rounded cursor-pointer"
            title="Thu nhỏ"
          >
            -
          </button>

          <input
            type="range"
            min="70"
            max="140"
            step="5"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-20 md:w-28 accent-white h-1 bg-white/30 rounded-lg cursor-pointer"
            title={`Thu phóng: ${zoomLevel}%`}
          />

          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-white/10 rounded cursor-pointer"
            title="Phóng to"
          >
            +
          </button>

          <span className="font-mono text-[11px] w-10 text-right font-bold">
            {zoomLevel}%
          </span>
        </div>
      </footer>

      {/* STYLES FOR SCREEN & HIGH-QUALITY PRINTING */}
      <style>{`
        /* Global Times New Roman typography for legal document */
        .a4-word-page, .a4-word-page * {
          font-family: 'Times New Roman', 'Tinos', Times, Georgia, serif !important;
        }

        /* Physical A4 dimensions with Page Setup margins from user Image 1:
           Top: 20mm (2 cm), Bottom: 20mm (2 cm), Left: 30mm (3 cm), Right: 20mm (2 cm)
        */
        .a4-word-page {
          width: 210mm;
          min-height: 297mm;
          padding-top: 20mm;    /* Top: 2 cm */
          padding-bottom: 20mm; /* Bottom: 2 cm */
          padding-left: 30mm;   /* Left: 3 cm */
          padding-right: 20mm;  /* Right: 2 cm */
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .a4-word-page .page-content {
          flex: 1;
        }

        .page-content {
          text-align: ${textAlign};
          line-height: ${lineHeight};
        }

        .page-content p:not([style*="text-align"]) {
          text-align: ${textAlign};
        }

        .page-content p:not([style*="line-height"]) {
          line-height: ${lineHeight};
        }

        .page-content [data-clause] {
          transition: all 0.15s ease-in-out;
          border-radius: 4px;
        }

        .page-content [data-clause]:hover {
          background-color: rgba(37, 99, 235, 0.03);
          outline: 1.5px dashed #3b82f6;
          outline-offset: 4px;
        }

        @media screen and (max-width: 860px) {
          .a4-word-page {
            width: 100%;
            min-height: auto;
            padding-top: 15mm;
            padding-bottom: 15mm;
            padding-left: 15mm;
            padding-right: 15mm;
          }
        }

        /* Master Print CSS: Clean separate pages without browser headers */
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 30mm; /* Top: 2cm, Right: 2cm, Bottom: 2cm, Left: 3cm */
          }
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .a4-word-page {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
            break-after: page;
          }
          .page-header, .page-footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
