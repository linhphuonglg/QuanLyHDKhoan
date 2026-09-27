import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { ContractList } from './components/ContractList';
import { ContractDocumentView } from './components/ContractDocumentView';
import { ContractEditorModal } from './components/ContractEditorModal';
import { AcceptanceManagement } from './components/AcceptanceManagement';
import { AcceptanceEditorModal } from './components/AcceptanceEditorModal';
import { BudgetCharts } from './components/BudgetCharts';
import { WorkerDirectory } from './components/WorkerDirectory';
import { LegalHrConsultant } from './components/LegalHrConsultant';
import { GoogleSheetDesignView } from './components/GoogleSheetDesignView';
import { UserManagementView } from './components/UserManagementView';
import { LoginForm } from './components/LoginForm';

import { Contract, WorkerContractor, AcceptanceReport, UserRole, AppAccount } from './types';
import { loadData, saveData, resetToDefaultData } from './services/storage';
import { exportBudgetSummaryToExcel, exportAcceptancesToExcel } from './services/exportExcel';
import { getStoredUserRole, saveUserRole, getUserRoleProfile, getStoredUser, logoutUser, APP_ACCOUNTS_LIST } from './services/authRoles';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppAccount | null>(() => getStoredUser());
  const [workers, setWorkers] = useState<WorkerContractor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [acceptances, setAcceptances] = useState<AcceptanceReport[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('contracts');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const user = getStoredUser();
    return user ? user.role : getStoredUserRole();
  });

  const handleLoginSuccess = (account: AppAccount) => {
    setCurrentUser(account);
    setCurrentRole(account.role);
    saveUserRole(account.role);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    saveUserRole(role);
    const matchedAccount = APP_ACCOUNTS_LIST.find(a => a.role === role);
    if (matchedAccount) {
      setCurrentUser(matchedAccount);
    }
  };

  // Document inspection state
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  // Modal states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [contractModalInitialTab, setContractModalInitialTab] = useState<'basic' | 'clauses' | 'safety' | 'preview'>('basic');
  const [contractModalFocusClause, setContractModalFocusClause] = useState<number | undefined>(undefined);

  const [isAcceptanceModalOpen, setIsAcceptanceModalOpen] = useState(false);
  const [acceptanceToEdit, setAcceptanceToEdit] = useState<AcceptanceReport | null>(null);
  const [acceptanceInitialContract, setAcceptanceInitialContract] = useState<Contract | null>(null);

  const [selectedAuditContractId, setSelectedAuditContractId] = useState<string>('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const data = loadData();
    setWorkers(data.workers);
    setContracts(data.contracts);
    setAcceptances(data.acceptances);
  }, []);

  // Save changes to localStorage whenever data changes
  const updateData = (
    newContracts: Contract[],
    newWorkers: WorkerContractor[],
    newAcceptances: AcceptanceReport[]
  ) => {
    setContracts(newContracts);
    setWorkers(newWorkers);
    setAcceptances(newAcceptances);
    saveData({
      contracts: newContracts,
      workers: newWorkers,
      acceptances: newAcceptances,
    });
  };

  // Contract Handlers
  const handleSaveContract = (contract: Contract) => {
    const exists = contracts.some(c => c.id === contract.id);
    let updated: Contract[];
    if (exists) {
      updated = contracts.map(c => c.id === contract.id ? contract : c);
    } else {
      updated = [contract, ...contracts];
    }
    updateData(updated, workers, acceptances);
    if (viewingContract?.id === contract.id) {
      setViewingContract(contract);
    }
  };

  const handleOpenCreateContract = () => {
    setContractToEdit(null);
    setContractModalInitialTab('basic');
    setContractModalFocusClause(undefined);
    setIsContractModalOpen(true);
  };

  const handleOpenEditContract = (c: Contract, tab: 'basic' | 'clauses' | 'safety' | 'preview' = 'basic', clause?: number) => {
    setContractToEdit(c);
    setContractModalInitialTab(tab);
    setContractModalFocusClause(clause);
    setIsContractModalOpen(true);
  };

  const handleDeleteContract = (contractId: string) => {
    const updatedContracts = contracts.filter(c => c.id !== contractId);
    const updatedAcceptances = acceptances.filter(a => a.contractId !== contractId);
    updateData(updatedContracts, workers, updatedAcceptances);
    if (viewingContract?.id === contractId) {
      setViewingContract(null);
    }
  };

  // Acceptance Handlers
  const handleSaveAcceptance = (report: AcceptanceReport) => {
    const exists = acceptances.some(a => a.id === report.id);
    let updated: AcceptanceReport[];
    if (exists) {
      updated = acceptances.map(a => a.id === report.id ? report : a);
    } else {
      updated = [report, ...acceptances];
    }
    updateData(contracts, workers, updated);
  };

  const handleOpenCreateAcceptance = (forContract?: Contract) => {
    setAcceptanceToEdit(null);
    setAcceptanceInitialContract(forContract || null);
    setIsAcceptanceModalOpen(true);
  };

  const handleOpenEditAcceptance = (report: AcceptanceReport) => {
    setAcceptanceToEdit(report);
    setAcceptanceInitialContract(null);
    setIsAcceptanceModalOpen(true);
  };

  const handleTogglePaymentStatus = (reportId: string) => {
    const updated = acceptances.map(r => {
      if (r.id === reportId) {
        let newStatus: AcceptanceReport['paymentStatus'] = 'approved';
        if (r.paymentStatus === 'approved') newStatus = 'paid';
        else if (r.paymentStatus === 'paid') newStatus = 'pending';
        return {
          ...r,
          paymentStatus: newStatus,
          paymentDate: newStatus === 'paid' ? (r.paymentDate || new Date().toISOString().split('T')[0]) : r.paymentDate,
          paymentReference: newStatus === 'paid' ? (r.paymentReference || `UNC-DS-${Date.now().toString().slice(-6)}`) : r.paymentReference,
        };
      }
      return r;
    });
    updateData(contracts, workers, updated);
  };

  // Worker Handlers
  const handleSaveWorker = (worker: WorkerContractor) => {
    const exists = workers.some(w => w.id === worker.id);
    let updated: WorkerContractor[];
    if (exists) {
      updated = workers.map(w => w.id === worker.id ? worker : w);
    } else {
      updated = [worker, ...workers];
    }
    updateData(contracts, updated, acceptances);
  };

  const handleDeleteWorker = (workerId: string) => {
    const updated = workers.filter(w => w.id !== workerId);
    updateData(contracts, updated, acceptances);
  };

  // Navigation & Export
  const handleSelectContract = (contract: Contract) => {
    setViewingContract(contract);
  };

  const handleCheckLegalForContract = (contractId: string) => {
    setSelectedAuditContractId(contractId);
    setViewingContract(null);
    setActiveTab('legal');
  };

  const handleSelectWorkerFromBudget = (workerId: string) => {
    setActiveTab('workers');
  };

  const handleQuickExportExcel = () => {
    exportAcceptancesToExcel(acceptances, contracts, workers);
  };

  const handleResetSampleData = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    const reset = resetToDefaultData();
    setWorkers(reset.workers);
    setContracts(reset.contracts);
    setAcceptances(reset.acceptances);
    setViewingContract(null);
    setIsResetConfirmOpen(false);
  };

  // Worker lookup for currently viewed contract
  const viewingContractWorker = viewingContract 
    ? workers.find(w => w.id === viewingContract.workerId)
    : null;
  const viewingContractAcceptances = viewingContract
    ? acceptances.filter(a => a.contractId === viewingContract.id)
    : [];

  // If user is not logged in, show authentication form with role profiles
  if (!currentUser) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Primary Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setViewingContract(null);
        }}
        onNewContract={handleOpenCreateContract}
        onExportExcel={handleQuickExportExcel}
        currentRole={currentRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl xl:max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If viewing a contract document in official A4 format */}
        {viewingContract && viewingContractWorker ? (
          <ContractDocumentView
            contract={viewingContract}
            worker={viewingContractWorker}
            acceptances={viewingContractAcceptances}
            onBack={() => setViewingContract(null)}
            onEdit={(tab = 'clauses', clause) => handleOpenEditContract(viewingContract, tab, clause)}
            onCheckLegal={() => handleCheckLegalForContract(viewingContract.id)}
            currentRole={currentRole}
            onUpdateContract={handleSaveContract}
            onDeleteContract={handleDeleteContract}
          />
        ) : (
          <>
            {activeTab === 'contracts' && (
              <ContractList
                contracts={contracts}
                workers={workers}
                acceptances={acceptances}
                onSelectContract={handleSelectContract}
                onNewContract={handleOpenCreateContract}
                onEditContract={handleOpenEditContract}
                onDeleteContract={handleDeleteContract}
                onNewAcceptanceForContract={(c) => handleOpenCreateAcceptance(c)}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'acceptances' && (
              <AcceptanceManagement
                acceptances={acceptances}
                contracts={contracts}
                workers={workers}
                onNewAcceptance={() => handleOpenCreateAcceptance()}
                onEditAcceptance={handleOpenEditAcceptance}
                onViewContractDoc={(c) => setViewingContract(c)}
                onToggleStatus={handleTogglePaymentStatus}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetCharts
                workers={workers}
                contracts={contracts}
                acceptances={acceptances}
                onSelectWorker={handleSelectWorkerFromBudget}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'workers' && (
              <WorkerDirectory
                workers={workers}
                onSaveWorker={handleSaveWorker}
                onDeleteWorker={handleDeleteWorker}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'legal' && (
              <LegalHrConsultant
                contracts={contracts}
                workers={workers}
                acceptances={acceptances}
                selectedContractId={selectedAuditContractId}
              />
            )}

            {activeTab === 'googlesheets' && (
              <GoogleSheetDesignView
                contracts={contracts}
                workers={workers}
                acceptances={acceptances}
              />
            )}

            {activeTab === 'users' && (
              <UserManagementView
                currentUser={currentUser}
                onRefreshUsers={() => {
                  const refreshed = getStoredUser();
                  if (refreshed) {
                    setCurrentUser(refreshed);
                    setCurrentRole(refreshed.role);
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer (hidden during printing) */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Chi nhánh Vận tải đường sắt Nha Trang</span>
            <span>· Hệ thống Quản lý Hợp đồng Giao khoán & Ngân sách Lao động</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono">Bộ luật Dân sự 2015 · Luật BHXH 2024 · NĐ 253/2026/NĐ-CP</span>
            <button
              onClick={handleResetSampleData}
              title="Khôi phục dữ liệu mẫu gốc"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Dữ liệu mẫu</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContractEditorModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSave={handleSaveContract}
        workers={workers}
        contractToEdit={contractToEdit}
        currentRole={currentRole}
        initialTab={contractModalInitialTab}
        focusClause={contractModalFocusClause}
      />

      <AcceptanceEditorModal
        isOpen={isAcceptanceModalOpen}
        onClose={() => setIsAcceptanceModalOpen(false)}
        onSave={handleSaveAcceptance}
        contracts={contracts}
        workers={workers}
        initialContract={acceptanceInitialContract}
        reportToEdit={acceptanceToEdit}
        currentRole={currentRole}
      />

      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Xác nhận khôi phục dữ liệu mẫu</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu của Chi nhánh Vận tải đường sắt Nha Trang? Toàn bộ các thay đổi cục bộ sẽ được hoàn tác về dữ liệu chuẩn.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
              >
                Khôi phục dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
