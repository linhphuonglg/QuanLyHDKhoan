import * as XLSX from 'xlsx';
import { WorkerContractor, Contract, AcceptanceReport, WorkerBudgetSummary } from '../types';

export function exportBudgetSummaryToExcel(
  summaries: WorkerBudgetSummary[],
  filename: string = 'Bang_Theo_Doi_Ngan_Sach_Lao_Dong.xlsx'
): void {
  const data = summaries.map((s, idx) => {
    let socialText = 'Lao động tự do vãng lai';
    if (s.worker.socialStatus === 'retired') {
      socialText = `Hưu trí (${s.worker.pensionBookNumber || 'Có sổ hưu'})`;
    } else if (s.worker.socialStatus === 'dual_employer') {
      socialText = `Có BHXH đơn vị 1 (${s.worker.primaryEmployerName || 'Đơn vị khác'})`;
    }

    let statusText = 'An toàn trong định mức';
    if (s.percentUsed > 100) statusText = 'VƯỢT ĐỊNH MỨC';
    else if (s.percentUsed >= 85) statusText = 'Sắp chạm trần ngân sách';

    return {
      'STT': idx + 1,
      'Mã Người LĐ': s.worker.id,
      'Họ và Tên': s.worker.fullName,
      'Số CCCD': s.worker.cccdNumber,
      'Mã số thuế': s.worker.taxCode || 'Chưa cập nhật',
      'Đối tượng An sinh BHXH': socialText,
      'Cam kết thu nhập 08/CK': s.worker.hasTaxCommitmentForm ? 'Đã có' : 'Chưa có',
      'Hạn mức Ngân sách (VNĐ)': s.allocatedBudget,
      'Tổng Nghiệm thu Gross (VNĐ)': s.totalConfirmedGross,
      'Thuế TNCN khấu trừ 10% (VNĐ)': s.totalTaxWithheld,
      'Thực tế Chi trả Net (VNĐ)': s.totalNetPaid,
      'Ngân sách còn lại (VNĐ)': s.remainingBudget,
      'Tỷ lệ đã dùng (%)': Number(s.percentUsed.toFixed(1)),
      'Cảnh báo Ngân sách': statusText,
      'Số HĐ đã ký': s.contractsCount,
      'Số Biên bản nghiệm thu': s.reportsCount,
      'Số Tài khoản': s.worker.bankAccount,
      'Ngân hàng': s.worker.bankName,
      'Số Điện thoại': s.worker.phone,
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 12 }, // Ma NV
    { wch: 22 }, // Ho ten
    { wch: 15 }, // CCCD
    { wch: 14 }, // MST
    { wch: 28 }, // An sinh
    { wch: 15 }, // Cam ket
    { wch: 22 }, // Ngan sach
    { wch: 22 }, // Gross
    { wch: 20 }, // Thue
    { wch: 20 }, // Net
    { wch: 20 }, // Con lai
    { wch: 14 }, // %
    { wch: 22 }, // Canh bao
    { wch: 12 }, // So HD
    { wch: 15 }, // So BB
    { wch: 18 }, // STK
    { wch: 24 }, // Ngan hang
    { wch: 15 }, // SDT
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Theo Dõi Ngân Sách');
  XLSX.writeFile(wb, filename);
}

export function exportAcceptancesToExcel(
  reports: AcceptanceReport[],
  contracts: Contract[],
  workers: WorkerContractor[],
  filename: string = 'Bang_Ke_Nghiem_Thu_Thue_TNCN.xlsx'
): void {
  const workerMap = new Map(workers.map(w => [w.id, w]));
  const contractMap = new Map(contracts.map(c => [c.id, c]));

  const data = reports.map((r, idx) => {
    const worker = workerMap.get(r.workerId);
    const contract = contractMap.get(r.contractId);

    let statusText = 'Chờ xử lý';
    if (r.paymentStatus === 'approved') statusText = 'Đã duyệt chi';
    if (r.paymentStatus === 'paid') statusText = 'Đã thanh toán';

    return {
      'STT': idx + 1,
      'Số Biên bản': r.reportNumber,
      'Số Hợp đồng': contract ? contract.contractNumber : r.contractId,
      'Họ và Tên Bên B': worker ? worker.fullName : r.representativeB,
      'Số CCCD': worker ? worker.cccdNumber : '',
      'Ga tác nghiệp': r.workStation,
      'Đợt / Tháng thực hiện': r.periodDescription,
      'Ngày nghiệm thu': r.acceptanceDate,
      'Khối lượng hoàn thành': `${r.evaluationCompletedWagons} (toa/tấn)`,
      'Tổng giá trị trước thuế Gross (VNĐ)': r.grossAmount,
      'Khấu trừ thuế TNCN 10% (VNĐ)': r.taxAmount,
      'Số tiền thực lĩnh Net (VNĐ)': r.netAmount,
      'Hình thức chi trả': r.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt',
      'Trạng thái thanh toán': statusText,
      'Ngày chi trả': r.paymentDate || 'Chưa chi',
      'Mã chứng từ / UNC': r.paymentReference || '',
      'Đánh giá chất lượng': r.qualityPassed ? 'ĐẠT TIÊU CHUẨN' : 'KHÔNG ĐẠT',
      'Đại diện Chi nhánh ký': `${r.representativeA} (${r.roleA})`,
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 15 },
    { wch: 18 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bảng Kê Nghiệm Thu');
  XLSX.writeFile(wb, filename);
}
