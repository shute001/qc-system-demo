import { create } from 'zustand';

export type Role = 'Admin' | 'M1' | 'M2' | 'Staff';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar: string;
    lineManagerId?: string;
    department?: string;
}

export interface SamplingRule {
    department: string;
    qcType: 'Data' | 'Call';
    percentage: number; // 0-100
    minCount: number;
}

export interface QCRecord {
    id: string;
    caseId: string;
    agentId: string;
    agentName: string;
    qcType: 'Data' | 'Call'; // Added
    type: string;
    date: string;
    status: 'Pending QC' | 'Draft' | 'In Progress' | 'Wait Staff Confirm' | 'Dispute' | 'Completed';

    // M1 QC Data
    checkingTime?: string;
    hasError?: boolean;
    errorType?: string; // Critical, Non-Critical, Fatal
    m1Comments?: string;

    // Results
    score?: number;
    result?: 'Pass' | 'Fail';
    outcome?: string[];
    remediation?: string[];

    // Staff Confirm
    staffComments?: string;
    disputeReason?: string;
}

export interface DevPlan {
    id: string;
    staffId: string;
    staffName: string;
    month: string;
    objectives: string;
    keyResults: string;
    status: 'Draft' | 'Submitted' | 'Evaluated' | 'Confirmed';
    managerComments?: string;
    rating?: number;
}

export interface LeaderLog {
    id: string;
    date: string;
    attendees: string[];
    topic: string;
    content: string;
    actionItems: string;
}

interface AppState {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    switchRole: (role: Role) => void;

    // Data Stores (Mock DB)
    staffList: User[];
    samplingRules: SamplingRule[];
    qcRecords: QCRecord[];
    devPlans: DevPlan[];
    leaderLogs: LeaderLog[];

    // Actions
    addQCRecord: (record: QCRecord) => void;
    updateQCRecord: (id: string, updates: Partial<QCRecord>) => void;
    addDevPlan: (plan: DevPlan) => void;
    updateDevPlan: (id: string, updates: Partial<DevPlan>) => void;
    addLeaderLog: (log: LeaderLog) => void;
    updateSamplingRules: (rules: SamplingRule[]) => void;
    addStaff: (user: User) => void;

    // UI State
    currentView: string;
    activeQCRecordId: string | null;
    setView: (view: string) => void;
    setActiveQCRecord: (id: string | null) => void;
}

// Mock Initial Data
const initialStaff: User[] = [
    { id: 'u1', name: 'Alice Staff', role: 'Staff', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', department: 'CS', lineManagerId: 'm1' },
    { id: 'u2', name: 'Bob Staff', role: 'Staff', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', department: 'CS', lineManagerId: 'm1' },
    { id: 'm1', name: 'Mike Manager (M1)', role: 'M1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', department: 'CS', lineManagerId: 'm2' },
    { id: 'm2', name: 'Sarah Director (M2)', role: 'M2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', department: 'CS' },
    { id: 'admin', name: 'Admin User', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', department: 'IT' },
];

const initialQCRecords: QCRecord[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `qc-${i}`,
    caseId: `CS-${2023001 + i}`,
    agentId: i % 2 === 0 ? 'u1' : 'u2',
    agentName: i % 2 === 0 ? 'Alice Staff' : 'Bob Staff',
    qcType: i % 2 === 0 ? 'Data' : 'Call',
    type: ['Inquiry', 'Complaint', 'Technical Support'][i % 3],
    date: '2023-10-26',
    status: 'Pending QC',
}));

const initialRules: SamplingRule[] = [
    { department: 'CS', qcType: 'Data', percentage: 10, minCount: 5 },
    { department: 'CS', qcType: 'Call', percentage: 5, minCount: 3 },
];

export const useAppStore = create<AppState>((set) => ({
    currentUser: initialStaff[4], // Default Admin
    setCurrentUser: (user) => set({ currentUser: user }),
    switchRole: (role) =>
        set((state) => {
            // Find a mock user for the requested role or update current
            const mockUser = initialStaff.find(u => u.role === role) || { ...state.currentUser, role };
            return { currentUser: mockUser };
        }),

    staffList: initialStaff,
    samplingRules: initialRules,
    qcRecords: initialQCRecords,
    devPlans: [],
    leaderLogs: [],

    addQCRecord: (record) => set((state) => ({ qcRecords: [...state.qcRecords, record] })),
    updateQCRecord: (id, updates) => set((state) => ({
        qcRecords: state.qcRecords.map(r => r.id === id ? { ...r, ...updates } : r)
    })),
    addDevPlan: (plan) => set((state) => ({ devPlans: [...state.devPlans, plan] })),
    updateDevPlan: (id, updates) => set((state) => ({
        devPlans: state.devPlans.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    addLeaderLog: (log) => set((state) => ({ leaderLogs: [...state.leaderLogs, log] })),
    updateSamplingRules: (rules) => set({ samplingRules: rules }),
    addStaff: (user) => set((state) => ({ staffList: [...state.staffList, user] })),

    currentView: 'workspace',
    activeQCRecordId: null,
    setView: (view) => set({ currentView: view }),
    setActiveQCRecord: (id) => set({ activeQCRecordId: id }),
}));
