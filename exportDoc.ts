import { Contract, WorkerContractor, AcceptanceReport } from '../types';
import { formatNumber, formatVND, numberToVietnameseWords } from './numberToWords';

function formatDateVi(dateStr: string): string {
  if (!dateStr) return '...';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `ngày ${parts[2]} tháng ${parts[1]} năm ${parts[0]}`;
  }
  return dateStr;
}

function formatDateShortVi(dateStr: string): string {
  if (!dateStr) return '.../.../20...';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  totalInDoc: number;
  documentTitle: string;
  pageLabel: string;
  htmlContent: string;
}

export interface ContractClauses {
  title: string;
  subTitle?: string;
  legalBasis: string;
  article1: string;
  article2: string;
  article3: string;
  article4: string;
  article5: string;
  notes?: string;
}

export function getDefaultContractClauses(contract: Contract, worker: WorkerContractor): ContractClauses {
  const isFreelance = contract.templateType === 'CLEANING_FREELANCE';
  const isRetired = contract.templateType === 'CLEANING_RETIRED';
  const isCargoDual = contract.templateType === 'CARGO_DUAL_EMPLOYER';
  const isCargoPrinciple = contract.templateType === 'CARGO_PRINCIPLE_VTHN';

  if (isCargoPrinciple) {
    return {
      title: 'HỢP ĐỒNG NGUYÊN TẮC GIAO KHOÁN DỊCH VỤ BỐC XẾP',
      subTitle: `Số: ${contract.contractNumber || '...... /20.../HĐNT-VTHN-NT'}`,
      legalBasis: `- Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;
- Căn cứ nhu cầu giải phóng hàng hóa tại các toa xe và khả năng cung cấp dịch vụ của cá nhân;`,
      article1: `1. Bên A giao khoán và Bên B đồng ý nhận thực hiện việc bốc dỡ, chuyển tải hàng hóa từ toa xe đường sắt sang xe ô tô/vào kho ga hoặc ngược lại tại khu vực: Ga ${contract.stationLocation}.
2. Nguyên tắc thực hiện (“Theo nhu cầu thực tế”):
- Khi có toa hàng về ga cần bốc xếp, Bên A sẽ thông báo cho Bên B trước về khối lượng, chủng loại hàng và thời gian dự kiến giải phóng toa xe.
- Bên B có quyền tiếp nhận hoặc từ chối công việc tùy thuộc vào thời gian và điều kiện cá nhân của Bên B mà không phải chịu bất kỳ chế tài kỷ luật hay phạt nào từ Bên A.
- Trường hợp Bên B đồng ý nhận việc, Bên B có trách nhiệm hoàn thành việc bốc dỡ đúng thời hạn đã thỏa thuận để đảm bảo tiến độ tác nghiệp ga tàu.`,
      article2: `1. Đơn giá khoán trọn gói theo khối lượng hoàn thành:
- Hàng bao kiện, đóng gói: ${formatNumber(contract.rateCargoPackage)} đồng/tấn.
- Hàng rời: ${formatNumber(contract.rateCargoBulk)} đồng/tấn.
2. Phương thức nghiệm thu và thanh toán:
- Sau mỗi chuyến toa hoặc tổng hợp theo từng đợt công việc, hai bên sẽ lập “Biên bản nghiệm thu và xác nhận khối lượng bốc dỡ thực tế”.
- Bên A thanh toán tiền công khoán cho Bên B bằng tiền mặt hoặc chuyển khoản chậm nhất trong vòng 05 ngày kể từ ngày ký biên bản nghiệm thu.`,
      article3: `1. Quan hệ hợp đồng: Hai bên khẳng định đây là Hợp đồng dịch vụ dân sự được điều chỉnh bởi Bộ luật Dân sự 2015. Bên B là người hành nghề tự do, không phải là nhân viên, không chịu sự quản lý, chấm công, điều hành theo Nội quy lao động của Bên A. Do đó, công việc này KHÔNG thuộc đối tượng tham gia BHXH bắt buộc.
2. Nghĩa vụ Thuế TNCN:
- Theo Nghị định 253/2026/NĐ-CP, đối với mỗi lần chi trả thu nhập từ 5.000.000 đồng trở lên, Bên A sẽ thực hiện khấu trừ 10% thuế TNCN trước khi thanh toán, trừ trường hợp Bên B đủ điều kiện lập Bản cam kết thu nhập theo quy định của pháp luật quản lý thuế.
- Nếu mức chi trả dưới 5.000.000 đồng/lần, Bên A chi trả toàn bộ số tiền theo biên bản nghiệm thu.`,
      article4: `1. Vì tính chất công việc làm việc trong khu vực đường sắt có độ nguy hiểm cao, Bên B cam kết:
- Tự trang bị phương tiện bảo hộ cá nhân (giày, găng tay, mũ...).
- Tuyệt đối chấp hành các quy tắc cảnh báo an toàn chạy tàu, không đi lại tùy tiện trên đường sắt.
- Tự chịu hoàn toàn trách nhiệm về sự an toàn tính mạng, sức khỏe của bản thân trong suốt quá trình bốc dỡ.
2. Bên B có trách nhiệm bảo quản nguyên vẹn hàng hóa. Nếu để xảy ra mất mát, rơi vỡ do lỗi chủ quan, Bên B phải bồi thường giá trị thực tế của hàng hóa bị thiệt hại.`,
      article5: `1. Hợp đồng nguyên tắc này có hiệu lực kể từ ngày ${formatDateShortVi(contract.startDate)} đến ngày ${formatDateShortVi(contract.endDate)} (Thời hạn 01 năm).
2. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.`
    };
  }

  let titleSubject = 'Cung cấp dịch vụ vệ sinh, rửa toa xe tại ga';
  if (isRetired) {
    titleSubject = 'Dịch vụ vệ sinh, rửa toa xe / bốc xếp hàng hóa tại ga';
  } else if (isCargoDual) {
    titleSubject = 'Dịch vụ bốc dỡ hàng hóa từ các toa xe đường sắt sang xe ô tô/kho hàng tại ga';
  }

  return {
    title: isCargoDual ? 'HỢP ĐỒNG GIAO KHOÁN CÔNG VIỆC' : 'HỢP ĐỒNG GIAO KHOÁN CÔNG VIỆC THEO SẢN PHẨM',
    subTitle: `(V/v: ${titleSubject})`,
    legalBasis: `- Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;
- Căn cứ Luật Bảo hiểm xã hội số 41/2024/QH15;
- Căn cứ Nghị định số 253/2026/NĐ-CP quy định chi tiết thi hành Luật Thuế thu nhập cá nhân;
- Căn cứ nhu cầu thực tế của Chi nhánh Vận tải đường sắt Nha Trang và năng lực cung cấp dịch vụ của cá nhân;`,
    article1: !isCargoDual ? `1. Nội dung khoán: Bên A giao khoán và Bên B nhận thực hiện công việc: Xịt rửa vỏ ngoài, cọ rửa kính và vệ sinh bề mặt các toa xe khách tại khu vực: ${contract.stationLocation}.
2. Tiêu chuẩn nghiệm thu: Toa xe được làm sạch bùn đất, rác thải thu gom sạch sẽ, kính cửa sổ sáng rõ, đáp ứng tiêu chuẩn vệ sinh tác nghiệp kỹ thuật trước khi chạy tàu của Bên A.
3. Tính chất công việc vãng lai, không liên tục:
- Công việc phát sinh từng đợt không thường xuyên, phụ thuộc hoàn toàn vào lịch dồn dịch và kế hoạch đón/trả toa xe/chuyến tàu hàng tại ga của Bên A.
- Khi có nhu cầu tác nghiệp, Bên A thông báo trước cho Bên B về số lượng toa và thời gian dự kiến.
- Bên B có toàn quyền tiếp nhận hoặc từ chối nhận việc tùy thuộc vào điều kiện sức khỏe và thời gian cá nhân mà không phải chịu bất kỳ hình thức phạt hay chế tài nào từ Bên A.` : `1. Nội dung khoán: Bên A giao khoán cho Bên B thực hiện việc bốc xếp, dỡ hàng hóa từ các toa xe đường sắt sang xe ô tô/kho hàng và ngược lại tại khu vực: ${contract.stationLocation}.
2. Tiêu chuẩn nghiệm thu: Khối lượng hàng hóa bốc xếp an toàn, đúng chủng loại, không làm rách vỡ bao bì, không thất thoát hàng hóa, hoàn thành đúng tiến độ xếp dỡ giải phóng toa xe.
3. Tính chất công việc vãng lai, không liên tục:
- Công việc phát sinh từng đợt không thường xuyên, phụ thuộc hoàn toàn vào lịch dồn dịch và kế hoạch đón/trả toa xe/chuyến tàu hàng tại ga của Bên A.
- Khi có nhu cầu tác nghiệp, Bên A thông báo trước cho Bên B về số lượng toa và thời gian dự kiến.
- Bên B có toàn quyền tiếp nhận hoặc từ chối nhận việc tùy thuộc vào điều kiện sức khỏe và thời gian cá nhân mà không phải chịu bất kỳ hình thức phạt hay chế tài nào từ Bên A.`,
    article2: `1. Đơn giá khoán trọn gói theo sản phẩm hoàn thành:
${!isCargoDual ? `- Rửa sạch vỏ ngoài toa xe khách: ${formatNumber(contract.rateExteriorWash)} đồng/toa.
- Vệ sinh nội thất toa xe khách: ${formatNumber(contract.rateInteriorWash)} đồng/toa.` : `- Bốc dỡ hàng bao kiện: ${formatNumber(contract.rateCargoPackage)} đồng/tấn.
- Bốc dỡ hàng rời: ${formatNumber(contract.rateCargoBulk)} đồng/tấn.`}
* Đơn giá nêu trên là chi phí dịch vụ trọn gói tính theo kết quả đầu ra, đã bao gồm toàn bộ các khoản chi phí liên quan đến an toàn, bảo hộ lao động và mọi quyền lợi tài chính khác của Bên B.
2. Căn cứ thanh toán: Dựa trên “Biên bản nghiệm thu số lượng toa xe đã rửa sạch thực tế (hoặc khối lượng bốc dỡ hàng hóa)” có đầy đủ chữ ký xác nhận của đại diện kỹ thuật Bên A sau mỗi đợt làm việc.
3. Hình thức thanh toán: Chuyển khoản ngân hàng hoặc tiền mặt theo thỏa thuận từng đợt.`,
    article3: `1. Về Bảo hiểm xã hội:
- Hai bên khẳng định rõ: Hợp đồng này là Hợp đồng giao khoán công việc dân sự theo kết quả hoàn thành căn cứ theo Bộ luật Dân sự 2015, KHÔNG PHẢI là Hợp đồng lao động.
${isRetired ? `- Bên B là người đang hưởng chế độ hưu trí hằng tháng, căn cứ Điểm a Khoản 7 Điều 2 Luật Bảo hiểm xã hội 2024, Bên B thuộc đối tượng KHÔNG PHẢI tham gia BHXH bắt buộc. Bên A hoàn toàn không có nghĩa vụ trích nộp bất kỳ loại bảo hiểm nào cho Bên B.` : isCargoDual ? `- Bên B hiện đang có quan hệ lao động và tham gia đầy đủ các chế độ BHXH, BHYT, BHTN bắt buộc tại đơn vị công tác chính thức (${worker.primaryEmployerName || 'đơn vị thứ nhất'}). Do đó, Bên A KHÔNG có nghĩa vụ trích đóng BHXH, BHYT, BHTN cho Bên B. Bên B có trách nhiệm cung cấp bản sao HĐLĐ hoặc bản chụp VssID làm tài liệu đính kèm.` : `- Bên B là cá nhân hành nghề tự do vãng lai, tự chủ về phương pháp và thời gian thực hiện, không thuộc biên chế quản lý, không áp dụng nội quy lao động, thang bảng lương hay kỷ luật của Bên A. Do đó, công việc này KHÔNG thuộc đối tượng tham gia BHXH bắt buộc theo quy định tại Điều 2 Luật Bảo hiểm xã hội 2024.`}
2. Về Thuế thu nhập cá nhân (TNCN):
- Căn cứ Nghị định 253/2026/NĐ-CP, Bên A có trách nhiệm khấu trừ 10% thuế TNCN trước khi thanh toán đối với mỗi lần chi trả từ 5.000.000 đồng trở lên.
${!isCargoDual ? `- Trường hợp Bên B ước tính tổng thu nhập trong năm chưa đến mức phải nộp thuế TNCN và chỉ có thu nhập vãng lai duy nhất tại Bên A thì Bên B được quyền lập Bản cam kết thu nhập theo mẫu quy định của cơ quan thuế để Bên A tạm thời chưa khấu trừ 10%.` : `- Bên B xác nhận có thu nhập từ 02 nơi trở lên, do đó không thuộc đối tượng làm Bản cam kết tạm miễn khấu trừ thuế. Bên A thực hiện khấu trừ 10% thuế TNCN khi mức thanh toán từ 5.000.000 đồng/lần trở lên và cấp Chứng từ khấu trừ thuế điện tử cho Bên B.`}
- Nếu mức chi trả dưới 5.000.000 đồng/lần, Bên A chi trả toàn bộ 100% tiền công khoán theo biên bản nghiệm thu.`,
    article4: `1. An toàn lao động ga tàu:
- Do môi trường tác nghiệp tại khu vực đường ray có sử dụng nước xịt áp lực và nguồn điện, hoặc bốc dỡ hàng nặng, Bên B cam kết tự trang bị đầy đủ bảo hộ cá nhân (ủng cao su chống trượt, găng tay, áo phản quang, mũ...) và tuân thủ nghiêm ngặt các quy tắc an toàn chạy tàu theo “Bản cam kết an toàn lao động” đính kèm Hợp đồng này.
- Bên B tự chịu hoàn toàn trách nhiệm về an toàn thân thể và tính mạng của bản thân trong suốt quá trình làm việc tại ga.
2. Bồi thường thiệt hại: Bên B chịu trách nhiệm bồi thường nếu do sơ suất, bất cẩn trong quá trình tác nghiệp làm vỡ kính, hỏng hóc thiết bị toa xe hoặc hư hỏng hàng hóa của Bên A.`,
    article5: `1. Hợp đồng nguyên tắc này có hiệu lực kể từ ngày ${formatDateShortVi(contract.startDate)} đến ngày ${formatDateShortVi(contract.endDate)} (Thời hạn 01 năm).
2. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.`
  };
}

function renderParagraphsHtml(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('-')) {
        return `<p style="margin: 3px 0 3px 15px;">${trimmed}</p>`;
      }
      return `<p style="margin: 3px 0;">${trimmed}</p>`;
    })
    .filter(Boolean)
    .join('');
}

export function getContractPages(contract: Contract, worker: WorkerContractor): DocumentPage[] {
  const isFreelance = contract.templateType === 'CLEANING_FREELANCE';
  const isRetired = contract.templateType === 'CLEANING_RETIRED';
  const isCargoDual = contract.templateType === 'CARGO_DUAL_EMPLOYER';
  const isCargoPrinciple = contract.templateType === 'CARGO_PRINCIPLE_VTHN';

  const defaults = getDefaultContractClauses(contract, worker);
  const custom = contract.customContent;

  const title = custom?.customTitle || defaults.title;
  const legalBasisHtml = renderParagraphsHtml(custom?.customLegalBasis || defaults.legalBasis);
  const art1Html = renderParagraphsHtml(custom?.customArticle1 || defaults.article1);
  const art2Html = renderParagraphsHtml(custom?.customArticle2 || defaults.article2);
  const art3Html = renderParagraphsHtml(custom?.customArticle3 || defaults.article3);
  const art4Html = renderParagraphsHtml(custom?.customArticle4 || defaults.article4);
  const art5Html = renderParagraphsHtml(custom?.customArticle5 || defaults.article5);
  const notesHtml = custom?.customNotes ? `
    <div style="margin-top: 10px; font-size: 10.5pt; font-style: italic; background-color: #f8fafc; padding: 6px 10px; border-left: 3px solid #0f5499;">
      <strong>Ghi chú bổ sung từ Chi nhánh:</strong> ${custom.customNotes}
    </div>
  ` : '';

  if (isCargoPrinciple) {
    const page1Html = `
      <!-- QUỐC HIỆU TIÊU NGỮ & BÊN GIAO KHOÁN -->
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          <td style="width: 48%; vertical-align: top; text-align: center;">
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; line-height: 1.35; text-align: center;">
              <div>CHI NHÁNH</div>
              <div>VẬN TẢI ĐƯỜNG SẮT NHA TRANG</div>
            </div>
            <div style="font-size: 10pt; font-style: italic; margin-top: 4px; text-align: center;">
              Số: ${contract.contractNumber || '...... /20.../HĐNT-VTHN-NT'}
            </div>
            <div style="width: 100px; height: 1px; background-color: #333; margin: 5px auto 0 auto;"></div>
          </td>
          <td style="width: 52%; vertical-align: top; text-align: center;">
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; text-align: center;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 11pt; font-weight: bold; text-align: center; margin-top: 3px;">Độc lập – Tự do – Hạnh phúc</div>
            <div style="width: 140px; height: 1px; background-color: #333; margin: 5px auto 0 auto;"></div>
          </td>
        </tr>
      </table>

      <!-- TIÊU ĐỀ HỢP ĐỒNG -->
      <div style="text-align: center; margin: 20px 0 15px 0;">
        <h2 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0; color: #111;">
          ${title}
        </h2>
        <div style="font-size: 11pt; font-style: italic; font-weight: bold;">
          Số: ${contract.contractNumber || '...... /20.../HĐNT-VTHN-NT'}
        </div>
      </div>

      <!-- CĂN CỨ PHÁP LÝ -->
      <div style="font-size: 11pt; font-style: italic; line-height: 1.5; margin-bottom: 14px;">
        ${legalBasisHtml}
      </div>

      <p style="font-size: 11pt; font-style: italic; margin-bottom: 12px;">
        Hôm nay, ${formatDateVi(contract.signDate)}, tại ${contract.signPlace || 'Chi nhánh Vận tải đường sắt Nha Trang'}, chúng tôi gồm:
      </p>

      <!-- BÊN GIAO KHOÁN (BÊN A) -->
      <div style="margin-bottom: 14px; font-size: 11pt; line-height: 1.6;">
        <p style="font-weight: bold; text-transform: uppercase; margin: 4px 0;">BÊN GIAO KHOÁN (BÊN A):</p>
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 150px; font-weight: 500;">- Tên cơ quan:</td>
            <td style="font-weight: bold; text-transform: uppercase;">${contract.partyA.organizationName}</td>
          </tr>
          <tr>
            <td>- Địa chỉ:</td>
            <td>${contract.partyA.address}</td>
          </tr>
          <tr>
            <td>- MST:</td>
            <td><span style="font-family: monospace; font-weight: bold;">${contract.partyA.taxCode}</span></td>
          </tr>
          <tr>
            <td>- Đại diện bởi:</td>
            <td><strong>${contract.partyA.representativeName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: <strong>${contract.partyA.representativeTitle}</strong></td>
          </tr>
        </table>
      </div>

      <!-- BÊN NHẬN KHOÁN (BÊN B) -->
      <div style="margin-bottom: 16px; font-size: 11pt; line-height: 1.6;">
        <p style="font-weight: bold; text-transform: uppercase; margin: 4px 0;">BÊN NHẬN KHOÁN (BÊN B):</p>
        <table style="width: 100%; border: none;">
          <tr>
            <td style="width: 150px; font-weight: 500;">- Họ và tên:</td>
            <td><strong style="font-size: 12pt; text-transform: uppercase;">${worker.fullName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Ngày sinh: ${formatDateShortVi(worker.birthDate)}</td>
          </tr>
          <tr>
            <td>- Số CCCD:</td>
            <td><span style="font-family: monospace; font-weight: bold;">${worker.cccdNumber}</span> &nbsp;&nbsp; Cấp ngày: ${formatDateShortVi(worker.cccdDate)} &nbsp;&nbsp; Tại: ${worker.cccdPlace}</td>
          </tr>
          <tr>
            <td>- Địa chỉ thường trú:</td>
            <td>${worker.address}</td>
          </tr>
          <tr>
            <td>- Mã số thuế cá nhân:</td>
            <td><span style="font-family: monospace;">${worker.taxCode || '...........................'}</span></td>
          </tr>
          <tr>
            <td>- Điện thoại liên hệ:</td>
            <td>${worker.phone || '...........................'}</td>
          </tr>
          <tr>
            <td>- Số tài khoản NH:</td>
            <td><strong>${worker.bankAccount || '...........................'}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Tại: <strong>${worker.bankName || '...........................'}</strong></td>
          </tr>
        </table>
      </div>

      <p style="font-size: 11pt; font-style: italic; margin-bottom: 12px;">
        Hai bên cùng thống nhất ký kết Hợp đồng nguyên tắc với các điều khoản cụ thể sau:
      </p>

      <!-- ĐIỀU 1 -->
      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 1: PHẠM VI VÀ NGUYÊN TẮC THỰC HIỆN CÔNG VIỆC</p>
        ${art1Html}
      </div>

      <!-- ĐIỀU 2 -->
      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 2: ĐƠN GIÁ KHOÁN VÀ PHƯƠNG THỨC THANH TOÁN</p>
        ${art2Html}
      </div>
    `;

    const page2Html = `
      <!-- TIÊU ĐỀ ĐẦU TRANG 2 -->
      <div style="font-size: 10pt; font-style: italic; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 18px; display: flex; justify-content: space-between;">
        <span>Chi nhánh Vận tải đường sắt Nha Trang</span>
        <span>Hợp đồng số: ${contract.contractNumber} (Trang 2)</span>
      </div>

      <!-- ĐIỀU 3 -->
      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 3: BẢO HIỂM XÃ HỘI VÀ THUẾ THU NHẬP CÁ NHÂN (TNCN)</p>
        ${art3Html}
      </div>

      <!-- ĐIỀU 4 -->
      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 4: AN TOÀN LAO ĐỘNG VÀ BỒI THƯỜNG THIỆT HẠI</p>
        ${art4Html}
      </div>

      <!-- ĐIỀU 5 -->
      <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 24px;">
        <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 5: ĐIỀU KHOẢN THI HÀNH</p>
        ${art5Html}
        ${notesHtml}
      </div>

      <!-- CHỮ KÝ 2 BÊN -->
      <table style="width: 100%; border: none; margin-top: 30px;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN BÊN A</div>
            <div style="font-size: 10pt; font-style: italic; margin-bottom: 60px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${contract.partyA.representativeName}</div>
            <div style="font-size: 10pt; color: #555;">${contract.partyA.representativeTitle}</div>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN BÊN B</div>
            <div style="font-size: 10pt; font-style: italic; margin-bottom: 60px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${worker.fullName}</div>
          </td>
        </tr>
      </table>
    `;

    return [
      {
        id: 'p1',
        pageNumber: 1,
        totalInDoc: 2,
        documentTitle: title,
        pageLabel: 'Trang 1: Thỏa thuận & Điều 1 - 2',
        htmlContent: page1Html,
      },
      {
        id: 'p2',
        pageNumber: 2,
        totalInDoc: 2,
        documentTitle: title,
        pageLabel: 'Trang 2: Điều 3 - 5 & Chữ ký hai bên',
        htmlContent: page2Html,
      },
    ];
  }

  let titleSubject = 'Cung cấp dịch vụ vệ sinh, rửa toa xe tại ga';
  if (isRetired) {
    titleSubject = 'Dịch vụ vệ sinh, rửa toa xe / bốc xếp hàng hóa tại ga';
  } else if (isCargoDual) {
    titleSubject = 'Dịch vụ bốc dỡ hàng hóa từ các toa xe đường sắt sang xe ô tô/kho hàng tại ga';
  }

  const page1Html = `
    <!-- QUỐC HIỆU TIÊU NGỮ & BÊN GIAO KHOÁN -->
    <table style="width: 100%; border: none; margin-bottom: 20px;">
      <tr>
        <td style="width: 48%; vertical-align: top; text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; line-height: 1.35; text-align: center;">
            <div>CHI NHÁNH</div>
            <div>VẬN TẢI ĐƯỜNG SẮT NHA TRANG</div>
          </div>
          <div style="font-size: 10pt; font-style: italic; margin-top: 4px; text-align: center;">
            Số: ${contract.contractNumber || '...... /20.../HĐGK-SP-NT'}
          </div>
          <div style="width: 100px; height: 1px; background-color: #333; margin: 5px auto 0 auto;"></div>
        </td>
        <td style="width: 52%; vertical-align: top; text-align: center;">
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; text-align: center;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 11pt; font-weight: bold; text-align: center; margin-top: 3px;">Độc lập – Tự do – Hạnh phúc</div>
          <div style="width: 140px; height: 1px; background-color: #333; margin: 5px auto 0 auto;"></div>
        </td>
      </tr>
    </table>

    <!-- TIÊU ĐỀ HỢP ĐỒNG -->
    <div style="text-align: center; margin: 20px 0 15px 0;">
      <h2 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0; color: #111;">
        ${title}
      </h2>
      <div style="font-size: 11.5pt; font-style: italic; font-weight: 500;">
        (V/v: ${titleSubject})
      </div>
      <div style="font-size: 11pt; font-weight: bold; margin-top: 4px;">
        Số: ${contract.contractNumber}
      </div>
    </div>

    <!-- CĂN CỨ PHÁP LÝ -->
    <div style="font-size: 11pt; font-style: italic; line-height: 1.5; margin-bottom: 14px;">
      ${legalBasisHtml}
    </div>

    <p style="font-size: 11pt; font-style: italic; margin-bottom: 12px;">
      Hôm nay, ${formatDateVi(contract.signDate)}, tại ${contract.signPlace || 'Chi nhánh Vận tải đường sắt Nha Trang'}, chúng tôi gồm:
    </p>

    <!-- BÊN GIAO KHOÁN (BÊN A) -->
    <div style="margin-bottom: 14px; font-size: 11pt; line-height: 1.6;">
      <p style="font-weight: bold; text-transform: uppercase; margin: 4px 0;">BÊN GIAO KHOÁN (BÊN A):</p>
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 130px; font-weight: 500;">- Tên cơ quan:</td>
          <td style="font-weight: bold; text-transform: uppercase;">${contract.partyA.organizationName}</td>
        </tr>
        <tr>
          <td>- Địa chỉ:</td>
          <td>${contract.partyA.address}</td>
        </tr>
        <tr>
          <td>- Mã số thuế:</td>
          <td><span style="font-family: monospace; font-weight: bold;">${contract.partyA.taxCode}</span></td>
        </tr>
        <tr>
          <td>- Đại diện bởi:</td>
          <td><strong>${contract.partyA.representativeName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: <strong>${contract.partyA.representativeTitle}</strong></td>
        </tr>
      </table>
    </div>

    <!-- BÊN NHẬN KHOÁN (BÊN B) -->
    <div style="margin-bottom: 14px; font-size: 11pt; line-height: 1.6;">
      <p style="font-weight: bold; text-transform: uppercase; margin: 4px 0;">BÊN NHẬN KHOÁN (BÊN B):</p>
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 130px; font-weight: 500;">- Họ và tên:</td>
          <td><strong style="font-size: 12pt; text-transform: uppercase;">${worker.fullName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Ngày sinh: ${formatDateShortVi(worker.birthDate)}</td>
        </tr>
        <tr>
          <td>- Số CCCD:</td>
          <td><span style="font-family: monospace; font-weight: bold;">${worker.cccdNumber}</span> &nbsp;&nbsp; Cấp ngày: ${formatDateShortVi(worker.cccdDate)} &nbsp;&nbsp; Tại: ${worker.cccdPlace}</td>
        </tr>
        <tr>
          <td>- Địa chỉ thường trú:</td>
          <td>${worker.address}</td>
        </tr>
        <tr>
          <td>- Mã số thuế cá nhân:</td>
          <td><span style="font-family: monospace;">${worker.taxCode || '...........................'}</span></td>
        </tr>
        <tr>
          <td>- Điện thoại liên hệ:</td>
          <td>${worker.phone || '...........................'}</td>
        </tr>
        ${isRetired ? `
        <tr>
          <td>- Tình trạng an sinh:</td>
          <td><strong>[X] Đang hưởng chế độ hưu trí hàng tháng</strong> (Sổ BHXH/Thẻ hưu trí số: <em>${worker.pensionBookNumber || '................'}</em>)</td>
        </tr>
        ` : ''}
        ${isCargoDual ? `
        <tr>
          <td>- Nơi công tác chính:</td>
          <td>${worker.primaryEmployerName || '................................................'} (Theo HĐLĐ số: ${worker.primaryLaborContractNo || '......'} / Mã BHXH: ${worker.primaryBhxhCode || '......'})</td>
        </tr>
        ` : ''}
        ${isFreelance ? `
        <tr>
          <td>- Tình trạng an sinh:</td>
          <td>Lao động tự do vãng lai ngoài biên chế, không thuộc đối tượng tham gia BHXH bắt buộc.</td>
        </tr>
        ` : ''}
        <tr>
          <td>- Số tài khoản NH:</td>
          <td><strong>${worker.bankAccount || '........................'}</strong> Tại: <strong>${worker.bankName || '........................'}</strong></td>
        </tr>
      </table>
    </div>

    <p style="font-size: 11pt; font-style: italic; margin-bottom: 12px;">
      Hai bên cùng thống nhất ký kết Hợp đồng nguyên tắc với các điều khoản cụ thể sau:
    </p>

    <!-- ĐIỀU 1 -->
    <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
      <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 1: PHẠM VI, NỘI DUNG VÀ NGUYÊN TẮC THỰC HIỆN CÔNG VIỆC</p>
      ${art1Html}
    </div>

    <!-- ĐIỀU 2 -->
    <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 12px;">
      <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 2: ĐƠN GIÁ KHOÁN VÀ PHƯƠNG THỨC THANH TOÁN</p>
      ${art2Html}
    </div>
  `;

  const page2Html = `
    <!-- TIÊU ĐỀ ĐẦU TRANG 2 -->
    <div style="font-size: 10pt; font-style: italic; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 18px; display: flex; justify-content: space-between;">
      <span>Chi nhánh Vận tải đường sắt Nha Trang</span>
      <span>Hợp đồng số: ${contract.contractNumber} (Trang 2)</span>
    </div>

    <!-- ĐIỀU 3 -->
    <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
      <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 3: BẢO HIỂM XÃ HỘI VÀ THUẾ THU NHẬP CÁ NHÂN (TNCN)</p>
      ${art3Html}
    </div>

    <!-- ĐIỀU 4 -->
    <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 14px;">
      <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 4: AN TOÀN LAO ĐỘNG VÀ BỒI THƯỜNG THIỆT HẠI</p>
      ${art4Html}
    </div>

    <!-- ĐIỀU 5 -->
    <div style="font-size: 11pt; line-height: 1.5; margin-bottom: 24px;">
      <p style="font-weight: bold; margin: 4px 0;">ĐIỀU 5: ĐIỀU KHOẢN THI HÀNH</p>
      ${art5Html}
      ${notesHtml}
    </div>

    <!-- CHỮ KÝ 2 BÊN -->
    <table style="width: 100%; border: none; margin-top: 30px;">
      <tr>
        <td style="width: 50%; text-align: center; vertical-align: top;">
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN BÊN A</div>
          <div style="font-size: 10pt; font-style: italic; margin-bottom: 60px;">(Ký, đóng dấu và ghi rõ họ tên)</div>
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${contract.partyA.representativeName}</div>
          <div style="font-size: 10pt; color: #555;">${contract.partyA.representativeTitle}</div>
        </td>
        <td style="width: 50%; text-align: center; vertical-align: top;">
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN BÊN B</div>
          <div style="font-size: 10pt; font-style: italic; margin-bottom: 60px;">(Ký và ghi rõ họ tên)</div>
          <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${worker.fullName}</div>
        </td>
      </tr>
    </table>
  `;

  return [
    {
      id: 'p1',
      pageNumber: 1,
      totalInDoc: 2,
      documentTitle: title,
      pageLabel: 'Trang 1: Thỏa thuận & Điều 1 - 2',
      htmlContent: page1Html,
    },
    {
      id: 'p2',
      pageNumber: 2,
      totalInDoc: 2,
      documentTitle: title,
      pageLabel: 'Trang 2: Điều 3 - 5 & Chữ ký hai bên',
      htmlContent: page2Html,
    },
  ];
}

export function getSafetyCommitmentPages(contract: Contract, worker: WorkerContractor): DocumentPage[] {
  return [
    {
      id: 'safety-1',
      pageNumber: 1,
      totalInDoc: 1,
      documentTitle: 'Bản Cam Kết An Toàn Lao Động',
      pageLabel: 'Trang 1: Cam kết an toàn ga tàu',
      htmlContent: generateSafetyCommitmentHtml(contract, worker),
    },
  ];
}

export function getAcceptancePages(report: AcceptanceReport, contract: Contract, worker: WorkerContractor): DocumentPage[] {
  return [
    {
      id: 'acceptance-1',
      pageNumber: 1,
      totalInDoc: 1,
      documentTitle: 'Biên Bản Nghiệm Thu & Xác Nhận Khối Lượng',
      pageLabel: 'Trang 1: Nghiệm thu & Thanh lý',
      htmlContent: generateAcceptanceHtml(report, contract, worker),
    },
  ];
}

export function getAllDocumentPages(contract: Contract, worker: WorkerContractor, report?: AcceptanceReport): DocumentPage[] {
  const contractPages = getContractPages(contract, worker);
  const safetyPages = getSafetyCommitmentPages(contract, worker);
  const acceptancePages = report ? getAcceptancePages(report, contract, worker) : [];

  const combined = [...contractPages, ...safetyPages, ...acceptancePages];
  return combined.map((p, idx) => ({
    ...p,
    pageNumber: idx + 1,
    totalInDoc: combined.length,
  }));
}

export function generateContractHtmlContent(contract: Contract, worker: WorkerContractor): string {
  const pages = getContractPages(contract, worker);
  return `
    <div class="doc-page" style="font-family: 'Times New Roman', 'Tinos', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000;">
      ${pages.map(p => p.htmlContent).join('<br style="page-break-before: always; clear: both;" />')}
    </div>
  `;
}

export function generateSafetyCommitmentHtml(contract: Contract, worker: WorkerContractor): string {
  const isCargoDual = contract.templateType === 'CARGO_DUAL_EMPLOYER';
  const isCargoPrinciple = contract.templateType === 'CARGO_PRINCIPLE_VTHN';
  const isCargo = isCargoDual || isCargoPrinciple;
  const workType = isCargo ? 'bốc dỡ, chuyển tải hàng hóa' : 'vệ sinh, rửa toa xe';

  if (isCargoPrinciple) {
    // Exact text from Page 4 of PDF
    return `
    <div class="doc-page" style="font-family: 'Times New Roman', 'Tinos', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000; page-break-before: always;">
      <!-- QUỐC HIỆU TIÊU NGỮ -->
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          <td style="text-align: center;">
            <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 12pt; font-weight: bold;">Độc lập – Tự do – Hạnh phúc</div>
            <div style="width: 150px; height: 1px; background-color: #333; margin: 4px auto;"></div>
          </td>
        </tr>
      </table>

      <!-- TIÊU ĐỀ -->
      <div style="text-align: center; margin: 25px 0 20px 0;">
        <h2 style="font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0;">
          BẢN CAM KẾT AN TOÀN LAO ĐỘNG TẠI GA TÀU
        </h2>
      </div>

      <div style="text-align: center; margin-bottom: 20px; font-size: 11pt; font-weight: bold;">
        Kính gửi: Chi nhánh Vận tải đường sắt Nha Trang.
      </div>

      <!-- THÔNG TIN NGƯỜI CAM KẾT -->
      <div style="font-size: 11pt; line-height: 1.8; margin-bottom: 16px;">
        <p style="margin: 4px 0;">Tôi tên là: <strong>${worker.fullName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sinh năm: <strong>${worker.birthDate ? worker.birthDate.split('-')[0] : '1957'}</strong></p>
        <p style="margin: 4px 0;">Số CCCD: <strong>${worker.cccdNumber}</strong> &nbsp;&nbsp; Cấp ngày: ${formatDateShortVi(worker.cccdDate)} &nbsp;&nbsp; Nơi cấp: ${worker.cccdPlace}</p>
        <p style="margin: 4px 0;">Địa chỉ: ${worker.address}</p>
        <p style="margin: 4px 0;">Là Bên nhận khoán công việc bốc dỡ theo Hợp đồng số: <strong>${contract.contractNumber || '...... /20.../HĐGK-VTHN-NT'}</strong>.</p>
      </div>

      <p style="font-size: 11pt; font-style: italic; line-height: 1.5; margin-bottom: 14px;">
        Tôi xin cam kết với Chi nhánh các nội dung sau:
      </p>

      <div style="font-size: 11pt; line-height: 1.7; margin-bottom: 20px;">
        <p style="margin: 8px 0;"><strong>1.</strong> Tôi hoàn toàn tự nguyện nhận công việc bốc xếp này vào thời gian rảnh/ngoài giờ và có đủ sức khỏe để hoàn thành công việc.</p>
        <p style="margin: 8px 0;"><strong>2.</strong> Tôi cam kết chấp hành tuyệt đối các quy định về an toàn trong phạm vi ga và đường sắt: không đi lại trên đường ray khi không có nhiệm vụ; chú ý quan sát còi, biển báo, đầu máy tàu dồn dịch; không uống rượu bia khi làm việc.</p>
        <p style="margin: 8px 0;"><strong>3.</strong> Tôi tự trang bị bảo hộ lao động cá nhân và tự chịu trách nhiệm hoàn toàn về an toàn sức khỏe, tính mạng của bản thân trong quá trình làm việc tại ga. Nếu xảy ra tai nạn do rủi ro cá nhân hoặc vi phạm quy tắc an toàn ga tàu, tôi tự gánh chịu hậu quả và không khiếu nại Chi nhánh.</p>
      </div>

      <!-- CHỮ KÝ -->
      <table style="width: 100%; border: none; margin-top: 30px;">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 11pt; font-style: italic;">Khánh Hòa, ${formatDateVi(contract.signDate)}</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-top: 5px; color: #b91c1c;">NGƯỜI CAM KẾT</div>
            <div style="font-size: 10pt; font-style: italic; margin-bottom: 60px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${worker.fullName}</div>
          </td>
        </tr>
      </table>
    </div>
    `;
  }

  return `
    <div class="doc-page" style="font-family: 'Times New Roman', 'Tinos', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000; page-break-before: always;">
      <!-- QUỐC HIỆU TIÊU NGỮ -->
      <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
          <td style="text-align: center;">
            <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size: 12pt; font-weight: bold;">Độc lập – Tự do – Hạnh phúc</div>
            <div style="width: 150px; height: 1px; background-color: #333; margin: 4px auto;"></div>
          </td>
        </tr>
      </table>

      <!-- TIÊU ĐỀ -->
      <div style="text-align: center; margin: 25px 0 20px 0;">
        <h2 style="font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0;">
          BẢN CAM KẾT AN TOÀN LAO ĐỘNG TẠI GA TÀU
        </h2>
        <div style="font-size: 11pt; font-style: italic;">
          (Tài liệu đính kèm không thể tách rời của Hợp đồng số: ${contract.contractNumber})
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px; font-size: 11pt; font-weight: bold;">
        Kính gửi: Chi nhánh Vận tải đường sắt Nha Trang.
      </div>

      <!-- THÔNG TIN NGƯỜI CAM KẾT -->
      <div style="font-size: 11pt; line-height: 1.7; margin-bottom: 16px;">
        <p style="margin: 4px 0;">Tôi tên là: <strong>${worker.fullName}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Sinh năm: <strong>${worker.birthDate ? worker.birthDate.split('-')[0] : '....'}</strong></p>
        <p style="margin: 4px 0;">Số CCCD: <strong>${worker.cccdNumber}</strong> &nbsp;&nbsp; Cấp ngày: ${formatDateShortVi(worker.cccdDate)} &nbsp;&nbsp; Nơi cấp: ${worker.cccdPlace}</p>
        <p style="margin: 4px 0;">Địa chỉ thường trú: ${worker.address}</p>
        <p style="margin: 4px 0;">Là Bên nhận khoán công việc <strong>${workType}</strong> theo Hợp đồng số: <strong>${contract.contractNumber}</strong> tại khu vực: <strong>${contract.stationLocation}</strong>.</p>
      </div>

      <p style="font-size: 11pt; font-style: italic; line-height: 1.5; margin-bottom: 14px;">
        Sau khi được đại diện Chi nhánh phổ biến các quy định về an toàn chạy tàu và an toàn tại khu vực tác nghiệp ke ga, bãi hàng, đường ray, tôi xin tự nguyện cam kết thực hiện nghiêm túc các nội dung sau:
      </p>

      <div style="font-size: 11pt; line-height: 1.6; margin-bottom: 20px;">
        <p style="margin: 6px 0;"><strong>1. Về điều kiện sức khỏe:</strong> Tôi cam đoan bản thân hoàn toàn có đủ sức khỏe thể chất và tinh thần để thực hiện công việc; không mắc các bệnh mãn tính nguy hiểm (tim mạch, động kinh, huyết áp cao, suy giảm thị lực/thính lực...).</p>
        <p style="margin: 6px 0;"><strong>2. Về trang bị bảo hộ lao động:</strong> Tôi cam kết tự trang bị và sử dụng đầy đủ các trang thiết bị bảo hộ phù hợp trong suốt quá trình làm việc, bao gồm:</p>
        <p style="margin: 3px 0 3px 20px;">- Giày/ủng cao su có đế chống trơn trượt (đặc biệt khi thực hiện xịt rửa toa xe bằng nước áp lực hoặc bốc dỡ hàng hóa trên bãi);</p>
        <p style="margin: 3px 0 3px 20px;">- Găng tay bảo hộ, khẩu trang, mũ bảo hộ che đầu;</p>
        <p style="margin: 3px 0 3px 20px;">- Áo phản quang khi làm việc vào ban đêm hoặc trong khu vực ray chạy tàu.</p>
        <p style="margin: 6px 0;"><strong>3. Về quy tắc an toàn trong khu vực đường sắt:</strong></p>
        <p style="margin: 3px 0 3px 20px;">- Tuyệt đối tuân thủ chỉ dẫn của Trực ban ga, Điều độ bãi dồn và nhân viên phụ trách an toàn của Bên A;</p>
        <p style="margin: 3px 0 3px 20px;">- Chỉ làm việc đúng vị trí toa xe được phân công; tuyệt đối không tự ý đi lại trên các làn đường ray khác;</p>
        <p style="margin: 3px 0 3px 20px;">- Không chui qua gầm toa xe, không ngồi nghỉ trên đường ray hoặc đứng giữa hai toa xe đang dồn dịch;</p>
        <p style="margin: 3px 0 3px 20px;">- Chú ý quan sát tín hiệu đèn, biển báo, lắng nghe còi tàu trước khi di chuyển qua các vị trí giao cắt;</p>
        <p style="margin: 3px 0 3px 20px;">- Tuyệt đối không sử dụng rượu, bia, chất kích thích trước và trong quá trình làm việc tại ga.</p>
        <p style="margin: 6px 0;"><strong>4. Về trách nhiệm an toàn thân thể và rủi ro:</strong></p>
        <p style="margin: 3px 0 3px 20px;">- Tôi xác nhận đây là công việc giao khoán theo sản phẩm dân sự. Tôi cam kết tự chịu hoàn toàn trách nhiệm về sự an toàn tính mạng, sức khỏe của bản thân trong quá trình làm việc.</p>
        <p style="margin: 3px 0 3px 20px;">- Trường hợp xảy ra tai nạn, rủi ro do bản thân sơ suất, không cẩn thận, hoặc do vi phạm các quy tắc an toàn đã được cảnh báo ở trên, tôi xin tự gánh chịu toàn bộ chi phí điều trị, hồi phục và cam kết không khiếu nại, khiếu kiện, không đòi hỏi Chi nhánh Vận tải đường sắt Nha Trang phải bồi thường bất kỳ khoản tiền nào.</p>
      </div>

      <p style="font-size: 11pt; font-style: italic; line-height: 1.5; margin-bottom: 24px;">
        Bản cam kết này được lập thành 02 bản có giá trị như nhau, là tài liệu đính kèm không thể tách rời của Hợp đồng giao khoán số: ${contract.contractNumber}. Tôi đã đọc kỹ, hiểu rõ toàn bộ nội dung và tự nguyện ký tên.
      </p>

      <!-- CHỮ KÝ -->
      <table style="width: 100%; border: none; margin-top: 20px;">
        <tr>
          <td style="width: 50%;"></td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 11pt; font-style: italic;">Khánh Hòa, ${formatDateVi(contract.signDate)}</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-top: 5px; color: #b91c1c;">NGƯỜI CAM KẾT</div>
            <div style="font-size: 10pt; font-style: italic; margin-bottom: 60px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase;">${worker.fullName}</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function generateAcceptanceHtml(report: AcceptanceReport, contract: Contract, worker: WorkerContractor): string {
  const isCargoDual = contract.templateType === 'CARGO_DUAL_EMPLOYER';
  const isCargoPrinciple = contract.templateType === 'CARGO_PRINCIPLE_VTHN';
  const isCargo = isCargoDual || isCargoPrinciple;

  if (isCargoPrinciple) {
    // Exact layout from Page 5 of PDF
    return `
    <div class="doc-page" style="font-family: 'Times New Roman', 'Tinos', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000; page-break-before: always;">
      <!-- ĐƠN VỊ VÀ BỘ PHẬN HÓA VẬN GA -->
      <table style="width: 100%; border: none; margin-bottom: 12px;">
        <tr>
          <td style="width: 60%; vertical-align: top;">
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">ĐƠN VỊ: CHI NHÁNH VẬN TẢI ĐƯỜNG SẮT NHA TRANG</div>
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">BỘ PHẬN: HÓA VẬN ${contract.stationLocation.toUpperCase()}</div>
            <div style="font-size: 9.5pt; font-style: italic;">Số BB: ${report.reportNumber}</div>
          </td>
          <td style="width: 40%; text-align: right; vertical-align: top; font-size: 10pt; font-style: italic;">
            ${formatDateVi(report.acceptanceDate)}
          </td>
        </tr>
      </table>

      <!-- TIÊU ĐỀ BIÊN BẢN -->
      <div style="text-align: center; margin: 15px 0 15px 0;">
        <h2 style="font-size: 13.5pt; font-weight: bold; text-transform: uppercase; margin: 0 0 4px 0;">
          BIÊN BẢN NGHIỆM THU VÀ XÁC NHẬN KHỐI LƯỢNG BỐC DỠ
        </h2>
        <div style="font-size: 11pt; font-style: italic;">
          (${report.periodDescription})
        </div>
      </div>

      <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 8px;">
        - Căn cứ Hợp đồng giao khoán số: Số: <strong>${contract.contractNumber}</strong> ngày ${formatDateShortVi(contract.signDate)}
      </div>
      <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 12px;">
        Hôm nay, ${formatDateVi(report.acceptanceDate)}, tại Ga <strong>${report.workStation}</strong> chúng tôi gồm:
      </div>

      <!-- ĐẠI DIỆN 2 BÊN -->
      <div style="font-size: 10.5pt; line-height: 1.6; margin-bottom: 14px;">
        <p style="margin: 2px 0;"><strong>1. ĐẠI DIỆN CHI NHÁNH:</strong></p>
        <p style="margin: 2px 0 2px 15px;">- Ông/Bà: <strong>${report.representativeA}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: <strong>${report.roleA || 'Trực ban/Hóa vận Ga'}</strong></p>
        <p style="margin: 2px 0;"><strong>2. ĐẠI DIỆN BÊN NHẬN KHOÁN:</strong></p>
        <p style="margin: 2px 0 2px 15px;">- Ông/Bà: <strong>${report.representativeB}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Ngày sinh: ${formatDateShortVi(worker.birthDate)}</p>
      </div>

      <p style="font-size: 10.5pt; margin-bottom: 8px;">
        Hai bên tiến hành kiểm tra, nghiệm thu khối lượng bốc dỡ thực tế như sau:
      </p>

      <!-- BẢNG KHỐI LƯỢNG BỐC DỠ -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10pt;" border="1" cellpadding="6">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
            <th style="width: 35px; border: 1px solid #333;">TT</th>
            <th style="width: 85px; border: 1px solid #333;">Ngày thực hiện</th>
            <th style="width: 95px; border: 1px solid #333;">Số hiệu toa xe</th>
            <th style="border: 1px solid #333;">Loại hàng hóa</th>
            <th style="width: 70px; border: 1px solid #333;">Khối lượng (tấn)</th>
            <th style="width: 95px; border: 1px solid #333;">Đơn giá (đồng/tấn)</th>
            <th style="width: 110px; border: 1px solid #333;">Thành tiền (VNĐ)</th>
            <th style="width: 80px; border: 1px solid #333;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${report.items.map((item, idx) => `
            <tr>
              <td style="text-align: center; border: 1px solid #333;">${idx + 1}</td>
              <td style="text-align: center; border: 1px solid #333;">${formatDateShortVi(item.workDate)}</td>
              <td style="text-align: center; border: 1px solid #333; font-weight: bold;">${item.wagonOrBatchNumber}</td>
              <td style="border: 1px solid #333;">${item.description}</td>
              <td style="text-align: center; border: 1px solid #333; font-weight: bold;">${item.quantity}</td>
              <td style="text-align: right; border: 1px solid #333;">${formatNumber(item.unitPrice)}</td>
              <td style="text-align: right; border: 1px solid #333; font-weight: bold;">${formatNumber(item.amount)}</td>
              <td style="border: 1px solid #333; font-size: 9pt;">${item.notes || ''}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="4" style="text-align: right; border: 1px solid #333; padding-right: 10px;">Cộng:</td>
            <td style="text-align: center; border: 1px solid #333;">X</td>
            <td style="text-align: center; border: 1px solid #333;">X</td>
            <td style="text-align: right; border: 1px solid #333; color: #0284c7; font-size: 10.5pt;">${formatNumber(report.grossAmount)}</td>
            <td style="border: 1px solid #333;"></td>
          </tr>
          ${report.isTaxWithheld ? `
          <tr style="font-size: 9.5pt; color: #b91c1c;">
            <td colspan="6" style="text-align: right; border: 1px solid #333; padding-right: 10px;">
              Khấu trừ thuế TNCN 10% (Theo Nghị định 253/2026/NĐ-CP):
            </td>
            <td style="text-align: right; border: 1px solid #333; font-weight: bold;">- ${formatNumber(report.taxAmount)}</td>
            <td style="border: 1px solid #333; font-size: 8.5pt;">Cấp chứng từ</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f1f5f9; font-size: 10.5pt;">
            <td colspan="6" style="text-align: right; border: 1px solid #333; padding-right: 10px; color: #15803d;">
              SỐ TIỀN THỰC LĨNH CHI TRẢ BÊN B:
            </td>
            <td style="text-align: right; border: 1px solid #333; color: #15803d; font-size: 11pt;">${formatNumber(report.netAmount)}</td>
            <td style="border: 1px solid #333;"></td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <!-- TIỀN BẰNG CHỮ -->
      <div style="font-size: 10.5pt; margin-bottom: 12px; line-height: 1.5;">
        (Bằng chữ: <strong><em>${numberToVietnameseWords(report.netAmount)}</em></strong>).
      </div>

      <!-- ĐÁNH GIÁ KẾT QUẢ -->
      <div style="font-size: 10.5pt; line-height: 1.6; margin-bottom: 16px;">
        <p style="font-weight: bold; margin: 3px 0;">ĐÁNH GIÁ KẾT QUẢ:</p>
        <p style="margin: 2px 0 2px 10px;">- <strong>Khối lượng bốc dỡ:</strong> Đúng số lượng theo vận đơn toa xe (${report.evaluationCompletedWagons} tấn).</p>
        <p style="margin: 2px 0 2px 10px;">- <strong>Chất lượng:</strong> Hàng hóa nguyên vẹn, giải phóng toa xe đúng thời gian quy định.</p>
        <p style="margin: 2px 0 2px 10px;">- Hai bên thống nhất làm thủ tục thanh toán số tiền trên cho Bên nhận khoán.</p>
      </div>

      <!-- CHỮ KÝ -->
      <table style="width: 100%; border: none; margin-top: 30px;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN BÊN NHẬN KHOÁN</div>
            <div style="font-size: 9.5pt; font-style: italic; margin-bottom: 55px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">${report.representativeB}</div>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN CHI NHÁNH</div>
            <div style="font-size: 9.5pt; font-style: italic; margin-bottom: 55px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">${report.representativeA}</div>
            <div style="font-size: 9pt; color: #444;">${report.roleA}</div>
          </td>
        </tr>
      </table>
    </div>
    `;
  }

  return `
    <div class="doc-page" style="font-family: 'Times New Roman', 'Tinos', Times, Georgia, serif; font-size: 12pt; line-height: 1.5; color: #000; page-break-before: always;">
      <!-- ĐƠN VỊ VÀ TIÊU ĐỀ BỘ PHẬN -->
      <table style="width: 100%; border: none; margin-bottom: 15px;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">ĐƠN VỊ: CHI NHÁNH VẬN TẢI ĐƯỜNG SẮT NHA TRANG</div>
            <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase;">BỘ PHẬN: HÓA VẬN / TRỰC BAN ${report.workStation.toUpperCase()}</div>
            <div style="font-size: 9pt; font-style: italic;">Số BB: ${report.reportNumber}</div>
          </td>
          <td style="width: 50%; text-align: right; vertical-align: top; font-size: 10pt; font-style: italic;">
            ${formatDateVi(report.acceptanceDate)}
          </td>
        </tr>
      </table>

      <!-- TIÊU ĐỀ BIÊN BẢN -->
      <div style="text-align: center; margin: 15px 0 15px 0;">
        <h2 style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0;">
          ${isCargo ? 'BIÊN BẢN NGHIỆM THU VÀ XÁC NHẬN KHỐI LƯỢNG BỐC DỠ' : 'BIÊN BẢN NGHIỆM THU VÀ XÁC NHẬN KHỐI LƯỢNG RỬA TÀU'}
        </h2>
        <div style="font-size: 11pt; font-style: italic; font-weight: 500;">
          (${report.periodDescription})
        </div>
      </div>

      <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 10px;">
        - Căn cứ Hợp đồng giao khoán số: <strong>${contract.contractNumber}</strong> ngày ${formatDateShortVi(contract.signDate)}.
      </div>
      <div style="font-size: 10.5pt; font-style: italic; margin-bottom: 12px;">
        Hôm nay, ${formatDateVi(report.acceptanceDate)}, tại <strong>${report.workStation}</strong> chúng tôi gồm:
      </div>

      <!-- ĐẠI DIỆN 2 BÊN -->
      <div style="font-size: 10.5pt; line-height: 1.6; margin-bottom: 14px;">
        <p style="margin: 2px 0;"><strong>1. ĐẠI DIỆN CHI NHÁNH:</strong></p>
        <p style="margin: 2px 0 2px 15px;">- Ông/Bà: <strong>${report.representativeA}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Chức vụ: <strong>${report.roleA}</strong></p>
        <p style="margin: 2px 0;"><strong>2. ĐẠI DIỆN BÊN NHẬN KHOÁN:</strong></p>
        <p style="margin: 2px 0 2px 15px;">- Ông/Bà: <strong>${report.representativeB}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; CCCD: <strong>${worker.cccdNumber}</strong></p>
      </div>

      <p style="font-size: 10.5pt; margin-bottom: 8px;">
        Hai bên tiến hành kiểm tra, nghiệm thu khối lượng ${isCargo ? 'bốc xếp hàng hóa' : 'vệ sinh, rửa toa xe'} thực tế như sau:
      </p>

      <!-- BẢNG KHỐI LƯỢNG CHI TIẾT -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10pt;" border="1" cellpadding="6">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: center; font-weight: bold;">
            <th style="width: 35px; border: 1px solid #333;">TT</th>
            <th style="width: 80px; border: 1px solid #333;">Ngày thực hiện</th>
            <th style="border: 1px solid #333;">Số hiệu toa xe / Nội dung</th>
            <th style="width: 60px; border: 1px solid #333;">Khối lượng</th>
            <th style="width: 95px; border: 1px solid #333;">Đơn giá (VNĐ)</th>
            <th style="width: 110px; border: 1px solid #333;">Thành tiền (VNĐ)</th>
            <th style="width: 90px; border: 1px solid #333;">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          ${report.items.map((item, idx) => `
            <tr>
              <td style="text-align: center; border: 1px solid #333;">${idx + 1}</td>
              <td style="text-align: center; border: 1px solid #333;">${formatDateShortVi(item.workDate)}</td>
              <td style="border: 1px solid #333;">
                <strong>${item.wagonOrBatchNumber}</strong><br/>
                <span style="font-size: 9pt; color: #444;">${item.description}</span>
              </td>
              <td style="text-align: center; border: 1px solid #333; font-weight: bold;">${item.quantity} ${item.unit}</td>
              <td style="text-align: right; border: 1px solid #333;">${formatNumber(item.unitPrice)}</td>
              <td style="text-align: right; border: 1px solid #333; font-weight: bold;">${formatNumber(item.amount)}</td>
              <td style="border: 1px solid #333; font-size: 9pt;">${item.notes || ''}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="5" style="text-align: right; border: 1px solid #333; padding-right: 10px;">TỔNG GIÁ TRỊ SẢN PHẨM HOÀN THÀNH:</td>
            <td style="text-align: right; border: 1px solid #333; color: #0284c7;">${formatNumber(report.grossAmount)}</td>
            <td style="border: 1px solid #333;"></td>
          </tr>
          ${report.isTaxWithheld ? `
          <tr style="font-size: 9.5pt; color: #b91c1c;">
            <td colspan="5" style="text-align: right; border: 1px solid #333; padding-right: 10px;">
              Khấu trừ thuế TNCN 10% (Theo Nghị định 253/2026/NĐ-CP):
            </td>
            <td style="text-align: right; border: 1px solid #333; font-weight: bold;">- ${formatNumber(report.taxAmount)}</td>
            <td style="border: 1px solid #333; font-size: 8.5pt;">Cấp chứng từ điện tử</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f1f5f9; font-size: 10.5pt;">
            <td colspan="5" style="text-align: right; border: 1px solid #333; padding-right: 10px; color: #15803d;">
              SỐ TIỀN THỰC LĨNH CHI TRẢ BÊN B:
            </td>
            <td style="text-align: right; border: 1px solid #333; color: #15803d; font-size: 11pt;">${formatNumber(report.netAmount)}</td>
            <td style="border: 1px solid #333;"></td>
          </tr>
          ` : `
          <tr style="font-size: 9.5pt; color: #475569;">
            <td colspan="5" style="text-align: right; border: 1px solid #333; padding-right: 10px;">
              Thuế TNCN: Tạm chưa khấu trừ (${report.grossAmount < 5000000 ? 'Dưới ngưỡng 5.000.000đ' : 'Đã có Bản cam kết thu nhập 08/CK-TNCN'})
            </td>
            <td style="text-align: right; border: 1px solid #333; font-weight: bold;">0</td>
            <td style="border: 1px solid #333; font-size: 8.5pt;">0%</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f1f5f9; font-size: 10.5pt;">
            <td colspan="5" style="text-align: right; border: 1px solid #333; padding-right: 10px; color: #15803d;">
              SỐ TIỀN CHI TRẢ BÊN B (100%):
            </td>
            <td style="text-align: right; border: 1px solid #333; color: #15803d; font-size: 11pt;">${formatNumber(report.netAmount)}</td>
            <td style="border: 1px solid #333;"></td>
          </tr>
          `}
        </tbody>
      </table>

      <!-- TIỀN BẰNG CHỮ -->
      <div style="font-size: 10.5pt; margin-bottom: 12px; line-height: 1.5;">
        (Số tiền thực lĩnh bằng chữ: <strong><em>${numberToVietnameseWords(report.netAmount)}</em></strong>).
      </div>

      <!-- ĐÁNH GIÁ KẾT QUẢ -->
      <div style="font-size: 10.5pt; line-height: 1.5; margin-bottom: 14px;">
        <p style="font-weight: bold; margin: 3px 0;">ĐÁNH GIÁ KẾT QUẢ:</p>
        <p style="margin: 2px 0 2px 10px;">- <strong>Khối lượng:</strong> Hoàn thành ${report.evaluationCompletedWagons} ${isCargo ? 'tấn hàng' : 'toa xe'} theo đúng kế hoạch tác nghiệp của Chi nhánh.</p>
        <p style="margin: 2px 0 2px 10px;">- <strong>Chất lượng:</strong> ${report.evaluationNotes}</p>
        <p style="margin: 2px 0 2px 10px;">- Hai bên thống nhất làm thủ tục thanh toán số tiền thực lĩnh trên cho Bên nhận khoán (Hình thức: ${report.paymentMethod === 'bank_transfer' ? 'Chuyển khoản qua số tài khoản ' + worker.bankAccount + ' tại ' + worker.bankName : 'Tiền mặt'}).</p>
      </div>

      <!-- CHỮ KÝ -->
      <table style="width: 100%; border: none; margin-top: 25px;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN BÊN NHẬN KHOÁN</div>
            <div style="font-size: 9.5pt; font-style: italic; margin-bottom: 55px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">${report.representativeB}</div>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top;">
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">ĐẠI DIỆN CHI NHÁNH</div>
            <div style="font-size: 9.5pt; font-style: italic; margin-bottom: 55px;">(Ký và ghi rõ họ tên)</div>
            <div style="font-size: 10.5pt; font-weight: bold; text-transform: uppercase;">${report.representativeA}</div>
            <div style="font-size: 9pt; color: #444;">${report.roleA}</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function exportHtmlToWordDoc(htmlBody: string, filename: string): void {
  const fullDocumentHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${filename}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page Section1 {
            size: 210mm 297mm; /* A4 standard: 21cm x 29.7cm */
            margin: 20mm 20mm 20mm 30mm; /* Top: 2cm, Right: 2cm, Bottom: 2cm, Left: 3cm */
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
            mso-paper-source: 0;
          }
          div.Section1 {
            page: Section1;
          }
          * {
            font-family: 'Times New Roman', Times, serif !important;
          }
          body, div, p, table, td, th, span, h1, h2, h3, h4, i, b, strong, em {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 12pt;
            color: #000;
            line-height: 1.45;
          }
          p { margin: 0 0 6pt 0; }
          table { border-collapse: collapse; }
          .doc-page { margin-bottom: 30pt; }
        </style>
      </head>
      <body>
        <div class="Section1">
          ${htmlBody}
        </div>
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', fullDocumentHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
