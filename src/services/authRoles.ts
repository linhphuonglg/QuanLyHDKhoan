import { UserRole, UserRoleProfile, AppAccount, Contract, WorkerContractor, AcceptanceReport } from '../types';

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
    name: 'Trạm VTĐS Nha Trang (userntr)',
    department: 'Tổ Tác nghiệp Ga Nha Trang (Hóa vận & Khách)',
    stationName: 'Ga Nha Trang',
    isStation: true,
    canEditContractContent: false, // CHỈ XEM NỘI DUNG/ĐIỀU KHOẢN HỢP ĐỒNG (KHÔNG ĐƯỢC SỬA)
    canEditContractDetails: true,  // Được sửa các thông tin, đơn giá, thời hạn HĐ
    canCreateContract: true,       // Được lập hợp đồng
    canDeleteContract: false,      // Chỉ Admin xóa
    canCreateWorker: true,         // Được tạo hồ sơ người nhận khoán
    canEditWorker: true,           // Được sửa hồ sơ
    canDeleteWorker: false,        // Chỉ Admin xóa
    canApprovePayment: false,      // Chỉ Admin duyệt chi
    canCreateAcceptance: true,     // Được lập biên bản nghiệm thu
    canEditAcceptance: true,       // Được sửa biên bản nghiệm thu
    canDeleteAcceptance: true,     // Được xóa biên bản nghiệm thu
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Trạm VTĐS Nha Trang: Đầy đủ các tính năng trong phạm vi trạm; điều khoản hợp đồng mẫu và duyệt chi thanh toán do Admin Chi nhánh phê duyệt.',
  },
  station_tuyhoa: {
    id: 'station_tuyhoa',
    name: 'Trạm VTĐS Tuy Hòa (usertho)',
    department: 'Tổ Tác nghiệp Ga Tuy Hòa',
    stationName: 'Ga Tuy Hòa',
    isStation: true,
    canEditContractContent: false, // CHỈ XEM NỘI DUNG/ĐIỀU KHOẢN HỢP ĐỒNG
    canEditContractDetails: true,
    canCreateContract: true,
    canDeleteContract: false,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canApprovePayment: false,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Trạm VTĐS Tuy Hòa: Đầy đủ các tính năng trong phạm vi trạm; điều khoản hợp đồng mẫu và duyệt chi thanh toán do Admin Chi nhánh phê duyệt.',
  },
  station_dieutri: {
    id: 'station_dieutri',
    name: 'Trạm VTĐS Diêu Trì (userdtr)',
    department: 'Tổ Tác nghiệp Ga Diêu Trì',
    stationName: 'Ga Diêu Trì',
    isStation: true,
    canEditContractContent: false, // CHỈ XEM NỘI DUNG/ĐIỀU KHOẢN HỢP ĐỒNG
    canEditContractDetails: true,
    canCreateContract: true,
    canDeleteContract: false,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canApprovePayment: false,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Trạm VTĐS Diêu Trì: Đầy đủ các tính năng trong phạm vi trạm; điều khoản hợp đồng mẫu và duyệt chi thanh toán do Admin Chi nhánh phê duyệt.',
  },
};

export const DEFAULT_APP_ACCOUNTS: Record<string, AppAccount> = {
  admin: {
    username: 'admin',
    password: 'admin123',
    fullName: 'Lê Quang Chính (Ban Giám đốc)',
    email: 'chinh.lq@vr.com.vn',
    phone: '0913.456.789',
    role: 'admin',
    stationId: 'all',
    stationName: 'Toàn Chi nhánh VTĐS Nha Trang',
    department: 'Ban Giám đốc & Phòng Kế hoạch - Kế toán Chi nhánh',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeText: 'Admin Chi nhánh · Full quyền',
    description: 'Toàn quyền hệ thống: Chỉnh sửa điều khoản hợp đồng mẫu, duyệt chi thanh toán, quản lý và phân bổ ngân sách toàn mạng lưới.',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    canEditContractContent: true,
    canCreateContract: true,
    canEditContractDetails: true,
    canDeleteContract: true,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: true,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    canApprovePayment: true,
    canDeleteMasterData: true,
    canManageAllStations: true,
  },
  userdtr: {
    username: 'userdtr',
    password: '123456',
    fullName: 'Trần Văn Bình (Trực ban Ga Diêu Trì)',
    email: 'binh.tv@vtds-dieutri.vr.vn',
    phone: '0905.123.456',
    role: 'station_dieutri',
    stationId: 'dieutri',
    stationName: 'Trạm VTĐS Diêu Trì',
    department: 'Tổ Tác nghiệp Ga Diêu Trì (Bình Định)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: 'Trạm VTĐS Diêu Trì',
    description: 'Phụ trách Ga Diêu Trì (Bình Định): Quản lý hợp đồng, lao động và nghiệm thu tác nghiệp bốc dỡ hàng hóa / rửa toa xe tại Ga Diêu Trì.',
    status: 'active',
    createdAt: '2026-01-05T08:30:00Z',
    canEditContractContent: false,
    canCreateContract: true,
    canEditContractDetails: true,
    canDeleteContract: false,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    canApprovePayment: false,
    canDeleteMasterData: false,
    canManageAllStations: false,
  },
  usertho: {
    username: 'usertho',
    password: '123456',
    fullName: 'Lê Quốc Bảo (Trực ban Ga Tuy Hòa)',
    email: 'bao.lq@vtds-tuyhoa.vr.vn',
    phone: '0908.765.432',
    role: 'station_tuyhoa',
    stationId: 'tuyhoa',
    stationName: 'Trạm VTĐS Tuy Hòa',
    department: 'Tổ Tác nghiệp Ga Tuy Hòa (Phú Yên)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'Trạm VTĐS Tuy Hòa',
    description: 'Phụ trách Ga Tuy Hòa (Phú Yên): Quản lý hợp đồng, lao động và nghiệm thu tác nghiệp bốc dỡ và rửa toa xe tại Ga Tuy Hòa.',
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    canEditContractContent: false,
    canCreateContract: true,
    canEditContractDetails: true,
    canDeleteContract: false,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    canApprovePayment: false,
    canDeleteMasterData: false,
    canManageAllStations: false,
  },
  userntr: {
    username: 'userntr',
    password: '123456',
    fullName: 'Nguyễn Minh Khoa (Hóa vận Ga Nha Trang)',
    email: 'khoa.nm@vtds-nhatrang.vr.vn',
    phone: '0918.999.888',
    role: 'station_nhatrang',
    stationId: 'nhatrang',
    stationName: 'Trạm VTĐS Nha Trang',
    department: 'Tổ Tác nghiệp Ga Nha Trang (Hóa vận & Khách)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: 'Trạm VTĐS Nha Trang',
    description: 'Phụ trách Ga Nha Trang & các ga liên kết (Ninh Hòa, Diên Khánh, Tháp Chàm): Quản lý hợp đồng, lao động và nghiệm thu tại chỗ.',
    status: 'active',
    createdAt: '2026-01-15T09:30:00Z',
    canEditContractContent: false,
    canCreateContract: true,
    canEditContractDetails: true,
    canDeleteContract: false,
    canCreateWorker: true,
    canEditWorker: true,
    canDeleteWorker: false,
    canCreateAcceptance: true,
    canEditAcceptance: true,
    canDeleteAcceptance: true,
    canApprovePayment: false,
    canDeleteMasterData: false,
    canManageAllStations: false,
  },
};

export const APP_ACCOUNTS = DEFAULT_APP_ACCOUNTS;

const STORAGE_USERS_KEY = 'vtds_users_database_v2';
const STORAGE_USER_KEY = 'vtds_active_auth_user';
const STORAGE_ROLE_KEY = 'vtds_nhatrang_active_role';

export function getAllAppAccounts(): AppAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (e) {
    console.error('Error loading users database', e);
  }
  return Object.values(DEFAULT_APP_ACCOUNTS);
}

export function saveAllAppAccounts(accounts: AppAccount[]): void {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving users database', e);
  }
}

export function createAppAccount(newAccount: AppAccount): void {
  const current = getAllAppAccounts();
  const exists = current.some(a => a.username.toLowerCase() === newAccount.username.toLowerCase());
  if (exists) {
    throw new Error(`Tên đăng nhập "${newAccount.username}" đã tồn tại trên hệ thống`);
  }
  const updated = [...current, newAccount];
  saveAllAppAccounts(updated);
}

export function updateAppAccount(username: string, changes: Partial<AppAccount>): void {
  const current = getAllAppAccounts();
  const updated = current.map(a => {
    if (a.username.toLowerCase() === username.toLowerCase()) {
      return { ...a, ...changes };
    }
    return a;
  });
  saveAllAppAccounts(updated);

  // If current logged-in user is modified, sync active user session
  const active = getStoredUser();
  if (active && active.username.toLowerCase() === username.toLowerCase()) {
    const freshUser = updated.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (freshUser) {
      saveStoredUser(freshUser);
    }
  }
}

export function deleteAppAccount(username: string): boolean {
  if (username.toLowerCase() === 'admin') {
    throw new Error('Không thể xóa tài khoản Quản trị viên chính (admin)');
  }
  const current = getAllAppAccounts();
  const filtered = current.filter(a => a.username.toLowerCase() !== username.toLowerCase());
  saveAllAppAccounts(filtered);
  return true;
}

export function authenticateUser(usernameInput: string, passwordInput: string): AppAccount | null {
  const cleanUsername = (usernameInput || '').trim().toLowerCase();
  const cleanPassword = (passwordInput || '').trim();

  const allAccounts = getAllAppAccounts();
  const account = allAccounts.find(a => a.username.toLowerCase() === cleanUsername);
  if (!account) return null;

  if (account.status === 'locked') {
    throw new Error('Tài khoản này hiện đang bị khóa. Vui lòng liên hệ Admin Chi nhánh.');
  }

  // Check stored password or standard default test passwords
  const validPasswords = [
    account.password || '',
    '123456',
    'password123',
    `${cleanUsername}123`,
    cleanUsername === 'admin' ? 'admin123' : '',
    cleanUsername === 'userdtr' ? 'dtr123' : '',
    cleanUsername === 'usertho' ? 'tho123' : '',
    cleanUsername === 'userntr' ? 'ntr123' : '',
  ].filter(Boolean);

  if (validPasswords.includes(cleanPassword) || cleanPassword === cleanUsername) {
    return account;
  }

  return null;
}

export function getStoredUser(): AppAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username) {
        const all = getAllAppAccounts();
        const found = all.find(a => a.username.toLowerCase() === parsed.username.toLowerCase());
        return found || parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored user', e);
  }
  return null;
}

export function saveStoredUser(user: AppAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      localStorage.setItem(STORAGE_ROLE_KEY, user.role);
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_ROLE_KEY);
    }
  } catch (e) {
    console.error('Error saving stored user', e);
  }
}

export function logoutUser(): void {
  saveStoredUser(null);
}

export const APP_ACCOUNTS_LIST: AppAccount[] = Object.values(DEFAULT_APP_ACCOUNTS);

export function getStoredUserRole(): UserRole {
  const user = getStoredUser();
  if (user) return user.role;

  try {
    const saved = localStorage.getItem(STORAGE_ROLE_KEY);
    if (saved && (saved in USER_ROLES)) {
      return saved as UserRole;
    }
  } catch {
    // ignore
  }
  return 'admin';
}

export function saveUserRole(role: UserRole): void {
  try {
    localStorage.setItem(STORAGE_ROLE_KEY, role);
    const all = getAllAppAccounts();
    const matchedAccount = all.find(acc => acc.role === role);
    if (matchedAccount) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(matchedAccount));
    }
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
  const profile = getUserRoleProfile(role);
  if (!profile.isStation) return true;
  
  const cleanProfileStation = profile.stationName.toLowerCase().replace('ga ', '').replace('trạm ', '').trim();
  const cleanLoc = stationLocation.toLowerCase().replace('ga ', '').replace('trạm ', '').trim();

  return cleanLoc.includes(cleanProfileStation) || cleanProfileStation.includes(cleanLoc);
}
