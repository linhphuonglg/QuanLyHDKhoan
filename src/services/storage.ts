import { WorkerContractor, Contract, AcceptanceReport } from '../types';
import { INITIAL_WORKERS, INITIAL_CONTRACTS, INITIAL_ACCEPTANCE_REPORTS } from '../data/mockData';

const WORKERS_KEY = 'nhatrang_railway_workers_v1';
const CONTRACTS_KEY = 'nhatrang_railway_contracts_v1';
const ACCEPTANCE_KEY = 'nhatrang_railway_acceptances_v1';

export const storageService = {
  getWorkers(): WorkerContractor[] {
    try {
      const data = localStorage.getItem(WORKERS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read workers from storage', e);
    }
    this.saveWorkers(INITIAL_WORKERS);
    return INITIAL_WORKERS;
  },

  saveWorkers(workers: WorkerContractor[]): void {
    try {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
    } catch (e) {
      console.error('Failed to save workers to storage', e);
    }
  },

  getContracts(): Contract[] {
    try {
      const data = localStorage.getItem(CONTRACTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read contracts from storage', e);
    }
    this.saveContracts(INITIAL_CONTRACTS);
    return INITIAL_CONTRACTS;
  },

  saveContracts(contracts: Contract[]): void {
    try {
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
    } catch (e) {
      console.error('Failed to save contracts to storage', e);
    }
  },

  getAcceptances(): AcceptanceReport[] {
    try {
      const data = localStorage.getItem(ACCEPTANCE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read acceptances from storage', e);
    }
    this.saveAcceptances(INITIAL_ACCEPTANCE_REPORTS);
    return INITIAL_ACCEPTANCE_REPORTS;
  },

  saveAcceptances(acceptances: AcceptanceReport[]): void {
    try {
      localStorage.setItem(ACCEPTANCE_KEY, JSON.stringify(acceptances));
    } catch (e) {
      console.error('Failed to save acceptances to storage', e);
    }
  },

  resetAllData(): void {
    try {
      localStorage.setItem(WORKERS_KEY, JSON.stringify(INITIAL_WORKERS));
      localStorage.setItem(CONTRACTS_KEY, JSON.stringify(INITIAL_CONTRACTS));
      localStorage.setItem(ACCEPTANCE_KEY, JSON.stringify(INITIAL_ACCEPTANCE_REPORTS));
    } catch (e) {
      console.error('Failed to reset storage', e);
    }
  },

  exportBackupJson(): string {
    const backup = {
      workers: this.getWorkers(),
      contracts: this.getContracts(),
      acceptances: this.getAcceptances(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.workers) && Array.isArray(parsed.contracts) && Array.isArray(parsed.acceptances)) {
        this.saveWorkers(parsed.workers);
        this.saveContracts(parsed.contracts);
        this.saveAcceptances(parsed.acceptances);
        return true;
      }
    } catch (e) {
      console.error('Invalid backup file', e);
    }
    return false;
  }
};

export function loadData() {
  return {
    workers: storageService.getWorkers(),
    contracts: storageService.getContracts(),
    acceptances: storageService.getAcceptances(),
  };
}

export function saveData(data: {
  workers: WorkerContractor[];
  contracts: Contract[];
  acceptances: AcceptanceReport[];
}) {
  storageService.saveWorkers(data.workers);
  storageService.saveContracts(data.contracts);
  storageService.saveAcceptances(data.acceptances);
}

export function resetToDefaultData() {
  storageService.resetAllData();
  return {
    workers: INITIAL_WORKERS,
    contracts: INITIAL_CONTRACTS,
    acceptances: INITIAL_ACCEPTANCE_REPORTS,
  };
}
