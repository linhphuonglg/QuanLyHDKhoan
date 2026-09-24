export type SocialInsuranceStatus = 
  | 'freelance' // Lao động tự do vãng lai không thuộc diện BHXH bắt buộc
  | 'retired'   // Đang hưởng chế độ hưu trí hàng tháng
  | 'dual_employer'; // Đang đóng BHXH bắt buộc tại đơn vị thứ nhất

export type ContractTemplateType = 
  | 'CLEANING_FREELANCE'    // Mẫu 1: Dịch vụ vệ sinh, rửa toa xe tại ga (Lao động tự do vãng lai)
  | 'CLEANING_RETIRED'      // Mẫu 2: Dịch vụ vệ sinh toa xe / bốc xếp (Hưu trí / ngoài tuổi LĐ)
  | 'CARGO_DUAL_EMPLOYER'   // Mẫu 3: Dịch vụ bốc dỡ hàng hóa từ toa sang ô tô/kho (Đang có BHXH đơn vị khác)
  | 'CARGO_PRINCIPLE_VTHN'; // Mẫu 4 (PDF chuẩn): Hợp đồng nguyên tắc giao khoán dịch vụ bốc xếp (HĐNT-VTHN-NT - Hóa vận Ga)

export interface WorkerContractor {
  id: string;
  fullName: string;
  birthDate: string;
  cccdNumber: string;
  cccdDate: string;
  cccdPlace: string;
  address: string;
  taxCode: string;
  phone: string;
  bankAccount: string;
  bankName: string;
  socialStatus: SocialInsuranceStatus;
  pensionBookNumber?: string;       // Sổ BHXH/Thẻ hưu trí (nếu là hưu trí)
  primaryEmployerName?: string;     // Đơn vị công tác chính thức (nếu dual_employer)
  primaryLaborContractNo?: string;  // HĐLĐ số tại đơn vị thứ nhất
  primaryBhxhCode?: string;         // Mã số BHXH tại đơn vị thứ nhất
  hasTaxCommitmentForm: boolean;    // Đã nộp Bản cam kết thu nhập tạm miễn khấu trừ 10% (chỉ áp dụng nếu có 1 nguồn duy nhất)
  allocatedBudget: number;          // Hạn mức ngân sách giao (VNĐ)
  notes?: string;
  createdAt: string;
}

export interface PartyAInfo {
  organizationName: string;
  address: string;
  taxCode: string;
  representativeName: string;
  representativeTitle: string;
  phone?: string;
}

export type UserRole = 
  | 'admin'             // Admin - Chi nhánh Vận tải đường sắt Nha Trang (Toàn quyền quản trị & chỉnh sửa nội dung HĐ)
  | 'station_nhatrang'  // Trạm VTĐS Nha Trang (Chỉ xem nội dung HĐ; quản lý nghiệm thu Ga Nha Trang)
  | 'station_tuyhoa'    // Trạm VTĐS Tuy Hòa (Chỉ xem nội dung HĐ; quản lý nghiệm thu Ga Tuy Hòa)
  | 'station_dieutri';  // Trạm VTĐS Diêu Trì (Chỉ xem nội dung HĐ; quản lý nghiệm thu Ga Diêu Trì)

export interface UserRoleProfile {
  id: UserRole;
  name: string;
  department: string;
  stationName: string;
  isStation: boolean;
  canEditContractContent: boolean; // Chỉ Admin
  canEditContractDetails: boolean; // Chỉ Admin
  canCreateContract: boolean;      // Chỉ Admin
  canDeleteContract: boolean;      // Chỉ Admin
  canCreateWorker: boolean;        // Chỉ Admin
  canEditWorker: boolean;          // Chỉ Admin
  canDeleteWorker: boolean;        // Chỉ Admin
  canApprovePayment: boolean;      // Chỉ Admin (Duyệt chi thanh toán)
  canCreateAcceptance: boolean;    // Admin & Trạm
  canEditAcceptance: boolean;      // Admin & Trạm
  canDeleteAcceptance: boolean;    // Chỉ Admin
  badgeColor: string;
  description: string;
}

export interface CustomContractContent {
  customTitle?: string;
  customLegalBasis?: string;
  customArticle1?: string; // Điều 1: Phạm vi và nguyên tắc thực hiện công việc
  customArticle2?: string; // Điều 2: Đơn giá khoán và phương thức thanh toán
  customArticle3?: string; // Điều 3: BHXH và Thuế TNCN (NĐ 253/2026/NĐ-CP)
  customArticle4?: string; // Điều 4: An toàn lao động và bồi thường thiệt hại
  customArticle5?: string; // Điều 5: Điều khoản thi hành & Hiệu lực
  customNotes?: string;    // Điều khoản bổ sung riêng
  lastEditedBy?: string;
  lastEditedAt?: string;
}

export interface Contract {
  id: string;
  contractNumber: string; // VD: 01/2026/HĐGK-SP-NT hoặc 03/2026/HĐGK-VTHN-NT
  templateType: ContractTemplateType;
  workerId: string;
  partyA: PartyAInfo;
  stationLocation: string; // Ga Nha Trang, Ga Tháp Chàm, Ga Diên Khánh...
  signDate: string;        // Ngày ký
  signPlace: string;       // Địa điểm ký (mặc định: Chi nhánh Vận tải đường sắt Nha Trang)
  startDate: string;       // Ngày bắt đầu hiệu lực
  endDate: string;         // Ngày kết thúc (thời hạn 01 năm)
  
  // Đơn giá khoán thỏa thuận
  rateExteriorWash: number; // Rửa sạch vỏ ngoài toa xe khách (đồng/toa)
  rateInteriorWash: number; // Vệ sinh nội thất toa xe khách (đồng/toa)
  rateCargoPackage: number; // Bốc xếp hàng bao kiện (đồng/tấn)
  rateCargoBulk: number;    // Bốc xếp hàng rời (đồng/tấn)
  
  // Tùy biến nội dung điều khoản hợp đồng bởi Admin
  customContent?: CustomContractContent;

  status: 'active' | 'pending' | 'completed' | 'terminated';
  notes?: string;
  createdAt: string;
}

export interface AcceptanceDetailItem {
  id: string;
  workDate: string;         // Ngày thực hiện
  wagonOrBatchNumber: string; // Số hiệu toa xe hoặc số phiếu chuyến tàu (VD: B-31422, H-1250)
  itemType: 'exterior' | 'interior' | 'cargo_package' | 'cargo_bulk' | 'other';
  description: string;      // Diễn giải chi tiết việc làm
  unit: string;             // toa xe, tấn...
  quantity: number;         // Số lượng
  unitPrice: number;        // Đơn giá (VNĐ)
  amount: number;           // Thành tiền (VNĐ)
  notes?: string;
}

export interface AcceptanceReport {
  id: string;
  reportNumber: string;     // Số biên bản: BB-01/2026 hoặc Đợt ngày ...
  contractId: string;
  workerId: string;
  periodDescription: string; // Đợt ngày 15/09/2026 hoặc Tháng 09/2026
  workStation: string;      // Ga tác nghiệp (Ga Nha Trang, Ga Tháp Chàm...)
  acceptanceDate: string;   // Ngày lập biên bản
  
  representativeA: string;  // Đại diện Chi nhánh (Trực ban/Hóa vận Ga)
  roleA: string;            // Chức vụ (Trực ban Ga / Hóa vận Ga)
  representativeB: string;  // Đại diện Bên nhận khoán (Họ tên người lao động)
  
  items: AcceptanceDetailItem[];
  
  grossAmount: number;      // Tổng giá trị sản phẩm trước thuế (VNĐ)
  isTaxWithheld: boolean;   // Có thực hiện khấu trừ thuế TNCN 10% hay không
  taxRate: number;          // 0.1 (10%) hoặc 0
  taxAmount: number;        // Số tiền thuế TNCN khấu trừ (VNĐ)
  netAmount: number;        // Số tiền thực lĩnh (VNĐ)
  
  paymentStatus: 'pending' | 'approved' | 'paid';
  paymentMethod: 'bank_transfer' | 'cash';
  paymentDate?: string;
  paymentReference?: string; // Mã ủy nhiệm chi ngân hàng hoặc số phiếu chi
  
  evaluationCompletedWagons: number; // Số toa xe hoặc tấn hàng hoàn thành
  qualityPassed: boolean;    // Đạt tiêu chuẩn kỹ thuật vệ sinh / an toàn bốc xếp
  evaluationNotes: string;   // Đánh giá kết quả: Vỏ ngoài sạch bùn đất, kính sáng rõ...
  
  createdAt: string;
}

export interface WorkerBudgetSummary {
  worker: WorkerContractor;
  allocatedBudget: number;
  totalConfirmedGross: number;
  totalTaxWithheld: number;
  totalNetPaid: number;
  remainingBudget: number;
  percentUsed: number;
  contractsCount: number;
  reportsCount: number;
  statusColor: 'green' | 'amber' | 'red';
}
