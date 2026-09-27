import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Train, 
  KeyRound, 
  CheckCircle2, 
  Search, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  Building2, 
  MapPin, 
  Phone, 
  Check, 
  X, 
  AlertCircle,
  Sliders,
  Info
} from 'lucide-react';
import { AppAccount, UserRole } from '../types';
import { 
  getAllAppAccounts, 
  createAppAccount, 
  updateAppAccount, 
  deleteAppAccount
} from '../services/authRoles';

interface UserManagementViewProps {
  currentUser: AppAccount | null;
  onRefreshUsers?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onRefreshUsers,
}) => {
  const [users, setUsers] = useState<AppAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppAccount | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('station_nhatrang');
  const [stationId, setStationId] = useState<string>('nhatrang');
  const [stationName, setStationName] = useState<string>('Trạm VTĐS Nha Trang');
  const [department, setDepartment] = useState<string>('Tổ Tác nghiệp Ga Nha Trang');
  const [description, setDescription] = useState<string>('');

  // Granular Permissions Checkboxes
  const [canEditContractContent, setCanEditContractContent] = useState(false);
  const [canCreateContract, setCanCreateContract] = useState(true);
  const [canEditContractDetails, setCanEditContractDetails] = useState(true);
  const [canDeleteContract, setCanDeleteContract] = useState(false);
  const [canCreateWorker, setCanCreateWorker] = useState(true);
  const [canEditWorker, setCanEditWorker] = useState(true);
  const [canDeleteWorker, setCanDeleteWorker] = useState(false);
  const [canCreateAcceptance, setCanCreateAcceptance] = useState(true);
  const [canEditAcceptance, setCanEditAcceptance] = useState(true);
  const [canDeleteAcceptance, setCanDeleteAcceptance] = useState(true);
  const [canApprovePayment, setCanApprovePayment] = useState(false);
  const [canDeleteMasterData, setCanDeleteMasterData] = useState(false);
  const [canManageAllStations, setCanManageAllStations] = useState(false);

  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadUserList();
  }, []);

  const loadUserList = () => {
    const list = getAllAppAccounts();
    setUsers(list);
    if (onRefreshUsers) onRefreshUsers();
  };

  const handleRolePreset = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setStationId('all');
      setStationName('Toàn Chi nhánh VTĐS Nha Trang');
      setDepartment('Ban Giám đốc & Phòng Kế hoạch - Kế toán');
      setCanEditContractContent(true);
      setCanCreateContract(true);
      setCanEditContractDetails(true);
      setCanDeleteContract(true);
      setCanCreateWorker(true);
      setCanEditWorker(true);
      setCanDeleteWorker(true);
      setCanCreateAcceptance(true);
      setCanEditAcceptance(true);
      setCanDeleteAcceptance(true);
      setCanApprovePayment(true);
      setCanDeleteMasterData(true);
      setCanManageAllStations(true);
    } else if (selectedRole === 'station_dieutri') {
      setStationId('dieutri');
      setStationName('Trạm VTĐS Diêu Trì');
      setDepartment('Tổ Tác nghiệp Ga Diêu Trì (Bình Định)');
      setCanEditContractContent(false);
      setCanCreateContract(true);
      setCanEditContractDetails(true);
      setCanDeleteContract(false);
      setCanCreateWorker(true);
      setCanEditWorker(true);
      setCanDeleteWorker(false);
      setCanCreateAcceptance(true);
      setCanEditAcceptance(true);
      setCanDeleteAcceptance(true);
      setCanApprovePayment(false);
      setCanDeleteMasterData(false);
      setCanManageAllStations(false);
    } else if (selectedRole === 'station_tuyhoa') {
      setStationId('tuyhoa');
      setStationName('Trạm VTĐS Tuy Hòa');
      setDepartment('Tổ Tác nghiệp Ga Tuy Hòa (Phú Yên)');
      setCanEditContractContent(false);
      setCanCreateContract(true);
      setCanEditContractDetails(true);
      setCanDeleteContract(false);
      setCanCreateWorker(true);
      setCanEditWorker(true);
      setCanDeleteWorker(false);
      setCanCreateAcceptance(true);
      setCanEditAcceptance(true);
      setCanDeleteAcceptance(true);
      setCanApprovePayment(false);
      setCanDeleteMasterData(false);
      setCanManageAllStations(false);
    } else {
      setStationId('nhatrang');
      setStationName('Trạm VTĐS Nha Trang');
      setDepartment('Tổ Tác nghiệp Ga Nha Trang (Khánh Hòa)');
      setCanEditContractContent(false);
      setCanCreateContract(true);
      setCanEditContractDetails(true);
      setCanDeleteContract(false);
      setCanCreateWorker(true);
      setCanEditWorker(true);
      setCanDeleteWorker(false);
      setCanCreateAcceptance(true);
      setCanEditAcceptance(true);
      setCanDeleteAcceptance(true);
      setCanApprovePayment(false);
      setCanDeleteMasterData(false);
      setCanManageAllStations(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (!isAdmin) {
      alert('Chức năng thêm người dùng mới chỉ dành cho tài khoản Quản trị viên (Admin).');
      return;
    }
    setEditingUser(null);
    setUsername('');
    setPassword('123456');
    setFullName('');
    setEmail('');
    setPhone('');
    setDescription('');
    setError('');
    handleRolePreset('station_nhatrang');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: AppAccount) => {
    if (!isAdmin) {
      alert('Chức năng chỉnh sửa phân quyền chỉ dành cho Quản trị viên (Admin).');
      return;
    }
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.password || '');
    setFullName(user.fullName);
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setRole(user.role);
    setStationId(user.stationId);
    setStationName(user.stationName);
    setDepartment(user.department);
    setDescription(user.description || '');

    setCanEditContractContent(Boolean(user.canEditContractContent));
    setCanCreateContract(user.canCreateContract !== false);
    setCanEditContractDetails(user.canEditContractDetails !== false);
    setCanDeleteContract(Boolean(user.canDeleteContract));
    setCanCreateWorker(user.canCreateWorker !== false);
    setCanEditWorker(user.canEditWorker !== false);
    setCanDeleteWorker(Boolean(user.canDeleteWorker));
    setCanCreateAcceptance(user.canCreateAcceptance !== false);
    setCanEditAcceptance(user.canEditAcceptance !== false);
    setCanDeleteAcceptance(Boolean(user.canDeleteAcceptance));
    setCanApprovePayment(Boolean(user.canApprovePayment));
    setCanDeleteMasterData(Boolean(user.canDeleteMasterData));
    setCanManageAllStations(Boolean(user.canManageAllStations));

    setError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Bạn không có quyền thực hiện thao tác này.');
      return;
    }
    if (!username.trim()) {
      setError('Vui lòng nhập Tên đăng nhập');
      return;
    }
    if (!fullName.trim()) {
      setError('Vui lòng nhập Họ và tên cán bộ');
      return;
    }

    try {
      let badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
      let badgeText = stationName;

      if (role === 'admin') {
        badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
        badgeText = 'Admin Chi nhánh · Full quyền';
      } else if (role === 'station_dieutri') {
        badgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
      } else if (role === 'station_tuyhoa') {
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      }

      const accountData: AppAccount = {
        username: username.trim().toLowerCase(),
        password: password.trim() || '123456',
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        stationId,
        stationName,
        department,
        badgeColor,
        badgeText,
        description: description.trim() || `Tài khoản ${fullName} thuộc ${stationName} - ${department}`,
        status: editingUser ? editingUser.status || 'active' : 'active',
        createdAt: editingUser?.createdAt || new Date().toISOString(),
        
        canEditContractContent,
        canCreateContract,
        canEditContractDetails,
        canDeleteContract,
        canCreateWorker,
        canEditWorker,
        canDeleteWorker,
        canCreateAcceptance,
        canEditAcceptance,
        canDeleteAcceptance,
        canApprovePayment,
        canDeleteMasterData,
        canManageAllStations,
      };

      if (editingUser) {
        updateAppAccount(editingUser.username, accountData);
        setSuccessMessage(`Đã cập nhật tài khoản "${accountData.username}" thành công`);
      } else {
        createAppAccount(accountData);
        setSuccessMessage(`Đã thêm tài khoản mới "${accountData.username}" thành công`);
      }

      loadUserList();
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Có lỗi xảy ra khi lưu người dùng');
      }
    }
  };

  const handleToggleStatus = (user: AppAccount) => {
    if (!isAdmin) {
      alert('Chức năng khóa/mở khóa tài khoản do Admin quản lý.');
      return;
    }
    if (user.username.toLowerCase() === 'admin') {
      alert('Không thể khóa tài khoản Quản trị viên chính!');
      return;
    }
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    updateAppAccount(user.username, { status: newStatus });
    loadUserList();
  };

  const handleDeleteUser = (user: AppAccount) => {
    if (!isAdmin) {
      alert('Chức năng xóa tài khoản do Admin quản lý.');
      return;
    }
    if (user.username.toLowerCase() === 'admin') {
      alert('Không thể xóa tài khoản Quản trị viên chính (admin)!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.username}" (${user.fullName})?`)) {
      try {
        deleteAppAccount(user.username);
        loadUserList();
        setSuccessMessage(`Đã xóa tài khoản "${user.username}"`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err: unknown) {
        if (err instanceof Error) alert(err.message);
      }
    }
  };

  // STATION ACCESS CONTROL: Station account only sees its own account!
  const visibleUsers = isAdmin
    ? users
    : users.filter(u => u.username.toLowerCase() === currentUser?.username?.toLowerCase());

  const filteredUsers = visibleUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      u.username.toLowerCase().includes(term) ||
      u.fullName.toLowerCase().includes(term) ||
      u.department.toLowerCase().includes(term) ||
      u.stationName.toLowerCase().includes(term);

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStation = stationFilter === 'all' || u.stationId === stationFilter;

    return matchSearch && matchRole && matchStation;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isAdmin ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
            }`}>
              {isAdmin ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {isAdmin ? 'Quản Lý Người Dùng & Ma Trận Phân Quyền' : 'Thông Tin Tài Khoản & Quyền Hạn Cấp Trạm'}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isAdmin ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin ? 'Admin Toàn Quyền' : 'Cấp Trạm'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'Quản trị viên Chi nhánh: Có toàn quyền thêm người dùng, phân quyền chi tiết, chỉnh sửa, khóa và xóa tài khoản'
                  : `Tài khoản ${currentUser?.fullName} thuộc ${currentUser?.stationName} (Chức năng thêm, sửa, xóa do Admin quản trị)`}
              </p>
            </div>
          </div>
        </div>

        {/* NÚT THÊM NGƯỜI DÙNG: CHỈ HIỂN THỊ VỚI ADMIN */}
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Người Dùng Mới</span>
          </button>
        )}
      </div>

      {/* Access Notice for Station User */}
      {!isAdmin && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900 leading-relaxed shadow-2xs">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-blue-950">
              Chế độ hiển thị phân quyền Trạm ({currentUser?.stationName}):
            </div>
            <p className="text-blue-800">
              • Bạn đang đăng nhập với tài khoản <strong>@{currentUser?.username}</strong> ({currentUser?.fullName}). Bạn chỉ xem được thông tin và quyền hạn được cấp của đơn vị mình.
            </p>
            <p className="text-blue-800">
              • Các chức năng <strong>Thêm người dùng mới, Sửa quyền hạn, Khóa và Xóa tài khoản</strong> thuộc thẩm quyền bảo mật của <strong>Admin Chi nhánh</strong>.
            </p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tổng số Tài khoản</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">{users.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Cán bộ & Trực ban tác nghiệp</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Quản Trị Viên (Admin)</span>
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-rose-700">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Toàn quyền quản trị & điều khoản</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Trạm Tác Nghiệp</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Train className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
              {users.filter(u => u.role !== 'admin').length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Ga Nha Trang · Tuy Hòa · Diêu Trì</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Đang Hoạt Động</span>
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
              {users.filter(u => u.status !== 'locked').length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sẵn sàng lập & nghiệm thu hợp đồng</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tài khoản đơn vị</span>
            <div className="mt-1 text-lg font-bold text-slate-900">{currentUser?.fullName}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">@{currentUser?.username}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Trạm phụ trách</span>
            <div className="mt-1 text-lg font-bold text-blue-700">{currentUser?.stationName}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">{currentUser?.department}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Trạng thái tài khoản</span>
            <div className="mt-1 flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Đang hoạt động bình thường</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Được phép lập hợp đồng & nghiệm thu</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar (Only shown to Admin or when multiple users exist) */}
      {isAdmin && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên cán bộ, username, ga tác nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-700 focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="station_nhatrang">Trạm Ga Nha Trang</option>
              <option value="station_tuyhoa">Trạm Ga Tuy Hòa</option>
              <option value="station_dieutri">Trạm Ga Diêu Trì</option>
            </select>

            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-medium text-slate-700 focus:ring-1 focus:ring-blue-600"
            >
              <option value="all">Tất cả trạm ga</option>
              <option value="all">Toàn Chi nhánh</option>
              <option value="nhatrang">Ga Nha Trang</option>
              <option value="tuyhoa">Ga Tuy Hòa</option>
              <option value="dieutri">Ga Diêu Trì</option>
            </select>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Cán bộ / Tên đăng nhập</th>
                <th className="py-3.5 px-4">Đơn vị & Phòng ban</th>
                <th className="py-3.5 px-4">Vai trò chính</th>
                <th className="py-3.5 px-4">Quyền hạn đặc thù</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                {isAdmin ? (
                  <th className="py-3.5 px-4 text-right">Thao tác (Admin)</th>
                ) : (
                  <th className="py-3.5 px-4 text-center">Quản trị</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Không tìm thấy tài khoản phù hợp
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isLocked = u.status === 'locked';
                  return (
                    <tr key={u.username} className={`hover:bg-slate-50/60 transition-colors ${isLocked ? 'bg-slate-50 opacity-60' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role === 'admin' ? <Shield className="w-4 h-4" /> : <Train className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{u.fullName}</span>
                              {u.username === currentUser?.username && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-normal">
                                  Tài khoản của bạn
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>@{u.username}</span>
                              {u.phone && <span>• {u.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.stationName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.department}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${u.badgeColor}`}>
                          {u.badgeText}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.canEditContractContent ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                              ⚖️ Sửa Điều khoản HĐ (Admin)
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              🔒 Mẫu chuẩn cố định
                            </span>
                          )}

                          {u.canApprovePayment && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              💰 Duyệt chi
                            </span>
                          )}

                          {u.canCreateContract !== false && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                              📄 Lập HĐ
                            </span>
                          )}

                          {u.canCreateAcceptance !== false && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                              📋 Nghiệm thu
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700">
                            <Lock className="w-3 h-3" />
                            <span>Đã khóa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* ACTION COLUMN: ONLY ADMIN HAS EDIT/LOCK/DELETE CONTROLS */}
                      {isAdmin ? (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin & phân quyền chi tiết (Admin)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={u.username.toLowerCase() === 'admin'}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-30 ${
                                isLocked 
                                  ? 'text-emerald-600 hover:bg-emerald-50' 
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={isLocked ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}
                            >
                              {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.username.toLowerCase() === 'admin'}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer disabled:opacity-30"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Admin quản trị</span>
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THÊM / SỬA NGƯỜI DÙNG & PHÂN QUYỀN (CHỈ DÀNH CHO ADMIN) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {role === 'admin' ? <Shield className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingUser ? `Chỉnh Sửa Quyền Hạn: @${editingUser.username}` : 'Thêm Người Dùng & Thiết Lập Phân Quyền Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thẩm quyền Quản trị viên (Admin) Chi nhánh Vận tải đường sắt Nha Trang
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION 1: THÔNG TIN TÀI KHOẢN */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  <span>1. Thông tin định danh tài khoản</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên đăng nhập (Username) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(editingUser)}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="vd: user_nhatrang, phuong_ketoan..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white disabled:bg-slate-100 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="vd: 123456"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên cán bộ/nhân viên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="vd: Nguyễn Văn Phương"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại liên hệ
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="vd: 0912.345.678"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: VAI TRÒ & ĐƠN VỊ CÔNG TÁC */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>2. Vai trò & Đơn vị công tác</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nhóm quyền vai trò
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRolePreset(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="admin">Quản trị viên Chi nhánh (Admin Toàn Quyền)</option>
                      <option value="station_nhatrang">Trạm VTĐS Nha Trang (Khánh Hòa)</option>
                      <option value="station_tuyhoa">Trạm VTĐS Tuy Hòa (Phú Yên)</option>
                      <option value="station_dieutri">Trạm VTĐS Diêu Trì (Bình Định)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tên Ga / Đơn vị quản lý
                    </label>
                    <input
                      type="text"
                      value={stationName}
                      onChange={(e) => setStationName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phòng ban / Tổ chức phụ trách
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="vd: Tổ Tác nghiệp Hóa vận & Khách Ga Nha Trang"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MA TRẬN PHÂN QUYỀN CHI TIẾT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>3. Ma Trận Phân Quyền Chi Tiết Theo Chức Năng</span>
                  </h4>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">
                    Tùy biến cấp quyền
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  
                  {/* Quyền Sửa Nội Dung Hợp Đồng (CHỈ ADMIN) */}
                  <label className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-colors ${
                    canEditContractContent ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={canEditContractContent}
                      onChange={(e) => setCanEditContractContent(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        ⚖️ Sửa Nội dung & Điều khoản HĐ (Điều 1 - 5)
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Quyền cao cấp nhất: Chỉnh sửa câu từ pháp lý, canh lề WYSIWYG trên mẫu hợp đồng chuẩn.
                      </span>
                    </div>
                  </label>

                  {/* Quyền Duyệt Chi */}
                  <label className={`p-3 rounded-lg border flex items-start gap-2.5 cursor-pointer transition-colors ${
                    canApprovePayment ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={canApprovePayment}
                      onChange={(e) => setCanApprovePayment(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        💰 Phê Duyệt Quyết Toán & Duyệt Chi
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Phê duyệt nghiệm thu cuối cùng và xuất phiếu chi tài chính chi nhánh.
                      </span>
                    </div>
                  </label>

                  {/* Quyền Tạo Hợp Đồng */}
                  <label className="p-3 rounded-lg border bg-white border-slate-200 flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateContract}
                      onChange={(e) => setCanCreateContract(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        📄 Lập Hợp Đồng Giao Khoán Mới
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Chọn người nhận khoán, khai báo đơn giá và lập hợp đồng theo mẫu có sẵn.
                      </span>
                    </div>
                  </label>

                  {/* Quyền Sửa Hợp Đồng */}
                  <label className="p-3 rounded-lg border bg-white border-slate-200 flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canEditContractDetails}
                      onChange={(e) => setCanEditContractDetails(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        ✏️ Chỉnh Sửa Thông Tin Hợp Đồng
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Điều chỉnh ngày ký, thời hạn hiệu lực, đơn giá khoán và ga tác nghiệp.
                      </span>
                    </div>
                  </label>

                  {/* Quyền Lập Nghiệm Thu */}
                  <label className="p-3 rounded-lg border bg-white border-slate-200 flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateAcceptance}
                      onChange={(e) => setCanCreateAcceptance(e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        📋 Lập & Xác Nhận Biên Bản Nghiệm Thu
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Kê khai số lượng toa xe xịt rửa / tấn hàng bốc xếp theo đợt thanh toán.
                      </span>
                    </div>
                  </label>

                  {/* Quyền Quản Lý Lao Động */}
                  <label className="p-3 rounded-lg border bg-white border-slate-200 flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canCreateWorker}
                      onChange={(e) => setCanCreateWorker(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        👤 Quản Lý Danh Bạ Người Nhận Khoán
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Tạo mới, chỉnh sửa thông tin CCCD, thuế TNCN, ngân sách giao.
                      </span>
                    </div>
                  </label>

                  {/* Quyền Quản Trị Hệ Thống */}
                  <label className="p-3 rounded-lg border bg-white border-slate-200 flex items-start gap-2.5 cursor-pointer sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={canManageAllStations}
                      onChange={(e) => setCanManageAllStations(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        🌐 Quản Trị Toàn Mạng Lưới & Người Dùng Hệ Thống
                      </span>
                      <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                        Xem dữ liệu liên trạm, quản lý danh sách tài khoản và phân quyền người dùng.
                      </span>
                    </div>
                  </label>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Lưu Thay Đổi Phân Quyền' : 'Tạo Tài Khoản Người Dùng'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
