import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  Sparkles, 
  Scale, 
  BookOpen, 
  FileText,
  FileCheck2,
  AlertOctagon
} from 'lucide-react';
import { Contract, WorkerContractor, AcceptanceReport } from '../types';
import { auditContractCompliance, askGeminiLegalAdvisor, LegalRiskAudit } from '../services/aiLegalAdvisor';

interface LegalHrConsultantProps {
  contracts: Contract[];
  workers: WorkerContractor[];
  acceptances: AcceptanceReport[];
  selectedContractId?: string;
}

export const LegalHrConsultant: React.FC<LegalHrConsultantProps> = ({
  contracts,
  workers,
  acceptances,
  selectedContractId,
}) => {
  const [activeContractId, setActiveContractId] = useState<string>(
    selectedContractId || (contracts.length > 0 ? contracts[0].id : '')
  );

  const [question, setQuestion] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý Chuyên gia Pháp lý & HR của Chi nhánh Vận tải đường sắt Nha Trang. Tôi có thể hỗ trợ rà soát rủi ro pháp lý các mẫu hợp đồng giao khoán, tư vấn tuân thủ Bộ luật Dân sự 2015, Luật BHXH 2024 và chính sách khấu trừ 10% thuế TNCN từ 5 triệu đồng theo Nghị định 253/2026/NĐ-CP. Bạn cần giải đáp tình huống nào?'
    }
  ]);

  const contractMap = new Map(contracts.map(c => [c.id, c]));
  const workerMap = new Map(workers.map(w => [w.id, w]));

  const currentContract = contractMap.get(activeContractId);
  const currentWorker = currentContract ? workerMap.get(currentContract.workerId) : null;

  // Run audit
  const audit: LegalRiskAudit | null = (currentContract && currentWorker)
    ? auditContractCompliance(currentContract, currentWorker, acceptances)
    : null;

  const handleAskQuestion = async (promptText?: string) => {
    const q = promptText || question;
    if (!q.trim() || loadingAi) return;

    const userMsg = q;
    setQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoadingAi(true);

    try {
      const context = currentContract && currentWorker
        ? `Hợp đồng đang xem xét: ${currentContract.contractNumber}, Người nhận khoán: ${currentWorker.fullName}, Nhóm đối tượng: ${currentWorker.socialStatus}, Ga tác nghiệp: ${currentContract.stationLocation}`
        : 'Chi nhánh Vận tải đường sắt Nha Trang';

      const answer = await askGeminiLegalAdvisor(userMsg, context);
      setChatHistory(prev => [...prev, { sender: 'ai', text: answer }]);
    } catch (e) {
      setChatHistory(prev => [
        ...prev, 
        { sender: 'ai', text: 'Có lỗi kết nối. Hãy xem các quy định chuẩn trong cẩm nang pháp lý bên dưới.' }
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Chuyên Gia Tư Vấn Pháp Lý & Nhân Sự (HR Legal Compliance)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đảm bảo tính hợp pháp, loại trừ nguy cơ tái phân loại HĐLĐ và bảo đảm khấu trừ 10% thuế TNCN chuẩn Nghị định 253/2026/NĐ-CP
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Chọn hợp đồng để rà soát:</span>
          <select
            value={activeContractId}
            onChange={(e) => setActiveContractId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-slate-900"
          >
            {contracts.map(c => {
              const w = workerMap.get(c.workerId);
              return (
                <option key={c.id} value={c.id}>
                  {c.contractNumber} · {w?.fullName}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Main Grid: Left is Legal Audit Report, Right is AI Q&A & Legal Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Automated Contract Audit (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {audit ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{audit.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        audit.level === 'safe'
                          ? 'bg-emerald-50 text-emerald-700'
                          : audit.level === 'warning'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {audit.level === 'safe' ? 'Đạt Chuẩn An Toàn' : audit.level === 'warning' ? 'Cần Chú Ý' : 'Rủi Ro Cao'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{audit.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {audit.score}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Finding items */}
              <div className="space-y-3">
                {audit.findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      finding.status === 'alert'
                        ? 'border-red-200 bg-red-50/50'
                        : finding.status === 'warning'
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        {finding.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {finding.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                        {finding.status === 'alert' && <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />}
                        <span>{finding.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono italic">
                        {finding.legalReference}
                      </span>
                    </div>

                    <p className="text-slate-600">{finding.description}</p>

                    <div className="pt-1 text-[11px] font-medium text-slate-800 flex items-start gap-1">
                      <span className="text-blue-700 font-semibold shrink-0">Khuyến nghị HR:</span>
                      <span>{finding.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
              Vui lòng chọn một hợp đồng để bắt đầu quét lỗi tuân thủ.
            </div>
          )}

          {/* Quick Legal Knowledge Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Nghị định 253/2026/NĐ-CP (Thuế TNCN)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Khấu trừ 10% tại nguồn đối với mỗi lần chi trả từ 5.000.000đ trở lên. Chỉ người có duy nhất 1 nguồn thu nhập trong năm và ước tính chưa đến ngưỡng chịu thuế mới được làm bản cam kết tạm miễn.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Luật Bảo hiểm xã hội 2024</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Người hưởng chế độ hưu trí (Điểm a Khoản 7 Điều 2) và người đang tham gia BHXH tại đơn vị thứ nhất không thuộc đối tượng phải trích đóng BHXH lần hai tại Chi nhánh.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Q&A Assistant (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden h-[600px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900">Trợ Lý AI Pháp Lý & HR</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Gemini 2.5 Flash / Legal Engine</span>
          </div>

          {/* Quick FAQ prompts */}
          <div className="p-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleAskQuestion('Quy định khấu trừ 10% thuế TNCN từ 5 triệu đồng theo Nghị định 253/2026/NĐ-CP?')}
              className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 hover:border-blue-400 whitespace-nowrap cursor-pointer transition-colors"
            >
              Thuế 10% (NĐ 253)
            </button>
            <button
              onClick={() => handleAskQuestion('Người hưu trí làm khoán rửa toa xe có phải đóng BHXH không?')}
              className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 hover:border-blue-400 whitespace-nowrap cursor-pointer transition-colors"
            >
              BHXH người hưu trí
            </button>
            <button
              onClick={() => handleAskQuestion('Bản cam kết an toàn lao động ga tàu có loại trừ được trách nhiệm bồi thường tai nạn không?')}
              className="text-[10px] bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 hover:border-blue-400 whitespace-nowrap cursor-pointer transition-colors"
            >
              Cam kết an toàn ga
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loadingAi && (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Chuyên gia AI đang phân tích điều khoản luật...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAskQuestion();
                }}
                placeholder="Đặt câu hỏi pháp lý hoặc tình huống hợp đồng..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white text-slate-900"
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={loadingAi || !question.trim()}
                className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
