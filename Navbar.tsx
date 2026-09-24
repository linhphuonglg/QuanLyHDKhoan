import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Users, 
  ShieldCheck, 
  PlusCircle, 
  DownloadCloud,
  FileSpreadsheet,
  Shield,
  Train,
  ChevronDown,
  Check,
  Lock
} from 'lucide-react';
import { UserRole } from '../types';
import { USER_ROLES, getUserRoleProfile } from '../services/authRoles';

export type ActiveTab = 'contracts' | 'acceptances' | 'budget' | 'workers' | 'legal' | 'googlesheets';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onNewContract: () => void;
  onExportExcel: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewContract,
  onExportExcel,
  currentRole,
  onRoleChange,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProfile = getUserRoleProfile(currentRole);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('contracts')} 
              className="text-left group flex items-center gap-2.5 cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
                ĐS
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                  Đường Sắt Nha Trang
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight">
                  Hợp đồng & Nghiệm thu
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text links with active indicator) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'contracts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Hợp đồng Giao khoán</span>
            </button>

            <button
              onClick={() => setActiveTab('acceptances')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'acceptances'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Nghiệm thu Sản phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'budget'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Biểu đồ Ngân sách</span>
            </button>

            <button
              onClick={() => setActiveTab('workers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'workers'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Hồ sơ Lao động</span>
            </button>

            <button
              onClick={() => setActiveTab('legal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'legal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Pháp lý & HR</span>
            </button>

            <button
              onClick={() => setActiveTab('googlesheets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'googlesheets'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Google Sheet (6 Trang)</span>
            </button>
          </nav>

          {/* Zone 3: Role Switcher & Action buttons */}
          <div className="flex items-center gap-2">
            {/* RBAC Role Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition-all cursor-pointer shadow-2xs ${
                  currentRole === 'admin'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                }`}
                title="Bấm để chuyển đổi phân quyền giữa Admin Chi nhánh và các Trạm"
              >
                {currentRole === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <Train className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] font-bold uppercase tracking-wider leading-none text-slate-500">
                    Phân quyền
                  </div>
                  <div className="text-xs font-bold leading-tight truncate max-w-[140px]">
                    {activeProfile.name.replace(' - Chi nhánh VTĐS Nha Trang', '')}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 slide-in-from-top-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                      Chọn vai trò truy cập hệ thống
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Theo chỉ đạo phân quyền Admin Chi nhánh & các Trạm cấp dưới
                    </p>
                  </div>

                  <div className="p-1 space-y-1">
                    {(Object.keys(USER_ROLES) as UserRole[]).map((rKey) => {
                      const profile = USER_ROLES[rKey];
                      const isSelected = currentRole === rKey;
                      return (
                        <button
                          key={rKey}
                          onClick={() => {
                            onRoleChange(rKey);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 border border-slate-300'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {rKey === 'admin' ? (
                              <Shield className="w-4 h-4 text-rose-600" />
                            ) : (
                              <Train className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {profile.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {profile.department}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                profile.canEditContractContent
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {profile.canEditContractContent ? 'Sửa nội dung HĐ' : 'Chỉ xem nội dung HĐ'}
                              </span>
                              {profile.isStation && (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 font-semibold">
                                  Nghiệm thu: {profile.stationName}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onExportExcel}
              title="Xuất dữ liệu Excel"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            {activeProfile.canCreateContract ? (
              <button
                onClick={onNewContract}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tạo Hợp đồng</span>
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed whitespace-nowrap"
                title="Chỉ Admin Chi nhánh VTĐS Nha Trang mới có quyền tạo hợp đồng mới. Trạm chỉ xem nội dung."
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Trạm chỉ xem</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'contracts' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Hợp đồng
          </button>
          <button
            onClick={() => setActiveTab('acceptances')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'acceptances' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Nghiệm thu
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'budget' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Biểu đồ Ngân sách
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'workers' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Lao động
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'legal' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Pháp lý HR
          </button>
          <button
            onClick={() => setActiveTab('googlesheets')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'googlesheets' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-700 bg-emerald-50'
            }`}
          >
            Google Sheet
          </button>
        </div>
      </div>
    </header>
  );
};
