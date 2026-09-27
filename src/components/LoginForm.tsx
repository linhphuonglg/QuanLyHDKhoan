import React, { useState } from 'react';
import { 
  Shield, 
  Train, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles
} from 'lucide-react';
import { AppAccount } from '../types';
import { APP_ACCOUNTS, authenticateUser } from '../services/authRoles';

interface LoginFormProps {
  onLoginSuccess: (account: AppAccount) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const account = authenticateUser(username, password);
        setIsLoading(false);

        if (account) {
          onLoginSuccess(account);
        } else {
          setErrorMessage(
            'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
          );
        }
      } catch (err: unknown) {
        setIsLoading(false);
        if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Lỗi xác thực tài khoản');
        }
      }
    }, 250);
  };

  const handleQuickLogin = (acc: AppAccount) => {
    setUsername(acc.username);
    setPassword('123456');
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(acc);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Railway Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 -left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-10 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl mb-4">
          <Train className="w-9 h-9 text-blue-400" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-blue-400 mb-1">
          TẬP ĐOÀN ĐƯỜNG SẮT QUỐC GIA VIỆT NAM
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Chi nhánh Vận tải đường sắt Nha Trang
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Hệ thống Quản lý Hợp đồng Giao khoán & Nghiệm thu Sản phẩm
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Main Card Header */}
          <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Xác thực & Phân quyền Truy cập
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
              Nghị định 253/2026/NĐ-CP
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Form Inputs */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin, userdtr, usertho, userntr"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm font-medium border border-slate-300 rounded-lg bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu mặc định: 123456"
                    className="block w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm font-medium border border-slate-300 rounded-lg bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Gợi ý: Mật khẩu mặc định là <span className="font-mono font-bold text-slate-700">123456</span> hoặc bấm chọn tài khoản bên dưới để đăng nhập tức thì.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in-50">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng nhập vào Hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Login Card Grid */}
            <div className="pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Đăng nhập nhanh theo phân quyền (1-Click Login)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Chọn vai trò cần kiểm tra</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Account 1: Admin */}
                <div 
                  onClick={() => handleQuickLogin(APP_ACCOUNTS.admin)}
                  className="group p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 hover:border-rose-400 transition-all cursor-pointer relative shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>admin</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white uppercase">
                            Full quyền
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Chi nhánh VTĐS Nha Trang</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-900 mt-2 leading-relaxed font-medium">
                    Toàn quyền: Sửa điều khoản mẫu, duyệt chi, xem tất cả các trạm.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">Pass: 123456</span>
                    <span className="font-bold text-rose-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Đăng nhập &rarr;
                    </span>
                  </div>
                </div>

                {/* Account 2: Diêu Trì */}
                <div 
                  onClick={() => handleQuickLogin(APP_ACCOUNTS.userdtr)}
                  className="group p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-400 transition-all cursor-pointer relative shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Train className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>userdtr</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 uppercase">
                            Trạm Diêu Trì
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Ga Diêu Trì (Bình Định)</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-purple-900 mt-2 leading-relaxed font-medium">
                    Quản lý hợp đồng & nghiệm thu bốc dỡ/vệ sinh tại Trạm Diêu Trì.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">Pass: 123456</span>
                    <span className="font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Đăng nhập &rarr;
                    </span>
                  </div>
                </div>

                {/* Account 3: Tuy Hòa */}
                <div 
                  onClick={() => handleQuickLogin(APP_ACCOUNTS.usertho)}
                  className="group p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 transition-all cursor-pointer relative shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Train className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>usertho</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            Trạm Tuy Hòa
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Ga Tuy Hòa (Phú Yên)</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-900 mt-2 leading-relaxed font-medium">
                    Quản lý hợp đồng & nghiệm thu rửa toa xe/bốc dỡ tại Ga Tuy Hòa.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">Pass: 123456</span>
                    <span className="font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Đăng nhập &rarr;
                    </span>
                  </div>
                </div>

                {/* Account 4: Nha Trang */}
                <div 
                  onClick={() => handleQuickLogin(APP_ACCOUNTS.userntr)}
                  className="group p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer relative shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <Train className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>userntr</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-800 uppercase">
                            Trạm Nha Trang
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Ga Nha Trang & Khánh Hòa</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-blue-900 mt-2 leading-relaxed font-medium">
                    Quản lý hợp đồng & nghiệm thu tại Ga Nha Trang, Ninh Hòa, Tháp Chàm.
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-500">Pass: 123456</span>
                    <span className="font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Đăng nhập &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Chi nhánh Vận tải đường sắt Nha Trang · 17 Thái Nguyên, Phường Nha Trang, Khánh Hòa · ĐT: 0258.3822113
          </div>
        </div>
      </div>
    </div>
  );
};
