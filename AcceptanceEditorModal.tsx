import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Calculator, AlertCircle } from 'lucide-react';
import { 
  AcceptanceReport, 
  AcceptanceDetailItem, 
  Contract, 
  WorkerContractor,
  UserRole
} from '../types';
import { formatNumber, formatVND } from '../services/numberToWords';
import { FormattedNumberInput } from './FormattedNumberInput';
import { getUserRoleProfile } from '../services/authRoles';

interface AcceptanceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: AcceptanceReport) => void;
  contracts: Contract[];
  workers: WorkerContractor[];
  initialContract?: Contract | null;
  reportToEdit?: AcceptanceReport | null;
  currentRole?: UserRole;
}

export const AcceptanceEditorModal: React.FC<AcceptanceEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contracts,
  workers,
  initialContract,
  reportToEdit,
  currentRole = 'admin',
}) => {
  const roleProfile = getUserRoleProfile(currentRole);
  const [contractId, setContractId] = useState<string>('');
  const [reportNumber, setReportNumber] = useState<string>('');
  const [periodDescription, setPeriodDescription] = useState<string>('');
  const [workStation, setWorkStation] = useState<string>('Ga Nha Trang');
  const [acceptanceDate, setAcceptanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [representativeA, setRepresentativeA] = useState<string>('Trần Văn Tám');
  const [roleA, setRoleA] = useState<string>('Trực ban Ga Nha Trang');
  
  const [items, setItems] = useState<AcceptanceDetailItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'paid'>('paid');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [evaluationNotes, setEvaluationNotes] = useState<string>('Toa xe được làm sạch bùn đất, rác thải thu gom sạch sẽ, kính cửa sổ sáng rõ bảo đảm an toàn kỹ thuật trước giờ chạy tàu.');

  const workerMap = new Map(workers.map(w => [w.id, w]));
  const contractMap = new Map(contracts.map(c => [c.id, c]));

  const selectedContract = contractMap.get(contractId);
  const selectedWorker = selectedContract ? workerMap.get(selectedContract.workerId) : null;

  useEffect(() => {
    if (reportToEdit) {
      setContractId(reportToEdit.contractId);
      setReportNumber(reportToEdit.reportNumber);
      setPeriodDescription(reportToEdit.periodDescription);
      setWorkStation(reportToEdit.workStation);
      setAcceptanceDate(reportToEdit.acceptanceDate);
      setRepresentativeA(reportToEdit.representativeA);
      setRoleA(reportToEdit.roleA);
      setItems(reportToEdit.items);
      setPaymentMethod(reportToEdit.paymentMethod);
      setPaymentStatus(reportToEdit.paymentStatus);
      setPaymentDate(reportToEdit.paymentDate || '');
      setPaymentReference(reportToEdit.paymentReference || '');
      setEvaluationNotes(reportToEdit.evaluationNotes);
    } else {
      const activeContract = initialContract || (contracts.length > 0 ? contracts[0] : null);
      if (activeContract) {
        setContractId(activeContract.id);
        setWorkStation(roleProfile.isStation ? roleProfile.stationName : activeContract.stationLocation);
      } else if (roleProfile.isStation) {
        setWorkStation(roleProfile.stationName);
      }
      
      if (roleProfile.isStation) {
        setRoleA(`Trực ban ${roleProfile.stationName}`);
        setPaymentStatus('pending');
      }

      const year = new Date().getFullYear();
      const randomSeq = String(Math.floor(Math.random() * 90) + 10);
      setReportNumber(`BB-${randomSeq}/${year}/NT`);
      setPeriodDescription(`Đợt Tháng ${new Date().getMonth() + 1}/${year}`);

      // Seed default rows based on contract type
      if (activeContract?.templateType === 'CARGO_DUAL_EMPLOYER' || activeContract?.templateType === 'CARGO_PRINCIPLE_VTHN') {
        const isPrinciple = activeContract?.templateType === 'CARGO_PRINCIPLE_VTHN';
        setItems([
          {
            id: 'item-new-1',
            workDate: new Date().toISOString().split('T')[0],
            wagonOrBatchNumber: isPrinciple ? 'Toa xe G-61348 (Ga Nha Trang)' : 'Đoàn tàu hàng G-2015',
            itemType: 'cargo_package',
            description: isPrinciple ? 'Bốc xếp hàng bao kiện phân bón từ toa xe sang ô tô' : 'Bốc dỡ hàng bao kiện sang xe tải',
            unit: 'tấn',
            quantity: 50,
            unitPrice: activeContract.rateCargoPackage || 48000,
            amount: 50 * (activeContract.rateCargoPackage || 48000),
            notes: 'Hàng không rách bao, bảo đảm an toàn',
          }
        ]);
        setEvaluationNotes('Khối lượng bốc xếp hoàn thành đúng tiến độ giải phóng toa xe; bảo đảm an toàn hàng hóa không vỡ, đúng quy chuẩn ga.');
      } else {
        setItems([
          {
            id: 'item-new-1',
            workDate: new Date().toISOString().split('T')[0],
            wagonOrBatchNumber: 'Đoàn tàu khách SE8 (15 toa)',
            itemType: 'exterior',
            description: 'Rửa sạch vỏ ngoài toa xe khách đón trả',
            unit: 'toa xe',
            quantity: 15,
            unitPrice: activeContract?.rateExteriorWash || 65000,
            amount: 15 * (activeContract?.rateExteriorWash || 65000),
            notes: 'Vỏ ngoài sạch bùn đất',
          },
          {
            id: 'item-new-2',
            workDate: new Date().toISOString().split('T')[0],
            wagonOrBatchNumber: 'Toa xe khách SE8',
            itemType: 'interior',
            description: 'Vệ sinh cọ rửa nội thất và kính cửa sổ',
            unit: 'toa xe',
            quantity: 10,
            unitPrice: activeContract?.rateInteriorWash || 80000,
            amount: 10 * (activeContract?.rateInteriorWash || 80000),
            notes: 'Kính cửa sổ sáng rõ',
          }
        ]);
      }
    }
  }, [reportToEdit, initialContract, isOpen, contracts]);

  // Add Item Row
  const handleAddItem = () => {
    const isCargo = selectedContract?.templateType === 'CARGO_DUAL_EMPLOYER';
    const newItem: AcceptanceDetailItem = {
      id: `item-${Date.now()}`,
      workDate: acceptanceDate,
      wagonOrBatchNumber: isCargo ? 'Toa xe hàng ...' : 'Toa xe khách ...',
      itemType: isCargo ? 'cargo_package' : 'exterior',
      description: isCargo ? 'Bốc xếp hàng hóa' : 'Xịt rửa vỏ ngoài toa xe',
      unit: isCargo ? 'tấn' : 'toa xe',
      quantity: 10,
      unitPrice: isCargo ? (selectedContract?.rateCargoPackage || 45000) : (selectedContract?.rateExteriorWash || 65000),
      amount: 10 * (isCargo ? (selectedContract?.rateCargoPackage || 45000) : (selectedContract?.rateExteriorWash || 65000)),
      notes: '',
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof AcceptanceDetailItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : current.quantity;
      const p = field === 'unitPrice' ? Number(value) : current.unitPrice;
      current.amount = q * p;
    }
    
    updated[index] = current;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const grossAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalWagonsOrTons = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Thuế TNCN theo Nghị định 253/2026/NĐ-CP
  let isTaxWithheld = false;
  let taxRate = 0;
  let taxAmount = 0;

  if (grossAmount >= 5000000) {
    if (selectedWorker?.socialStatus === 'dual_employer') {
      // 2 nơi thu nhập trở lên -> bắt buộc khấu trừ 10%
      isTaxWithheld = true;
      taxRate = 0.1;
      taxAmount = Math.round(grossAmount * 0.1);
    } else if (selectedWorker?.hasTaxCommitmentForm) {
      // Có cam kết thu nhập 08/CK-TNCN -> tạm thời chưa khấu trừ
      isTaxWithheld = false;
      taxRate = 0;
      taxAmount = 0;
    } else {
      // Chưa có cam kết thu nhập -> khấu trừ 10%
      isTaxWithheld = true;
      taxRate = 0.1;
      taxAmount = Math.round(grossAmount * 0.1);
    }
  }

  const netAmount = grossAmount - taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !selectedContract) {
      alert('Vui lòng chọn Hợp đồng tương ứng');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng nhập ít nhất một dòng nghiệm thu khối lượng');
      return;
    }

    const report: AcceptanceReport = {
      id: reportToEdit ? reportToEdit.id : `rep-${Date.now()}`,
      reportNumber,
      contractId,
      workerId: selectedContract.workerId,
      periodDescription,
      workStation,
      acceptanceDate,
      representativeA,
      roleA,
      representativeB: selectedWorker ? selectedWorker.fullName : '',
      items,
      grossAmount,
      isTaxWithheld,
      taxRate,
      taxAmount,
      netAmount,
      paymentStatus,
      paymentMethod,
      paymentDate: paymentStatus === 'paid' ? paymentDate : undefined,
      paymentReference: paymentStatus === 'paid' ? paymentReference : undefined,
      evaluationCompletedWagons: totalWagonsOrTons,
      qualityPassed: true,
      evaluationNotes,
      createdAt: reportToEdit ? reportToEdit.createdAt : new Date().toISOString(),
    };

    onSave(report);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {reportToEdit ? 'Chỉnh Sửa Biên Bản Nghiệm Thu & Xác Nhận' : 'Lập Biên Bản Nghiệm Thu & Xác Nhận Khối Lượng Sản Phẩm'}
            </h2>
            <p className="text-xs text-slate-500">
              Áp dụng khấu trừ 10% thuế TNCN khi từ 5.000.000đ theo Nghị định 253/2026/NĐ-CP
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Thông tin đợt nghiệm thu & căn cứ hợp đồng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Thuộc Hợp Đồng Giao Khoán <span className="text-red-500">*</span>
              </label>
              <select
                value={contractId}
                onChange={(e) => {
                  setContractId(e.target.value);
                  const c = contractMap.get(e.target.value);
                  if (c) setWorkStation(c.stationLocation);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 text-slate-900 font-medium"
              >
                {contracts.map((c) => {
                  const w = workerMap.get(c.workerId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} · {w?.fullName} ({c.stationLocation})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Số Biên Bản Nghiệm Thu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                placeholder="VD: BB-01/2026/NT"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Đợt / Tháng Thực Hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={periodDescription}
                onChange={(e) => setPeriodDescription(e.target.value)}
                placeholder="VD: Đợt ngày 15/09/2026 hoặc Tháng 09/2026"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          {/* Đại diện Chi nhánh và Người lao động */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Người nhận khoán (Bên B):</span>
              <div className="font-bold text-slate-900 mt-0.5">{selectedWorker?.fullName}</div>
              <div className="text-[11px] text-slate-500 font-mono">CCCD: {selectedWorker?.cccdNumber}</div>
            </div>

            <div>
              <span className="text-slate-500">Chế độ BHXH / Thuế:</span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {selectedWorker?.socialStatus === 'dual_employer' ? 'Có BHXH đơn vị 1 (Trừ 10% thuế)' : 
                 selectedWorker?.socialStatus === 'retired' ? 'Hưu trí (Miễn BHXH)' : 'Tự do vãng lai'}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedWorker?.hasTaxCommitmentForm ? 'Đã có Cam kết 08/CK-TNCN' : 'Chưa có Cam kết thu nhập'}
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Đại diện Chi nhánh (Bên A):</label>
              <input
                type="text"
                value={representativeA}
                onChange={(e) => setRepresentativeA(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1">Chức vụ đại diện Bên A:</label>
              <input
                type="text"
                value={roleA}
                onChange={(e) => setRoleA(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
              />
            </div>
          </div>

          {/* Bảng kê chi tiết các toa xe / chuyến hàng */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Khối Lượng Vệ Sinh / Bốc Dỡ Thực Tế Từng Toa Xe
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Dòng</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/80 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Ngày Làm</th>
                    <th className="py-2.5 px-3">Số Hiệu Toa Xe / Nội Dung</th>
                    <th className="py-2.5 px-3 w-24">Số Lượng</th>
                    <th className="py-2.5 px-3 w-32">Đơn Giá (VNĐ)</th>
                    <th className="py-2.5 px-3 w-36 text-right">Thành Tiền (VNĐ)</th>
                    <th className="py-2.5 px-3 w-10 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          value={item.workDate}
                          onChange={(e) => handleUpdateItem(index, 'workDate', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.wagonOrBatchNumber}
                          placeholder="Số hiệu toa (B-31422...)"
                          onChange={(e) => handleUpdateItem(index, 'wagonOrBatchNumber', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded font-medium mb-1"
                        />
                        <input
                          type="text"
                          value={item.description}
                          placeholder="Diễn giải chi tiết công việc..."
                          onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-0.5 text-[11px] text-slate-500 bg-white border border-slate-100 rounded"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                            className="w-16 px-2 py-1 text-xs bg-white border border-slate-200 rounded font-mono font-bold text-center"
                          />
                          <span className="text-[11px] text-slate-500">{item.unit}</span>
                        </div>
                      </td>

                      <td className="py-2 px-3 w-36">
                        <FormattedNumberInput
                          value={item.unitPrice}
                          onChange={(val) => handleUpdateItem(index, 'unitPrice', val)}
                          suffix="₫"
                          className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-right"
                        />
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatNumber(item.amount)} ₫
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tổng kết tài chính & Tính thuế TNCN */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Tổng giá trị sản phẩm hoàn thành (Gross):</span>
              <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                {formatVND(grossAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80">
              <div>
                <span className="font-medium text-slate-700">Khấu trừ thuế TNCN 10% (Nghị định 253/2026/NĐ-CP):</span>
                <span className="ml-2 text-[11px] text-slate-500">
                  {grossAmount < 5000000 
                    ? '(Dưới ngưỡng 5.000.000đ → Miễn khấu trừ)' 
                    : isTaxWithheld 
                      ? '(Trên 5 triệu & thuộc diện khấu trừ 10%)' 
                      : '(Đã có Bản cam kết thu nhập 08/CK-TNCN)'}
                </span>
              </div>
              <span className={`font-mono font-bold tabular-nums ${isTaxWithheld ? 'text-red-600' : 'text-slate-500'}`}>
                {isTaxWithheld ? `- ${formatVND(taxAmount)}` : '0 ₫'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 font-bold">
              <span className="text-emerald-800">SỐ TIỀN THỰC LĨNH CHI TRẢ BÊN B (Net):</span>
              <span className="font-mono text-lg text-emerald-600 tabular-nums">
                {formatVND(netAmount)}
              </span>
            </div>
          </div>

          {/* Phương thức thanh toán & Đánh giá chất lượng */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Trạng Thái Thanh Toán {!roleProfile.canApprovePayment && '(Admin duyệt chi)'}
              </label>
              {roleProfile.canApprovePayment ? (
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
                >
                  <option value="paid">Đã thanh toán (Đã chi trả)</option>
                  <option value="approved">Đã duyệt chi (Chờ chuyển khoản)</option>
                  <option value="pending">Chờ kiểm tra / Phê duyệt</option>
                </select>
              ) : (
                <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium">
                  {paymentStatus === 'paid' ? 'Đã thanh toán (Đã chi trả)' : paymentStatus === 'approved' ? 'Đã duyệt chi' : 'Chờ Admin duyệt chi'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Hình Thức Chi Trả</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
              >
                <option value="bank_transfer">Chuyển khoản Ngân hàng</option>
                <option value="cash">Tiền mặt</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Mã Chứng Từ / Số UNC</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="VD: UNC-VCB-098124"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Đánh Giá Kết Quả Khối Lượng & Chất Lượng</label>
            <input
              type="text"
              value={evaluationNotes}
              onChange={(e) => setEvaluationNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{reportToEdit ? 'Lưu Thay Đổi' : 'Lưu Biên Bản & Cập Nhật Ngân Sách'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
