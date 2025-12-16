import { create } from 'zustand';

export type Role = 'Admin' | 'M1' | 'M2' | 'Staff';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar: string;
    lineManagerId?: string;
    processes?: string[]; // Array of process IDs assigned to this user
}

export interface Process {
    id: string;
    procCode: string; // e.g. "businessCode -- procAid -- procName"
    procAid: string; // e.g. "NHI25"
    procName: string; // e.g. "Collections Onshore"
    businessId: string; // e.g. "COLLECTION"
    qltyTarget: number; // e.g. 95
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export interface SysMenu {
    menuId: number;
    menuName: string;
    parentId: number;
    orderNum: number;
    path: string;
    component?: string;
    menuType: 'D' | 'C' | 'F'; // Directory, Component, Function
    perms?: string;
    icon?: string;
    visible: number; // 1 or 0
    children?: SysMenu[];
}

export interface RoleDefinition {
    id: string;
    roleKey: string; // Changed from enum to string to support dynamic roles
    roleName: string;
    description: string;
    menuIds: number[]; // Changed from permissions string[] to menuId[]
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export interface SamplingRule {
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

    // We will use a flat list of menus for storage, but build tree for UI
    menuList: SysMenu[];

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
    { id: 'u1', name: 'Alice Staff', role: 'Staff', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', lineManagerId: 'm1' },
    { id: 'u2', name: 'Bob Staff', role: 'Staff', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', lineManagerId: 'm1' },
    { id: 'm1', name: 'Mike Manager (M1)', role: 'M1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', lineManagerId: 'm2' },
    { id: 'm2', name: 'Sarah Director (M2)', role: 'M2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 'admin', name: 'Admin User', role: 'Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
];

const initialRules: SamplingRule[] = [
    { qcType: 'Data', percentage: 10, minCount: 5 },
    { qcType: 'Call', percentage: 5, minCount: 3 },
];

const initialProcesses: Process[] = [
    {
        id: 'PROC-001',
        procCode: 'COL -- NHI25 -- Collection China Shanghai Branch',
        procAid: 'NHI25',
        procName: 'Collection China Shanghai Branch',
        businessId: 'COLLECTION', // Using mock business ID/Code
        qltyTarget: 95,
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'PROC-002',
        procCode: 'COL -- NHI26 -- Collection China Beijing Branch',
        procAid: 'NHI26',
        procName: 'Collection China Beijing Branch',
        businessId: 'COLLECTION',
        qltyTarget: 95,
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'PROC-003',
        procCode: 'SALES -- SGS01 -- Sales Singapore Branch',
        procAid: 'SGS01',
        procName: 'Sales Singapore Branch',
        businessId: 'SALES',
        qltyTarget: 90,
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'PROC-004',
        procCode: 'CS -- CSUSA -- Customer Service US New York',
        procAid: 'CSUSA',
        procName: 'Customer Service US New York',
        businessId: 'CS',
        qltyTarget: 98,
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    }
];

// Initial Menus (Matching Design Doc concepts, flat list for easy storage/lookup)
const initialMenus: SysMenu[] = [
    { menuId: 1, menuName: 'Dashboard', parentId: 0, orderNum: 1, path: '/dashboard', component: 'Dashboard', menuType: 'C', icon: 'DashboardOutlined', visible: 1 },
    { menuId: 2, menuName: 'My Workspace', parentId: 0, orderNum: 2, path: '/workspace', component: 'Workspace', menuType: 'C', icon: 'DesktopOutlined', visible: 1 },
    { menuId: 3, menuName: 'Analytics', parentId: 0, orderNum: 3, path: '/analytics', component: 'AnalyticsDashboard', menuType: 'C', icon: 'BarChartOutlined', visible: 1 },

    // QC Module
    { menuId: 10, menuName: 'QC Management', parentId: 0, orderNum: 4, path: '/qc-module', menuType: 'D', icon: 'FileProtectOutlined', visible: 1 },
    { menuId: 11, menuName: 'Sampling', parentId: 10, orderNum: 1, path: 'sampling', component: 'qc/Sampling', menuType: 'C', perms: 'qc:sampling:list', visible: 1 },
    { menuId: 12, menuName: 'Inbox (To QC)', parentId: 10, orderNum: 2, path: 'qc-inbox', component: 'qc/SamplingPage', menuType: 'C', perms: 'qc:inbox:list', visible: 1 },
    { menuId: 13, menuName: 'Drafts', parentId: 10, orderNum: 3, path: 'drafts', component: 'qc/Drafts', menuType: 'C', visible: 1 },
    { menuId: 14, menuName: 'Outbox', parentId: 10, orderNum: 4, path: 'outbox', component: 'qc/Outbox', menuType: 'C', visible: 1 },
    { menuId: 15, menuName: 'Dispute Resolution', parentId: 10, orderNum: 5, path: 'dispute', component: 'qc/DisputeResolution', menuType: 'C', visible: 1 },
    { menuId: 16, menuName: 'History', parentId: 10, orderNum: 6, path: 'history', component: 'qc/History', menuType: 'C', visible: 1 },

    // Team Management
    { menuId: 20, menuName: 'Team Management', parentId: 0, orderNum: 5, path: '/team-management', component: 'TeamManagement', menuType: 'C', icon: 'TeamOutlined', visible: 1 },

    // Development Plan
    { menuId: 30, menuName: 'Development Plan', parentId: 0, orderNum: 6, path: '/dev-plan', component: 'DevPlanPage', menuType: 'C', icon: 'RocketOutlined', visible: 1 },
    { menuId: 31, menuName: 'Leader Log', parentId: 0, orderNum: 7, path: '/leader-log', component: 'LeaderLogPage', menuType: 'C', icon: 'ReadOutlined', visible: 1 },
];


// Role Definitions with menu IDs
const initialRoleDefinitions: RoleDefinition[] = [
    {
        id: 'ROLE-001',
        roleKey: 'Admin',
        roleName: 'Administrator',
        description: 'Full system access with all permissions',
        menuIds: initialMenus.map(m => m.menuId), // All menus
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'ROLE-002',
        roleKey: 'M1',
        roleName: 'Manager Level 1',
        description: 'Approvals & QC Manager with team oversight',
        // Example: Dashboard, Workspace, Analytics, QC Module (all), Dev Plan, Leader Log
        menuIds: [1, 2, 3, 10, 11, 12, 13, 14, 15, 16, 30, 31],
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'ROLE-003',
        roleKey: 'M2',
        roleName: 'Manager Level 2',
        description: 'Senior QC Manager with extended permissions',
        menuIds: [1, 2, 3, 10, 11, 12, 13, 14, 15, 16, 20, 30, 31],
        status: 'Active',
        createdAt: '2023-10-01T08:00:00Z'
    },
    {
        id: 'ROLE-004',
        roleKey: 'Staff',
        roleName: 'Standard Staff',
        description: 'Basic QC staff with limited permissions',
        menuIds: [1, 2, 10, 12, 15, 30], // Limited QC access
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
    menuList: initialMenus,

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
