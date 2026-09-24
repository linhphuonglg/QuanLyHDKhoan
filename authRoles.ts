import { UserRole, UserRoleProfile } from '../types';

export const USER_ROLES: Record<UserRole, UserRoleProfile> = {
  admin: {
    id: 'admin',
    name: 'Admin - Chi nhánh VTĐS Nha Trang',
    department: 'Ban Giám đốc & Phòng Kế hoạch - Tài chính',
    stationName: 'Toàn mạng lưới Chi nhánh',
    isStation: false,
    canEditContractContent: true, // TOÀN QUYỀN SỬA ĐIỀU KHOẢN VÀ NỘI DUNG HỢP ĐỒNG
    canEditContractDetails: true, // Sửa đơn giá, thời hạn, bên A, bên B
    canCreateContract: true,      // Lập hợp đồng mới
    canDeleteContract: true,      // Xóa/hủy hợp đồng
    canCreateWorker: true,        // Tạo hồ sơ người lao động
    canEditWorker: true,          // Chỉnh sửa hồ sơ, ngân sách giao
    canDeleteWorker: true,        // Xóa hồ sơ
    canApprovePayment: true,      // Phê duyệt chi & quyết toán thanh toán
    canCreateAcceptance: true,    // Lập biên bản nghiệm thu
    canEditAcceptance: true,      // Sửa biên bản nghiệm thu
    canDeleteAcceptance: true,    // Xóa biên bản nghiệm thu
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Quản trị viên Chi nhánh: Toàn quyền chỉnh sửa nội dung hợp đồng, ban hành chính sách, phân bổ ngân sách và duyệt chi.',
  },
  station_nhatrang: {
    id: 'station_nhatrang',
    name: 'Trạm VTĐS Nha Trang',
    department: 'Tổ Tác nghiệp Ga Nha Trang (Hóa vận & Khách)',
    stationName: 'Ga Nha Trang',
    isStation: true,
    canEditContractContent: false, // CHỈ XEM NỘI DUNG/ĐIỀU KHOẢN HỢP ĐỒNG (KHÔNG ĐƯỢC SỬA)
    canEditContractDetails: true,  // Được sửa các thông tin, đơn giá, thời hạn HĐ
    canCreateContract: true,       // Được lập hợp đồng
    canDeleteContract: true,       // Được xóa hợp đồng
    canCreateWorker: true,         // Được tạo hồ sơ người nhận khoán
    canEditWorker: true,           // Được sửa hồ sơ
    canDeleteWorker: true,         // Được xóa hồ sơ
    canApprovePayment: true,       // Được duyệt chi/thanh toán
    canCreateAcceptance: true,     // Được lập biên bản nghiệm thu
    canEditAcceptance: true,       // Được sửa biên bản nghiệm thu
    canDeleteAcceptance: true,     // Được xóa biên bản nghiệm thu
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Trạm VTĐS Nha Trang: Đầy đủ các tính năng; riêng nội dung và điều khoản hợp đồng chỉ xem (Admin Chi nhánh phê duyệt).',
  },
  station_tuyhoa: {
    id: 'station_tuyhoa',
    name: 'Trạm VTĐS Tuy Hòa',
    department: 'Tổ Tác nghiệp Ga Tuy Hòa',
    stationName: 'Ga Tuy Hòa',
    isStation: true,
    canEditContractContent: false, // CHỈ XEM NỘI DUNG/ĐIỀU KHOẢN HỢP ĐỒNG
    canEditContractDetails: true,
    canCreateContract: true,
    canDeleteContract: true,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: true,
    canApprovePayment: true,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Trạm VTĐS Tuy Hòa: Đầy đủ các tính năng; riêng nội dung và điều khoản hợp đồng chỉ xem (Admin Chi nhánh phê duyệt).',
  },
  station_dieutri: {
    id: 'station_dieutri',
    name: 'Trạm VTĐS Diêu Trì',
    department: 'Tổ Tác nghiệp Ga Diêu Trì',
    stationName: 'Ga Diêu Trì',
    isStation: true,
    canEditContractContent: false, // CHỈ XEM NỘI DUNG/ĐIỀU KHOẢN HỢP ĐỒNG
    canEditContractDetails: true,
    canCreateContract: true,
    canDeleteContract: true,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: true,
    canApprovePayment: true,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Trạm VTĐS Diêu Trì: Đầy đủ các tính năng; riêng nội dung và điều khoản hợp đồng chỉ xem (Admin Chi nhánh phê duyệt).',
  },
};

const STORAGE_ROLE_KEY = 'vtds_nhatrang_active_role';

export function getStoredUserRole(): UserRole {
  try {
    const saved = localStorage.getItem(STORAGE_ROLE_KEY);
    if (saved && (saved in USER_ROLES)) {
      return saved as UserRole;
    }
  } catch {
    // ignore
  }
  return 'admin'; // Mặc định là Admin
}

export function saveUserRole(role: UserRole): void {
  try {
    localStorage.setItem(STORAGE_ROLE_KEY, role);
  } catch {
    // ignore
  }
}

export function getUserRoleProfile(role: UserRole): UserRoleProfile {
  return USER_ROLES[role] || USER_ROLES.admin;
}

export function canUserManageContract(role: UserRole): boolean {
  return USER_ROLES[role]?.canEditContractContent ?? false;
}

export function isStationMatching(role: UserRole, stationLocation: string): boolean {
  if (role === 'admin') return true;
  const loc = (stationLocation || '').toLowerCase();
  if (role === 'station_nhatrang') return loc.includes('nha trang') || loc.includes('khánh hòa');
  if (role === 'station_tuyhoa') return loc.includes('tuy hòa') || loc.includes('phú yên');
  if (role === 'station_dieutri') return loc.includes('diêu trì') || loc.includes('bình định');
  return false;
}

