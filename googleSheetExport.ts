import * as XLSX from 'xlsx';
import { Contract, WorkerContractor, AcceptanceReport } from '../types';

export function exportCompleteGoogleSheetWorkbook(
  contracts: Contract[],
  workers: WorkerContractor[],
  acceptances: AcceptanceReport[]
) {
  const wb = XLSX.utils.book_new();

  const workerMap = new Map(workers.map(w => [w.id, w]));
  const contractMap = new Map(contracts.map(c => [c.id, c]));

  // ==========================================
  // SHEET 1: DANH MỤC LAO ĐỘNG NHẬN KHOÁN
  // ==========================================
  const sheet1Data = [
    [
      'MÃ LAO ĐỘNG',
      'HỌ VÀ TÊN',
      'NGÀY SINH',
      'SỐ CCCD',
      'NGÀY CẤP',
      'NƠI CẤP',
      'ĐỊA CHỈ THƯỜNG TRÚ',
      'MÃ SỐ THUẾ',
      'ĐIỆN THOẠI',
      'SỐ TÀI KHOẢN',
      'NGÂN HÀNG',
      'PHÂN LOẠI LAO ĐỘNG',
      'SỐ SỔ HƯU TRÍ / MÃ BHXH ĐƠN VỊ 1',
      'BẢN CAM KẾT THU NHẬP 08/CK-TNCN',
      'HẠN MỨC NGÂN SÁCH GIAO (VNĐ)',
      'TỔNG TIỀN ĐÃ NGHIỆM THU (VNĐ)',
      'THUẾ TNCN ĐÃ KHẤU TRỪ (VNĐ)',
      'THỰC LĨNH NET (VNĐ)',
      'NGÂN SÁCH CÒN LẠI (VNĐ)',
      'TỶ LỆ GIẢI NGÂN (%)',
      'CẢNH BÁO HẠN MỨC',
      'GHI CHÚ NGHIỆP VỤ'
    ],
    ...workers.map((w, idx) => {
      const workerAcceptances = acceptances.filter(a => a.workerId === w.id);
      const totalGross = workerAcceptances.reduce((sum, a) => sum + a.grossAmount, 0);
      const totalTax = workerAcceptances.reduce((sum, a) => sum + a.taxAmount, 0);
      const totalNet = workerAcceptances.reduce((sum, a) => sum + a.netAmount, 0);
      const remaining = w.allocatedBudget - totalGross;
      const percentUsed = w.allocatedBudget > 0 ? (totalGross / w.allocatedBudget) * 100 : 0;
      
      let statusWarning = 'An toàn trong hạn mức';
      if (percentUsed >= 100) statusWarning = 'VƯỢT HẠN MỨC ĐỊNH MỨC';
      else if (percentUsed >= 85) statusWarning = 'Cảnh báo sắp chạm trần (>=85%)';

      const socialLabel = w.socialStatus === 'retired' 
        ? 'Người hưởng chế độ hưu trí (Miễn BHXH)'
        : w.socialStatus === 'dual_employer'
        ? 'Đang đóng BHXH đơn vị thứ 1'
        : 'Lao động tự do vãng lai';

      const bhxhInfo = w.socialStatus === 'retired' 
        ? (w.pensionBookNumber || 'Đã có sổ hưu')
        : w.socialStatus === 'dual_employer'
        ? `${w.primaryEmployerName} (${w.primaryBhxhCode || 'VssID'})`
        : 'Không thuộc diện BHXH bắt buộc';

      return [
        w.id,
        w.fullName,
        w.birthDate,
        w.cccdNumber,
        w.cccdDate,
        w.cccdPlace,
        w.address,
        w.taxCode,
        w.phone,
        w.bankAccount,
        w.bankName,
        socialLabel,
        bhxhInfo,
        w.hasTaxCommitmentForm ? 'ĐÃ NỘP CAM KẾT (Tạm miễn nếu 1 nguồn)' : 'CHƯA NỘP (Khấu trừ 10% nếu >=5tr)',
        w.allocatedBudget,
        totalGross,
        totalTax,
        totalNet,
        remaining,
        parseFloat(percentUsed.toFixed(1)),
        statusWarning,
        w.notes || ''
      ];
    })
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [
    { wch: 12 }, { wch: 22 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, { wch: 20 },
    { wch: 35 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 25 }, { wch: 30 },
    { wch: 35 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 },
    { wch: 18 }, { wch: 14 }, { wch: 25 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '1_DanhMuc_LaoDong');

  // ==========================================
  // SHEET 2: HỢP ĐỒNG GIAO KHOÁN
  // ==========================================
  const sheet2Data = [
    [
      'MÃ HỢP ĐỒNG',
      'SỐ HỢP ĐỒNG',
      'LOẠI MẪU HỢP ĐỒNG',
      'MÃ LAO ĐỘNG',
      'HỌ VÀ TÊN NGƯỜI NHẬN KHOÁN',
      'GA TÁC NGHIỆP',
      'NGÀY KÝ',
      'NGÀY BẮT ĐẦU',
      'NGÀY HẾT HẠN',
      'ĐƠN GIÁ RỬA NGOÀI (Đ/TOA)',
      'ĐƠN GIÁ RỬA TRONG (Đ/TOA)',
      'ĐƠN GIÁ HÀNG BAO KIỆN (Đ/TẤN)',
      'ĐƠN GIÁ HÀNG RỜI (Đ/TẤN)',
      'TRẠNG THÁI HIỆU LỰC',
      'SỐ ĐỢT NGHIỆM THU',
      'TỔNG TIỀN ĐÃ NGHIỆM THU (VNĐ)',
      'ĐIỀU KHOẢN AN TOÀN ĐƯỜNG SẮT',
      'GHI CHÚ HỢP ĐỒNG'
    ],
    ...contracts.map(c => {
      const worker = workerMap.get(c.workerId);
      const contractAcceptances = acceptances.filter(a => a.contractId === c.id);
      const totalAmount = contractAcceptances.reduce((sum, a) => sum + a.grossAmount, 0);

      let templateName = 'Mẫu 1: Vệ sinh vỏ xe (Tự do)';
      if (c.templateType === 'CLEANING_RETIRED') templateName = 'Mẫu 2: Rửa xe / Bốc dỡ (Hưu trí)';
      else if (c.templateType === 'CARGO_DUAL_EMPLOYER') templateName = 'Mẫu 3: Bốc dỡ (BHXH đơn vị 1)';
      else if (c.templateType === 'CARGO_PRINCIPLE_VTHN') templateName = 'Mẫu 4: HĐNT Bốc xếp Hóa vận Ga (PDF chuẩn)';

      return [
        c.id,
        c.contractNumber,
        templateName,
        c.workerId,
        worker?.fullName || '',
        c.stationLocation,
        c.signDate,
        c.startDate,
        c.endDate,
        c.rateExteriorWash,
        c.rateInteriorWash,
        c.rateCargoPackage,
        c.rateCargoBulk,
        c.status === 'active' ? 'ĐANG HIỆU LỰC' : 'ĐÃ KẾT THÚC',
        contractAcceptances.length,
        totalAmount,
        'Có Bản cam kết an toàn ga tàu đi kèm',
        c.notes || ''
      ];
    })
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 12 }, { wch: 24 }, { wch: 32 }, { wch: 12 }, { wch: 22 }, { wch: 20 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 18 }, { wch: 28 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, '2_HopDong_GiaoKhoan');

  // ==========================================
  // SHEET 3: CHI TIẾT NGHIỆM THU HÓA VẬN & TOA XE
  // ==========================================
  const sheet3Rows: any[] = [
    [
      'SỐ BIÊN BẢN',
      'ĐỢT TÁC NGHIỆP',
      'NGÀY LẬP BB',
      'SỐ HỢP ĐỒNG',
      'GA TÁC NGHIỆP / BỘ PHẬN',
      'ĐẠI DIỆN CHI NHÁNH',
      'CHỨC VỤ BÊN A',
      'NGƯỜI NHẬN KHOÁN',
      'NGÀY THỰC HIỆN',
      'SỐ HIỆU TOA XE / CHUYẾN TÀU',
      'LOẠI CÔNG VIỆC / MẶT HÀNG',
      'ĐƠN VỊ TÍNH',
      'KHỐI LƯỢNG',
      'ĐƠN GIÁ (VNĐ)',
      'THÀNH TIỀN (VNĐ)',
      'ĐÁNH GIÁ CHẤT LƯỢNG'
    ]
  ];

  acceptances.forEach(report => {
    const contract = contractMap.get(report.contractId);
    report.items.forEach(item => {
      sheet3Rows.push([
        report.reportNumber,
        report.periodDescription,
        report.acceptanceDate,
        contract?.contractNumber || '',
        report.workStation,
        report.representativeA,
        report.roleA,
        report.representativeB,
        item.workDate,
        item.wagonOrBatchNumber,
        item.description,
        item.unit,
        item.quantity,
        item.unitPrice,
        item.amount,
        item.notes || 'Đạt tiêu chuẩn kỹ thuật'
      ]);
    });
  });

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Rows);
  ws3['!cols'] = [
    { wch: 18 }, { wch: 25 }, { wch: 12 }, { wch: 24 }, { wch: 25 }, { wch: 18 },
    { wch: 20 }, { wch: 22 }, { wch: 12 }, { wch: 28 }, { wch: 35 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, ws3, '3_NghiemThu_HoaVan');

  // ==========================================
  // SHEET 4: THEO DÕI THUẾ TNCN & CHI TRẢ (NĐ 253/2026/NĐ-CP)
  // ==========================================
  const sheet4Data = [
    [
      'SỐ BIÊN BẢN',
      'NGÀY LẬP BB',
      'HỌ TÊN NGƯỜI NHẬN KHOÁN',
      'MÃ SỐ THUẾ',
      'SỐ TÀI KHOẢN NHẬN TIỀN',
      'NGÂN HÀNG',
      'ĐỐI TƯỢNG LAO ĐỘNG',
      'CAM KẾT 08/CK-TNCN',
      'TỔNG TIỀN TRƯỚC THUẾ - GROSS (VNĐ)',
      'QUY TẮC THUẾ THEO NĐ 253/2026/NĐ-CP',
      'THUẾ SUẤT KHẤU TRỪ',
      'TIỀN THUẾ TNCN KHẤU TRỪ (VNĐ)',
      'SỐ TIỀN THỰC LĨNH - NET (VNĐ)',
      'TRẠNG THÁI THANH TOÁN',
      'HÌNH THỨC CHI',
      'NGÀY CHI TIỀN',
      'MÃ ỦY NHIỆM CHI / SỐ PHIẾU CHI',
      'CHỨNG TỪ KHẤU TRỪ THUẾ ĐIỆN TỬ'
    ],
    ...acceptances.map(report => {
      const worker = workerMap.get(report.workerId);

      let ruleExplanation = 'Dưới 5 triệu (0%)';
      if (report.grossAmount >= 5000000) {
        if (report.isTaxWithheld) {
          ruleExplanation = '>= 5 triệu: Khấu trừ 10% tại nguồn (NĐ 253)';
        } else {
          ruleExplanation = '>= 5 triệu: Tạm miễn do có Cam kết 08/CK-TNCN';
        }
      }

      let paymentStatusVi = 'Chờ duyệt chi';
      if (report.paymentStatus === 'approved') paymentStatusVi = 'Đã duyệt chi, đang chuyển khoản';
      else if (report.paymentStatus === 'paid') paymentStatusVi = 'ĐÃ THANH TOÁN';

      return [
        report.reportNumber,
        report.acceptanceDate,
        report.representativeB,
        worker?.taxCode || '',
        worker?.bankAccount || '',
        worker?.bankName || '',
        worker?.socialStatus === 'retired' ? 'Hưu trí' : worker?.socialStatus === 'dual_employer' ? 'BHXH đơn vị 1' : 'Tự do',
        worker?.hasTaxCommitmentForm ? 'ĐÃ NỘP BẢN CAM KẾT' : 'CHƯA NỘP',
        report.grossAmount,
        ruleExplanation,
        report.isTaxWithheld ? '10%' : '0%',
        report.taxAmount,
        report.netAmount,
        paymentStatusVi,
        report.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt',
        report.paymentDate || '',
        report.paymentReference || '',
        report.isTaxWithheld ? 'Cấp chứng từ điện tử cho Bên B' : 'Không phát sinh thuế'
      ];
    })
  ];

  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 18 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 25 },
    { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 35 }, { wch: 12 }, { wch: 18 },
    { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, ws4, '4_TheoDoi_ThueTNCN_ChiTra');

  // ==========================================
  // SHEET 5: DASHBOARD GIÁM SÁT NGÂN SÁCH LAO ĐỘNG
  // ==========================================
  const totalAllocated = workers.reduce((sum, w) => sum + w.allocatedBudget, 0);
  const totalGrossAll = acceptances.reduce((sum, a) => sum + a.grossAmount, 0);
  const totalTaxAll = acceptances.reduce((sum, a) => sum + a.taxAmount, 0);
  const totalNetAll = acceptances.reduce((sum, a) => sum + a.netAmount, 0);
  const totalRemainingAll = totalAllocated - totalGrossAll;
  const overallPercent = totalAllocated > 0 ? (totalGrossAll / totalAllocated) * 100 : 0;

  const sheet5Data = [
    ['CHI NHÁNH VẬN TẢI ĐƯỜNG SẮT NHA TRANG'],
    ['BẢNG TỔNG HỢP THEO DÕI NGÂN SÁCH GIAO KHOÁN & THUẾ TNCN NĂM 2026'],
    ['(Tương thích hoàn toàn với Google Sheets - Dùng công thức SUMIF/COUNTIF)'],
    [''],
    ['CHỈ SỐ TỔNG HỢP TOÀN CHI NHÁNH', 'GIÁ TRỊ (VNĐ)', 'TỶ LỆ / GHI CHÚ'],
    ['Tổng ngân sách giao khoán được phê duyệt', totalAllocated, '100%'],
    ['Tổng giá trị khối lượng đã nghiệm thu (Gross)', totalGrossAll, `${overallPercent.toFixed(1)}% ngân sách`],
    ['Tổng tiền thuế TNCN đã khấu trừ nộp NSNN (10%)', totalTaxAll, 'Theo NĐ 253/2026/NĐ-CP'],
    ['Tổng số tiền thực tế đã chi trả người lao động (Net)', totalNetAll, 'Đã chuyển khoản / tiền mặt'],
    ['Tổng ngân sách còn lại chưa giải ngân', totalRemainingAll, `${(100 - overallPercent).toFixed(1)}% còn lại`],
    ['Tổng số hợp đồng đang vận hành', contracts.length, 'Bao gồm HĐ bốc xếp HĐNT-VTHN-NT'],
    ['Tổng số biên bản nghiệm thu đã lập', acceptances.length, 'Đợt tác nghiệp'],
    [''],
    ['BẢNG CHI TIẾT THEO DÕI TỪNG LAO ĐỘNG (CÔNG THỨC GOOGLE SHEETS)'],
    [
      'STT',
      'Họ và tên',
      'Mã số thuế',
      'Nhóm đối tượng',
      'Ngân sách giao (Allocated)',
      'Đã nghiệm thu (Gross)',
      'Thuế TNCN khấu trừ',
      'Thực chi Net',
      'Ngân sách còn lại',
      'Tỷ lệ sử dụng',
      'Tình trạng hạn mức'
    ],
    ...workers.map((w, idx) => {
      const wAcceptances = acceptances.filter(a => a.workerId === w.id);
      const gross = wAcceptances.reduce((sum, a) => sum + a.grossAmount, 0);
      const tax = wAcceptances.reduce((sum, a) => sum + a.taxAmount, 0);
      const net = wAcceptances.reduce((sum, a) => sum + a.netAmount, 0);
      const rem = w.allocatedBudget - gross;
      const pct = w.allocatedBudget > 0 ? (gross / w.allocatedBudget) * 100 : 0;
      
      let badge = 'Bình thường';
      if (pct >= 100) badge = 'VƯỢT NGÂN SÁCH';
      else if (pct >= 85) badge = 'Sắp chạm trần (>=85%)';

      return [
        idx + 1,
        w.fullName,
        w.taxCode,
        w.socialStatus === 'retired' ? 'Hưu trí' : w.socialStatus === 'dual_employer' ? 'BHXH đơn vị 1' : 'Tự do',
        w.allocatedBudget,
        gross,
        tax,
        net,
        rem,
        `${pct.toFixed(1)}%`,
        badge
      ];
    })
  ];

  const ws5 = XLSX.utils.aoa_to_sheet(sheet5Data);
  ws5['!cols'] = [
    { wch: 6 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
    { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 22 }
  ];
  XLSX.utils.book_append_sheet(wb, ws5, '5_Dashboard_NganSach');

  // ==========================================
  // SHEET 6: HƯỚNG DẪN MỞ BẰNG GOOGLE SHEETS
  // ==========================================
  const sheet6Data = [
    ['HƯỚNG DẪN SỬ DỤNG VÀ ĐỒNG BỘ TRÊN GOOGLE SHEETS (GOOGLE DRIVE)'],
    [''],
    ['1. CÁCH ĐƯA FILE LÊN GOOGLE DRIVE:'],
    ['Bước 1:', 'Truy cập drive.google.com bằng tài khoản email công vụ (ví dụ: infodsnhatrang@vantainhatrang.vn).'],
    ['Bước 2:', 'Nhấn nút "Mới" (+ New) -> "Tải tệp lên" (File upload) -> Chọn tệp Excel này vừa tải về.'],
    ['Bước 3:', 'Nhấp đúp chuột vào tệp trên Google Drive -> Chọn "Mở bằng Google Trang tính" (Open with Google Sheets).'],
    ['Bước 4:', 'Tệp sẽ tự động chuyển đổi thành Google Sheets chính thức mà không bị mất bất kỳ dữ liệu nào.'],
    [''],
    ['2. CÁC CÔNG THỨC GOOGLE SHEETS ĐỀ XUẤT ÁP DỤNG TRONG FILE:'],
    ['Công thức tính tổng Gross từng người:', "=SUMIF('4_TheoDoi_ThueTNCN_ChiTra'!C:C, B15, '4_TheoDoi_ThueTNCN_ChiTra'!I:I)"],
    ['Công thức tính thuế TNCN 10% theo NĐ 253:', "=IF(AND(I2>=5000000, H2=\"CHƯA NỘP\"), I2*10%, 0)"],
    ['Công thức tính số tiền thực lĩnh Net:', "=I2 - L2"],
    ['Công thức cảnh báo ngân sách:', "=IF(J15>=100%, \"VƯỢT HẠN MỨC\", IF(J15>=85%, \"CẢNH BÁO CHẠM TRẦN\", \"AN TOÀN\"))"],
    [''],
    ['3. PHÂN QUYỀN CHIA SẺ VÀ BẢO MẬT:'],
    ['- Phòng Kế toán - Tài chính:', 'Cấp quyền "Chỉnh sửa" (Editor) để cập nhật ngày chi tiền, số Ủy nhiệm chi và nộp thuế.'],
    ['- Trực ban Hóa vận các Ga (Nha Trang, Tháp Chàm, Diên Khánh):', 'Cấp quyền "Chỉnh sửa" chỉ riêng Sheet 3 (NghiemThu_HoaVan) để nhập số toa và số tấn.'],
    ['- Ban Giám đốc Chi nhánh:', 'Quyền "Xem" (Viewer) để theo dõi Dashboard biểu đồ ngân sách theo thời gian thực.']
  ];

  const ws6 = XLSX.utils.aoa_to_sheet(sheet6Data);
  ws6['!cols'] = [{ wch: 15 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, ws6, '6_HuongDan_GoogleSheet');

  // Trigger file download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `DS_NhaTrang_QuanLy_HopDong_NganSach_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
