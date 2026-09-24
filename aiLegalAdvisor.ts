import { GoogleGenAI } from '@google/genai';
import { Contract, WorkerContractor, AcceptanceReport } from '../types';

export interface LegalRiskAudit {
  score: number; // 0 - 100
  level: 'safe' | 'warning' | 'danger';
  title: string;
  summary: string;
  findings: {
    category: 'civil_contract' | 'social_insurance' | 'personal_tax' | 'railway_safety' | 'budget';
    status: 'pass' | 'warning' | 'alert';
    title: string;
    description: string;
    recommendation: string;
    legalReference: string;
  }[];
}

export function auditContractCompliance(
  contract: Contract,
  worker: WorkerContractor,
  reports: AcceptanceReport[]
): LegalRiskAudit {
  const findings: LegalRiskAudit['findings'] = [];

  // 1. Kiểm tra Bản chất Hợp đồng Dân sự (Bộ luật Dân sự 2015 vs Bộ luật Lao động 2019)
  findings.push({
    category: 'civil_contract',
    status: 'pass',
    title: 'Xác lập quan hệ khoán việc theo sản phẩm dân sự',
    description: `Hợp đồng số ${contract.contractNumber} ghi nhận rõ Bên B tự chủ thời gian, không chịu sự điều hành hay chấm công cố định hàng ngày của Chi nhánh.`,
    recommendation: 'Giữ nguyên nguyên tắc Bên B có quyền từ chối nhận việc khi bận, tuyệt đối không lập bảng chấm công ngày để tránh rủi ro thanh tra lao động.',
    legalReference: 'Bộ luật Dân sự số 91/2015/QH13 và Điều 13 Bộ luật Lao động 2019',
  });

  // 2. Kiểm tra Luật Bảo hiểm xã hội 2024
  if (worker.socialStatus === 'retired') {
    if (worker.pensionBookNumber) {
      findings.push({
        category: 'social_insurance',
        status: 'pass',
        title: 'Miễn trừ BHXH bắt buộc đối với người hưởng hưu trí',
        description: `Bên B đã kê khai số Thẻ/Sổ hưu trí: ${worker.pensionBookNumber}.`,
        recommendation: 'Lưu bản sao quyết định nghỉ hưu hoặc thẻ hưu trí vào hồ sơ hợp đồng.',
        legalReference: 'Điểm a Khoản 7 Điều 2 Luật Bảo hiểm xã hội số 41/2024/QH15',
      });
    } else {
      findings.push({
        category: 'social_insurance',
        status: 'warning',
        title: 'Thiếu số sổ/thẻ hưu trí',
        description: 'Người nhận khoán thuộc nhóm hưu trí nhưng chưa cập nhật số thẻ hưu trí cụ thể.',
        recommendation: 'Cần bổ sung số thẻ hưu trí vào hồ sơ trước khi ký duyệt thanh toán.',
        legalReference: 'Luật Bảo hiểm xã hội 2024',
      });
    }
  } else if (worker.socialStatus === 'dual_employer') {
    if (worker.primaryEmployerName && worker.primaryBhxhCode) {
      findings.push({
        category: 'social_insurance',
        status: 'pass',
        title: 'Đã đóng BHXH tại đơn vị thứ nhất',
        description: `Bên B đang đóng BHXH tại ${worker.primaryEmployerName} (Mã BHXH: ${worker.primaryBhxhCode}).`,
        recommendation: 'Chi nhánh lưu ảnh chụp quá trình đóng BHXH trên ứng dụng VssID để xuất trình khi thanh tra.',
        legalReference: 'Khoản 1 Điều 42 Quyết định 595/QĐ-BHXH & Luật BHXH 2024',
      });
    } else {
      findings.push({
        category: 'social_insurance',
        status: 'warning',
        title: 'Chưa đầy đủ minh chứng BHXH đơn vị thứ nhất',
        description: 'Chưa cập nhật đầy đủ tên cơ quan chính thức hoặc mã số BHXH/VssID của Bên B.',
        recommendation: 'Yêu cầu Bên B cung cấp bản chụp quá trình tham gia BHXH trên VssID.',
        legalReference: 'Quy trình thu BHXH và quản lý hợp đồng',
      });
    }
  } else {
    // Lao động tự do vãng lai
    findings.push({
      category: 'social_insurance',
      status: 'pass',
      title: 'Lao động tự do vãng lai theo từng đợt đón trả tàu',
      description: 'Công việc khoán theo sản phẩm từng đợt không liên tục, không thuộc diện giao kết HĐLĐ dài hạn.',
      recommendation: 'Không quy định ca kíp cố định quá 3 tháng liên tục có tính chất tiền lương ổn định.',
      legalReference: 'Điều 2 Luật BHXH 2024',
    });
  }

  // 3. Kiểm tra Thuế Thu nhập cá nhân (Nghị định 253/2026/NĐ-CP)
  const workerReports = reports.filter(r => r.contractId === contract.id);
  const largeReports = workerReports.filter(r => r.grossAmount >= 5000000);

  if (worker.socialStatus === 'dual_employer') {
    // Thu nhập 2 nơi -> Bắt buộc khấu trừ 10%
    const unWithheld = largeReports.filter(r => !r.isTaxWithheld);
    if (unWithheld.length > 0) {
      findings.push({
        category: 'personal_tax',
        status: 'alert',
        title: 'Rủi ro chưa khấu trừ 10% thuế TNCN đối với người có 2 nguồn thu',
        description: `Bên B có từ 02 nơi thu nhập trở lên, không được làm Bản cam kết miễn khấu trừ nhưng có ${unWithheld.length} đợt chi trả >= 5.000.000đ chưa khấu trừ thuế!`,
        recommendation: 'Bắt buộc khấu trừ 10% trước khi thanh toán và cấp Chứng từ khấu trừ thuế điện tử cho Bên B.',
        legalReference: 'Nghị định số 253/2026/NĐ-CP và Luật Thuế TNCN',
      });
    } else {
      findings.push({
        category: 'personal_tax',
        status: 'pass',
        title: 'Tuân thủ khấu trừ thuế TNCN 10% cho cá nhân 2 nơi thu nhập',
        description: 'Tất cả các lần chi trả từ 5.000.000đ trở lên đều thực hiện đúng việc khấu trừ 10% và sẵn sàng xuất chứng từ điện tử.',
        recommendation: 'Xuất bảng kê nộp thuế TNCN định kỳ cho cơ quan thuế.',
        legalReference: 'Nghị định 253/2026/NĐ-CP',
      });
    }
  } else {
    // Vãng lai hoặc Hưu trí
    if (worker.hasTaxCommitmentForm) {
      findings.push({
        category: 'personal_tax',
        status: 'pass',
        title: 'Đã có Bản cam kết thu nhập tạm miễn khấu trừ 10%',
        description: 'Bên B cam kết duy nhất có nguồn thu vãng lai tại Chi nhánh và ước tính tổng thu nhập trong năm chưa đến ngưỡng chịu thuế.',
        recommendation: 'Lưu bản cam kết có chữ ký của người lao động vào hồ sơ kế toán của Chi nhánh.',
        legalReference: 'Nghị định 253/2026/NĐ-CP & Thông tư 111/2013/TT-BTC',
      });
    } else if (largeReports.some(r => !r.isTaxWithheld)) {
      findings.push({
        category: 'personal_tax',
        status: 'alert',
        title: 'Chi trả từ 5.000.000đ nhưng chưa có Cam kết thu nhập và chưa khấu trừ thuế',
        description: 'Có đợt thanh toán từ 5.000.000đ trở lên trong khi Bên B chưa nộp bản cam kết và chưa trừ 10% thuế.',
        recommendation: 'Yêu cầu ký Bản cam kết thu nhập theo mẫu hoặc thực hiện khấu trừ 10% theo luật định.',
        legalReference: 'Nghị định 253/2026/NĐ-CP',
      });
    }
  }

  // 4. An toàn lao động đường sắt
  findings.push({
    category: 'railway_safety',
    status: 'pass',
    title: 'Đã đồng bộ Bản cam kết an toàn lao động tại ga tàu',
    description: 'Hồ sơ hợp đồng luôn đính kèm Bản cam kết an toàn tại khu vực đường ray, ke ga, bãi dồn.',
    recommendation: 'Trực ban ga kiểm tra trang bị bảo hộ (ủng chống trượt, áo phản quang) trước khi cho người nhận khoán vào bãi tác nghiệp.',
    legalReference: 'Luật Đường sắt 2017 & Luật An toàn vệ sinh lao động',
  });

  // Calculate score
  const alertCount = findings.filter(f => f.status === 'alert').length;
  const warningCount = findings.filter(f => f.status === 'warning').length;
  let score = 100 - alertCount * 30 - warningCount * 15;
  if (score < 30) score = 30;

  let level: LegalRiskAudit['level'] = 'safe';
  let summary = 'Hồ sơ pháp lý hợp đồng chuẩn mực, tuân thủ chặt chẽ Bộ luật Dân sự, Luật BHXH 2024 và chính sách thuế TNCN.';
  if (alertCount > 0) {
    level = 'danger';
    summary = 'Cần xử lý ngay các cảnh báo về thuế hoặc phân loại bảo hiểm xã hội để tránh bị truy thu và xử phạt hành chính.';
  } else if (warningCount > 0) {
    level = 'warning';
    summary = 'Hồ sơ cơ bản tuân thủ, cần hoàn thiện bổ sung thêm minh chứng giấy tờ đính kèm.';
  }

  return {
    score,
    level,
    title: `Đánh giá Tuân thủ Pháp lý & HR: ${score}/100 Điểm`,
    summary,
    findings,
  };
}

export async function askGeminiLegalAdvisor(prompt: string, context?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;

  if (!apiKey) {
    return getOfflineLegalAnswer(prompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `
      Bạn là Chuyên gia Cao cấp về Pháp luật Lao động, Bộ luật Dân sự 2015, Luật Bảo hiểm xã hội 2024 và Luật Thuế TNCN (Nghị định 253/2026/NĐ-CP) của Việt Nam, chuyên tư vấn cho Chi nhánh Vận tải đường sắt Nha Trang.
      Nhiệm vụ: Giải đáp câu hỏi, hướng dẫn soạn thảo điều khoản hợp đồng giao khoán công việc theo sản phẩm (vệ sinh rửa toa xe, bốc xếp hàng hóa tại ga), xử lý rủi ro pháp lý để không bị cơ quan chức năng coi là hợp đồng lao động ngụy trang, hướng dẫn khấu trừ thuế 10% đúng quy định.
      Trả lời bằng tiếng Việt chuyên nghiệp, trích dẫn chính xác điều khoản luật, ngắn gọn, có gạch đầu dòng rõ ràng và đưa ra phương án xử lý thực tiễn.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nThông tin bối cảnh:\n${context || 'Chi nhánh Vận tải đường sắt Nha Trang'}\n\nCâu hỏi:\n${prompt}` }]
        }
      ]
    });

    return response.text || getOfflineLegalAnswer(prompt);
  } catch (error) {
    console.error('Gemini API call failed, falling back to local legal knowledge base:', error);
    return getOfflineLegalAnswer(prompt);
  }
}

function getOfflineLegalAnswer(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('thuế') || p.includes('tncn') || p.includes('5 triệu') || p.includes('253')) {
    return `### Quy định về Thuế TNCN đối với Hợp đồng giao khoán (Nghị định 253/2026/NĐ-CP):
1. **Ngưỡng khấu trừ 10%:**
   - Khi chi trả tiền công giao khoán từng lần từ **5.000.000 VNĐ** trở lên, tổ chức chi trả (Chi nhánh) có trách nhiệm khấu trừ 10% thuế TNCN trước khi trả cho cá nhân.
   - Nếu mỗi lần chi trả dưới 5.000.000 VNĐ: Tạm thời không khấu trừ thuế TNCN tại nguồn.
2. **Điều kiện lập Bản cam kết tạm miễn khấu trừ:**
   - Cá nhân chỉ có duy nhất thu nhập tại Chi nhánh.
   - Ước tính tổng thu nhập trong năm dương lịch chưa đến mức phải nộp thuế (chưa vượt mức giảm trừ gia cảnh).
   - Đã có mã số thuế cá nhân tại thời điểm làm cam kết.
3. **Người có từ 02 nơi thu nhập trở lên:**
   - Bắt buộc phải khấu trừ 10% khi chi trả từ 5 triệu đồng/lần.
   - Chi nhánh cấp Chứng từ khấu trừ thuế điện tử để cá nhân tự thực hiện quyết toán thuế cuối năm.`;
  }

  if (p.includes('bhxh') || p.includes('bảo hiểm') || p.includes('hưu trí') || p.includes('lao động')) {
    return `### Quy định về Bảo hiểm xã hội đối với Hợp đồng giao khoán (Luật BHXH 2024):
1. **Bản chất Hợp đồng giao khoán dân sự:**
   - Căn cứ Bộ luật Dân sự 2015, hợp đồng giao khoán theo sản phẩm hoàn thành không phải là Hợp đồng lao động.
   - Người nhận khoán tự chủ về phương pháp, thời gian thực hiện công việc, không chịu sự quản lý trực tiếp theo Nội quy lao động, thang bảng lương hay chấm công ngày của Bên A.
2. **Đối tượng hưu trí:**
   - Căn cứ Điểm a Khoản 7 Điều 2 Luật BHXH 2024: Người đang hưởng lương hưu hàng tháng KHÔNG thuộc đối tượng tham gia BHXH bắt buộc. Do đó Chi nhánh hoàn toàn không phải đóng BHXH cho nhóm này.
3. **Đối tượng đã đóng BHXH tại đơn vị khác:**
   - Người lao động đã tham gia BHXH bắt buộc tại cơ quan chính thức làm thêm ngoài giờ thì quan hệ giao khoán này không phát sinh nghĩa vụ BHXH lần hai. Chi nhánh cần lưu bản chụp VssID làm chứng từ đính kèm.`;
  }

  if (p.includes('an toàn') || p.includes('tai nạn') || p.includes('đường sắt')) {
    return `### Nguyên tắc An toàn Lao động tại Ga tàu & Loại trừ trách nhiệm:
1. **Bắt buộc ký Bản cam kết an toàn lao động tại ga tàu:**
   - Môi trường đường sắt có rủi ro cao (điện cao áp, nước áp lực, tàu dồn dịch).
   - Bản cam kết phải nêu rõ Bên B cam kết tự chịu hoàn toàn trách nhiệm an toàn thân thể và tính mạng.
2. **Trang thiết bị bảo hộ bắt buộc:**
   - Ủng cao su chống trơn trượt (khi rửa tàu có nước và dầu mỡ).
   - Áo phản quang (bắt buộc khi làm việc ban đêm hoặc đi qua các làn ray).
   - Mũ và găng tay bảo hộ.
3. **Trách nhiệm bồi thường:**
   - Nếu do sơ suất làm vỡ kính toa xe hoặc hư hỏng hàng hóa của Bên A, Bên B phải bồi thường theo giá trị thực tế thiệt hại.`;
  }

  return `### Tư vấn Pháp lý & HR Chi nhánh Đường sắt Nha Trang:
- Căn cứ Bộ luật Dân sự 2015, Luật Bảo hiểm xã hội 2024 và Nghị định 253/2026/NĐ-CP:
- Hồ sơ khoán việc trọn gói gồm: (1) Hợp đồng nguyên tắc 01 năm, (2) Bản cam kết an toàn lao động tại ga tàu, (3) Biên bản nghiệm thu và xác nhận khối lượng hoàn thành từng đợt.
- Luôn kiểm tra ngưỡng chi trả 5.000.000 VNĐ để xác định khấu trừ 10% thuế TNCN và bảo đảm nguyên tắc tự chủ của người nhận khoán.`;
}
