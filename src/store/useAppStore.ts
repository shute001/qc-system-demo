import { create } from 'zustand';

export type Role = 'Admin' | 'M1' | 'M2' | 'Staff';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar: string;
    lineManagerId?: string;
    department?: string;
    processes?: string[]; // Array of process IDs assigned to this user
}

export interface Process {
    id: string;
    code: string; // e.g., "COLLECTION-CNSH-001"
    name: string; // e.g., "Collection China Shanghai Branch"
    country: string; // e.g., "CN", "US", "SG"
    region: string; // e.g., "SH", "BJ", "NY"
    businessLine: string; // e.g., "COLLECTION", "SALES", "CS"
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export interface RoleDefinition {
    id: string;
    roleKey: Role; // 'Admin' | 'M1' | 'M2' | 'Staff'
    roleName: string;
    description: string;
    permissions: string[]; // Array of page/route keys
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export interface PagePermission {
    key: string; // Route key
    name: string; // Display name
    path: string; // Route path
    category: 'QC' | 'Team' | 'Development' | 'Analytics' | 'System';
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
    processId?: string; // Associated process ID for case filtering

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
    processList: Process[]; // Process list
    roleDefinitions: RoleDefinition[]; // Role definitions with permissions
    pagePermissions: PagePermission[]; // Available pages for permission assignment

    // Actions
    addQCRecord: (record: QCRecord) => void;
    updateQCRecord: (id: string, updates: Partial<QCRecord>) => void;
    addDevPlan: (plan: DevPlan) => void;
    updateDevPlan: (id: string, updates: Partial<DevPlan>) => void;
    addLeaderLog: (log: LeaderLog) => void;
    updateSamplingRules: (rules: SamplingRule[]) => void;
    addStaff: (user: User) => void;
    updateStaff: (id: string, updates: Partial<User>) => void;

    // Process Actions
    addProcess: (process: Process) => void;
    updateProcess: (id: string, updates: Partial<Process>) => void;
    deleteProcess: (id: string) => void;

    // Role Actions
    addRole: (role: RoleDefinition) => void;
    updateRole: (id: string, updates: Partial<RoleDefinition>) => void;
    deleteRole: (id: string) => void;

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

const initialRules: SamplingRule[] = [
    { department: 'CS', qcType: 'Data', percentage: 10, minCount: 5 },
    { department: 'CS', qcType: 'Call', percentage: 5, minCount: 3 },
];

const initialProcesses: Process[] = [
    {
        id: 'PROC-001',
        code: 'COLLECTION-CNSH-001',
        name: 'Collection China Shanghai Branch',
        country: 'CN',
        region: 'SH',
        businessLine: 'COLLECTION',
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'PROC-002',
        code: 'COLLECTION-CNBJ-001',
        name: 'Collection China Beijing Branch',
        country: 'CN',
        region: 'BJ',
        businessLine: 'COLLECTION',
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'PROC-003',
        code: 'SALES-SGSG-001',
        name: 'Sales Singapore Branch',
        country: 'SG',
        region: 'SG',
        businessLine: 'SALES',
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'PROC-004',
        code: 'CS-USNY-001',
        name: 'Customer Service US New York',
        country: 'US',
        region: 'NY',
        businessLine: 'CS',
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    }
];

// Page Permissions - All available pages in the system
const initialPagePermissions: PagePermission[] = [
    // Analytics
    { key: 'dashboard', name: 'Dashboard', path: '/dashboard', category: 'Analytics' },
    { key: 'workspace', name: 'My Workspace', path: '/workspace', category: 'Analytics' },
    { key: 'analytics', name: 'Analytics Dashboard', path: '/analytics', category: 'Analytics' },

    // QC Management
    { key: 'qc-sampling', name: 'QC Sampling', path: '/qc-module/sampling', category: 'QC' },
    { key: 'qc-inbox', name: 'QC Inbox', path: '/qc-module/qc-inbox', category: 'QC' },
    { key: 'qc-drafts', name: 'QC Drafts', path: '/qc-module/drafts', category: 'QC' },
    { key: 'qc-outbox', name: 'QC Outbox', path: '/qc-module/outbox', category: 'QC' },
    { key: 'qc-dispute', name: 'Dispute Resolution', path: '/qc-module/dispute', category: 'QC' },
    { key: 'qc-history', name: 'QC History', path: '/qc-module/history', category: 'QC' },

    // Team Management
    { key: 'team-management', name: 'Team Management', path: '/team-management', category: 'Team' },

    // Development
    { key: 'dev-plan', name: 'Development Plan', path: '/dev-plan', category: 'Development' },
    { key: 'leader-log', name: 'Leader Log', path: '/leader-log', category: 'Development' },
];

// Role Definitions with permissions
const initialRoleDefinitions: RoleDefinition[] = [
    {
        id: 'ROLE-001',
        roleKey: 'Admin',
        roleName: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: initialPagePermissions.map(p => p.key), // All permissions
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'ROLE-002',
        roleKey: 'M1',
        roleName: 'Manager Level 1',
        description: 'Approvals & QC Manager with team oversight',
        permissions: ['dashboard', 'workspace', 'analytics', 'qc-sampling', 'qc-inbox', 'qc-outbox', 'qc-dispute', 'qc-history', 'dev-plan', 'leader-log'],
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'ROLE-003',
        roleKey: 'M2',
        roleName: 'Manager Level 2',
        description: 'Senior QC Manager with extended permissions',
        permissions: ['dashboard', 'workspace', 'analytics', 'qc-sampling', 'qc-inbox', 'qc-outbox', 'qc-dispute', 'qc-history', 'team-management', 'dev-plan', 'leader-log'],
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'ROLE-004',
        roleKey: 'Staff',
        roleName: 'Standard Staff',
        description: 'Basic QC staff with limited permissions',
        permissions: ['dashboard', 'workspace', 'qc-inbox', 'qc-dispute', 'dev-plan'],
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    }
];

// Update QC records to include process IDs
const processIds = initialProcesses.map(p => p.id);
const initialQCRecords: QCRecord[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `qc-${i}`,
    caseId: `CS-${2023001 + i}`,
    agentId: i % 2 === 0 ? 'u1' : 'u2',
    agentName: i % 2 === 0 ? 'Alice Staff' : 'Bob Staff',
    qcType: i % 2 === 0 ? 'Data' : 'Call',
    type: ['Inquiry', 'Complaint', 'Technical Support'][i % 3],
    date: '2023-10-26',
    status: 'Pending QC',
    processId: processIds[i % processIds.length], // Randomly assign processes
}));

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
    processList: initialProcesses,
    roleDefinitions: initialRoleDefinitions,
    pagePermissions: initialPagePermissions,

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
    updateStaff: (id, updates) => set((state) => ({
        staffList: state.staffList.map(u => u.id === id ? { ...u, ...updates } : u)
    })),

    // Process Actions
    addProcess: (process) => set((state) => ({ processList: [...state.processList, process] })),
    updateProcess: (id, updates) => set((state) => ({
        processList: state.processList.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    deleteProcess: (id) => set((state) => ({
        processList: state.processList.filter(p => p.id !== id)
    })),

    // Role Actions
    addRole: (role) => set((state) => ({ roleDefinitions: [...state.roleDefinitions, role] })),
    updateRole: (id, updates) => set((state) => ({
        roleDefinitions: state.roleDefinitions.map(r => r.id === id ? { ...r, ...updates } : r)
    })),
    deleteRole: (id) => set((state) => ({
        roleDefinitions: state.roleDefinitions.filter(r => r.id !== id)
    })),

    currentView: 'workspace',
    activeQCRecordId: null,
    setView: (view) => set({ currentView: view }),
    setActiveQCRecord: (id) => set({ activeQCRecordId: id }),
}));
