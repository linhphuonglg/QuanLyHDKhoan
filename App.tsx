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

import { Contract, WorkerContractor, AcceptanceReport, UserRole } from './types';
import { loadData, saveData, resetToDefaultData } from './services/storage';
import { exportBudgetSummaryToExcel, exportAcceptancesToExcel } from './services/exportExcel';
import { getStoredUserRole, saveUserRole, getUserRoleProfile } from './services/authRoles';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const [workers, setWorkers] = useState<WorkerContractor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [acceptances, setAcceptances] = useState<AcceptanceReport[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('contracts');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => getStoredUserRole());

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    saveUserRole(role);
  };

  // Document inspection state
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  // Modal states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);

  const [isAcceptanceModalOpen, setIsAcceptanceModalOpen] = useState(false);
  const [acceptanceToEdit, setAcceptanceToEdit] = useState<AcceptanceReport | null>(null);
  const [acceptanceInitialContract, setAcceptanceInitialContract] = useState<Contract | null>(null);

  const [selectedAuditContractId, setSelectedAuditContractId] = useState<string>('');

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
    setIsContractModalOpen(true);
  };

  const handleOpenEditContract = (c: Contract) => {
    setContractToEdit(c);
    setIsContractModalOpen(true);
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
    if (window.confirm('Khôi phục dữ liệu mẫu ban đầu của Chi nhánh Vận tải đường sắt Nha Trang?')) {
      const reset = resetToDefaultData();
      setWorkers(reset.workers);
      setContracts(reset.contracts);
      setAcceptances(reset.acceptances);
      setViewingContract(null);
    }
  };

  // Worker lookup for currently viewed contract
  const viewingContractWorker = viewingContract 
    ? workers.find(w => w.id === viewingContract.workerId)
    : null;
  const viewingContractAcceptances = viewingContract
    ? acceptances.filter(a => a.contractId === viewingContract.id)
    : [];

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
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If viewing a contract document in official A4 format */}
        {viewingContract && viewingContractWorker ? (
          <ContractDocumentView
            contract={viewingContract}
            worker={viewingContractWorker}
            acceptances={viewingContractAcceptances}
            onBack={() => setViewingContract(null)}
            onEdit={() => handleOpenEditContract(viewingContract)}
            onCheckLegal={() => handleCheckLegalForContract(viewingContract.id)}
            currentRole={currentRole}
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
    </div>
  );
}
