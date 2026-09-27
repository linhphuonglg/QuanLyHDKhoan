import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  FileSpreadsheet,
  Shield,
  Train,
  ChevronDown,
  Check,
  Lock,
  LogOut,
  User,
  KeyRound,
  Building2,
  MapPin,
  Menu,
  X,
  UserCog,
  Sliders
} from 'lucide-react';
import { UserRole, AppAccount } from '../types';
import { USER_ROLES, APP_ACCOUNTS, getUserRoleProfile } from '../services/authRoles';

export type ActiveTab = 'contracts' | 'acceptances' | 'budget' | 'workers' | 'legal' | 'googlesheets' | 'users';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewContract: () => void;
  onExportExcel: () => void;
  currentRole: UserRole;
  currentUser: AppAccount | null;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewContract,
  onExportExcel,
  currentRole,
  currentUser,
  onRoleChange,
  onLogout,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProfile = getUserRoleProfile(currentRole);
  const displayAccount: AppAccount = currentUser || APP_ACCOUNTS[currentRole === 'admin' ? 'admin' : (currentRole === 'station_dieutri' ? 'userdtr' : (currentRole === 'station_tuyhoa' ? 'usertho' : 'userntr'))];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      id: 'contracts' as ActiveTab,
      label: 'Hợp Đồng',
      icon: FileText,
      description: 'Quản lý HĐ giao khoán',
    },
    {
      id: 'acceptances' as ActiveTab,
      label: 'Nghiệm Thu',
      icon: CheckSquare,
      description: 'Nghiệm thu khối lượng & chi trả',
    },
    {
      id: 'budget' as ActiveTab,
      label: 'Ngân Sách',
      icon: BarChart3,
      description: 'Hạn mức & khấu trừ thuế 10%',
    },
    {
      id: 'workers' as ActiveTab,
      label: 'Lao Động',
      icon: Users,
      description: 'Danh bạ người nhận khoán',
    },
    {
      id: 'legal' as ActiveTab,
      label: 'Pháp Lý & HR',
      icon: ShieldCheck,
      description: 'Thẩm định điều khoản & NĐ 253',
    },
    {
      id: 'googlesheets' as ActiveTab,
      label: 'Google Sheet',
      badge: '6 Trang',
      icon: FileSpreadsheet,
      description: 'Báo cáo tổng hợp chuẩn biểu mẫu',
    },
    {
      id: 'users' as ActiveTab,
      label: 'Người Dùng',
      badge: 'Phân Quyền',
      icon: UserCog,
      description: 'Quản lý tài khoản & phân quyền',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Official Railway Header Top Accent Strip */}
      <div className="h-1 bg-linear-to-r from-blue-900 via-blue-700 to-indigo-600 w-full" />

      {/* TIER 1: CHI NHÁNH VTĐS NHA TRANG BRAND IDENTITY & USER ACTIONS */}
      <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-3.5 min-h-[64px] gap-3 sm:gap-4">
          
          {/* BRAND IDENTITY */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('contracts')} 
              className="text-left group flex items-center gap-3 cursor-pointer focus:outline-none"
            >
              {/* VNR Emblem Logo */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-br from-blue-950 via-slate-900 to-blue-900 flex items-center justify-center text-white shadow-xs border border-blue-800/40 shrink-0 group-hover:scale-[1.02] transition-transform">
                <Train className="w-5 h-5 sm:w-6 sm:h-6 text-blue-200" />
                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-extrabold px-1 py-0.2 rounded bg-amber-500 text-slate-950 uppercase tracking-tighter shadow-2xs">
                  VNR
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-800 leading-tight">
                  TẬP ĐOÀN ĐƯỜNG SẮT QUỐC GIA VIỆT NAM
                </span>
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                  Chi Nhánh Vận Tải Đường Sắt Nha Trang
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline-block leading-tight">
                  Hệ thống Quản lý Hợp đồng Giao khoán & Nghiệm thu
                </span>
              </div>
            </button>
          </div>

          {/* USER ACTIONS & PRIMARY BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* User Profile Dropdown (Red Section Removed) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium border rounded-xl transition-all cursor-pointer shadow-2xs ${
                  currentRole === 'admin'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-950 hover:bg-rose-100/80'
                    : currentRole === 'station_dieutri'
                    ? 'bg-purple-50/80 border-purple-200 text-purple-950 hover:bg-purple-100/80'
                    : currentRole === 'station_tuyhoa'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 hover:bg-emerald-100/80'
                    : 'bg-blue-50/80 border-blue-200 text-blue-950 hover:bg-blue-100/80'
                }`}
                title="Bấm để xem thông tin tài khoản hoặc phân quyền"
              >
                {/* Avatar Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  currentRole === 'admin' 
                    ? 'bg-rose-200 text-rose-800' 
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {currentRole === 'admin' ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Train className="w-4 h-4" />
                  )}
                </div>

                {/* Identity Information */}
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {displayAccount.username}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      currentRole === 'admin' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {currentRole === 'admin' ? 'Full quyền' : 'Trạm'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px] leading-tight mt-0.5">
                    {displayAccount.stationName}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 shrink-0" />
              </button>

              {/* Profile Menu Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-in fade-in-50 slide-in-from-top-1">
                  
                  {/* Account Overview Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Tài khoản hiện tại
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        currentRole === 'admin' 
                          ? 'bg-rose-100 text-rose-800 border-rose-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {displayAccount.badgeText}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{displayAccount.fullName}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{displayAccount.department}</span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed shadow-2xs">
                      {displayAccount.description}
                    </div>
                  </div>

                  {/* Navigation Links inside Profile */}
                  <div className="p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('users');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-blue-50 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <UserCog className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">Quản lý Người Dùng & Phân Quyền</div>
                        <div className="text-[10px] text-slate-500">Thêm người dùng, cấp quyền chi tiết</div>
                      </div>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 mt-1 border-t border-slate-100 px-2">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Đăng Xuất (Về Trang Đăng Nhập)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Export Excel Action */}
            <button
              onClick={onExportExcel}
              title="Xuất dữ liệu biên bản nghiệm thu & hợp đồng ra file Excel"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300/80 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            {/* Primary Action Button: + Tạo Hợp Đồng */}
            {activeProfile.canCreateContract ? (
              <button
                onClick={onNewContract}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-linear-to-r from-blue-700 via-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-xs hover:shadow"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tạo Hợp Đồng Mới</span>
              </button>
            ) : (
              <div 
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 rounded-xl border border-slate-200"
                title="Quyền Lập hợp đồng thuộc thẩm quyền của Admin"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Chỉ xem HĐ</span>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2 (LOWER ROW): DEDICATED NAVIGATION TABS BAR */}
      <div className="bg-slate-50/90 border-t border-slate-200/80">
        <div className="w-full max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center gap-1 py-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                  title={item.description}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 animate-in fade-in-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
