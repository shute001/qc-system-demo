import { create } from 'zustand';

// Match Backend Entity/DTO structures
export interface Role {
    roleId: string;
    roleName: string;
    roleDesc: string;
    status: number; // 1: Active, 0: Inactive
    menuIds: number[];
}

export interface User {
    id: string; // UUID
    staffId: string;
    staffName: string;
    email: string;
    status: number;
    managerId?: string;
    managerName?: string;
    roles: Role[];
    processes: Process[];
    avatar?: string;
}

export interface Business {
    id: string;
    bizCode: string;
    bizName: string;
    status: number;
}

export interface Process {
    id: string;
    procCode: string; // businessCode -- procAid -- procName
    procAid: string;
    procName: string;
    bizCode: string;
    qltyTarget: number;
    status: number;
    business?: Business;
}

export interface SysMenu {
    menuId: number;
    menuName: string;
    parentId: number;
    sortOrder: number;
    path: string;
    component?: string;
    menuType: 'D' | 'C' | 'F';
    perms?: string;
    icon?: string;
    visible: number;
    children?: SysMenu[];
}

export interface QCRecord {
    id: string;
    caseId: string;
    agentId: string;
    agentName: string;
    qcType: 'Data' | 'Call';
    type: string;
    date: string;
    status: 'Pending QC' | 'Draft' | 'In Progress' | 'Wait Staff Confirm' | 'Dispute' | 'Completed';
    processId?: string;
    checkingTime?: string;
    hasError?: boolean;
    errorType?: string;
    m1Comments?: string;
    score?: number;
    result?: 'Pass' | 'Fail';
    outcome?: string[];
    remediation?: string[];
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
    currentUser: User | null;
    setCurrentUser: (user: User) => void;
    switchUser: (staffId: string) => void;

    // Data Stores
    allMenus: SysMenu[];
    allRoles: Role[];
    allUsers: User[];
    allProcesses: Process[];
    allBusinesses: Business[];
    qcRecords: QCRecord[];
    devPlans: DevPlan[];
    leaderLogs: LeaderLog[];

    // Actions
    addQCRecord: (record: QCRecord) => void;
    updateQCRecord: (id: string, updates: Partial<QCRecord>) => void;
    addDevPlan: (plan: DevPlan) => void;
    updateDevPlan: (id: string, updates: Partial<DevPlan>) => void;
    addLeaderLog: (log: LeaderLog) => void;
    updateLeaderLog: (id: string, updates: Partial<LeaderLog>) => void;

    // System Actions
    addUser: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    addRole: (role: Role) => void;
    updateRole: (id: string, updates: Partial<Role>) => void;
    addProcess: (process: Process) => void;
    updateProcess: (id: string, updates: Partial<Process>) => void;

    // UI State
    currentView: string;
    setView: (view: string) => void;
    activeQCRecordId: string | null;
    setActiveQCRecord: (id: string | null) => void;
}

// --- MOCK DATA ---

const mockMenus: SysMenu[] = [
    { menuId: 1, menuName: 'Dashboard', parentId: 0, sortOrder: 1, path: 'dashboard', component: 'Dashboard', menuType: 'C', icon: 'DashboardOutlined', visible: 1 },
    { menuId: 2, menuName: 'Workspace', parentId: 0, sortOrder: 2, path: 'workspace', component: 'Workspace', menuType: 'C', icon: 'DesktopOutlined', visible: 1 },
    { menuId: 3, menuName: 'Analytics', parentId: 0, sortOrder: 3, path: 'analytics', component: 'AnalyticsDashboard', menuType: 'C', icon: 'BarChartOutlined', visible: 1 },

    { menuId: 10, menuName: 'QC Module', parentId: 0, sortOrder: 4, path: 'qc', menuType: 'D', icon: 'FileProtectOutlined', visible: 1 },
    { menuId: 11, menuName: 'Sampling', parentId: 10, sortOrder: 1, path: 'qc-sampling', component: 'qc/Sampling', menuType: 'C', perms: 'qc:sampling:list', visible: 1 },
    { menuId: 12, menuName: 'Inbox (To QC)', parentId: 10, sortOrder: 2, path: 'qc-inbox', component: 'qc/SamplingPage', menuType: 'C', perms: 'qc:inbox:list', visible: 1 },
    { menuId: 13, menuName: 'Outbox', parentId: 10, sortOrder: 3, path: 'qc-outbox', component: 'qc/Outbox', menuType: 'C', visible: 1 },

    { menuId: 20, menuName: 'System Management', parentId: 0, sortOrder: 5, path: 'system', menuType: 'D', icon: 'SettingOutlined', visible: 1 },
    { menuId: 21, menuName: 'User Management', parentId: 20, sortOrder: 1, path: 'team-structure', component: 'System/TeamManagement', menuType: 'C', visible: 1 },
    { menuId: 22, menuName: 'Role Management', parentId: 20, sortOrder: 2, path: 'role-mgmt', component: 'System/RoleManagement', menuType: 'C', visible: 1 },
    { menuId: 23, menuName: 'Process Management', parentId: 20, sortOrder: 3, path: 'access-mgmt', component: 'System/ProcessManagement', menuType: 'C', visible: 1 },

    { menuId: 30, menuName: 'Coaching', parentId: 0, sortOrder: 6, path: 'dev', menuType: 'D', icon: 'TeamOutlined', visible: 1 },
    { menuId: 31, menuName: 'Monthly Plan', parentId: 30, sortOrder: 1, path: 'dev-plan', component: 'DevelopmentPlan/DevPlanPage', menuType: 'C', visible: 1 },
    { menuId: 32, menuName: 'Leader Log', parentId: 30, sortOrder: 2, path: 'leader-log', component: 'LeaderLog/LeaderLogPage', menuType: 'C', visible: 1 },

    // Button Permissions (Invisible in sidebar)
    { menuId: 211, menuName: 'Add User', parentId: 21, sortOrder: 1, path: '', menuType: 'F', perms: 'sys:user:add', visible: 0 },
    { menuId: 212, menuName: 'Edit User', parentId: 21, sortOrder: 2, path: '', menuType: 'F', perms: 'sys:user:edit', visible: 0 },
    { menuId: 213, menuName: 'Delete User', parentId: 21, sortOrder: 3, path: '', menuType: 'F', perms: 'sys:user:delete', visible: 0 },
];

const mockRoles: Role[] = [
    {
        roleId: 'role-admin',
        roleName: 'Admin',
        roleDesc: 'Full system management',
        status: 1,
        menuIds: [...mockMenus.map(m => m.menuId)]
    },
    {
        roleId: 'role-m1',
        roleName: 'M1',
        roleDesc: 'Team management & QC evaluations',
        status: 1,
        menuIds: [1, 2, 3, 10, 11, 12, 13, 30, 31, 32]
    },
    {
        roleId: 'role-staff',
        roleName: 'Staff',
        roleDesc: 'Basic access for staff members',
        status: 1,
        menuIds: [1, 2, 10, 12, 30, 31]
    },
    {
        roleId: 'role-lm',
        roleName: 'LM',
        roleDesc: 'Line Manager permissions',
        status: 1,
        menuIds: [1, 2, 3, 30, 31, 32]
    }
];

const mockProcesses: Process[] = [
    {
        id: 'proc-1',
        procCode: 'COL -- NHI25 -- Collection Onshore',
        procAid: 'NHI25',
        procName: 'Collection Onshore',
        bizCode: 'COL',
        qltyTarget: 95,
        status: 1
    }
];

const mockUsers: User[] = [
    {
        id: 'user-admin-id',
        staffId: 'admin',
        staffName: 'System Administrator',
        email: 'admin@qc.io',
        status: 1,
        roles: [mockRoles[0]],
        processes: mockProcesses,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    },
    {
        id: 'user-m1-id',
        staffId: '111',
        staffName: 'alice',
        email: 'alice@qc.io',
        status: 1,
        roles: [mockRoles[1]],
        processes: [mockProcesses[0]],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        managerId: 'user-lm-id',
        managerName: 'henry ma'
    },
    {
        id: 'user-lm-id',
        staffId: '100',
        staffName: 'henry ma',
        email: 'henry@qc.io',
        status: 1,
        roles: [mockRoles[3]],
        processes: [mockProcesses[0]],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=henry'
    },
    {
        id: 'user-staff-id',
        staffId: '222',
        staffName: 'jason',
        email: 'jason@qc.io',
        status: 1,
        roles: [mockRoles[2]],
        processes: [mockProcesses[0]],
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jason',
        managerId: 'user-lm-id',
        managerName: 'henry ma'
    }
];

const initialQCRecords: QCRecord[] = [
    {
        id: 'qc-1',
        caseId: 'CASE-2023-1001',
        agentId: 'user-staff-id',
        agentName: 'Alice Staff',
        qcType: 'Call',
        type: 'Random Sample',
        date: '2023-11-01',
        status: 'Wait Staff Confirm',
        score: 85,
        result: 'Pass',
        m1Comments: 'Good communication, but missed one verification step.'
    },
    {
        id: 'qc-2',
        caseId: 'CASE-2023-1002',
        agentId: 'user-staff-id',
        agentName: 'Alice Staff',
        qcType: 'Data',
        type: 'Manual Sample',
        date: '2023-11-02',
        status: 'Dispute',
        score: 60,
        result: 'Fail',
        m1Comments: 'Inaccurate data entry in field B.',
        disputeReason: 'I followed the updated SOP, field B format has changed.'
    }
];

const initialDevPlans: DevPlan[] = [
    {
        id: 'dp-1',
        staffId: 'staff01',
        staffName: 'Alice Staff',
        month: 'November 2023',
        objectives: 'Improve call handle time and accuracy.',
        keyResults: 'AHT < 180s, Quality > 95%',
        status: 'Submitted'
    }
];

export const useAppStore = create<AppState>((set) => ({
    currentUser: mockUsers[0],
    setCurrentUser: (user) => set({ currentUser: user }),
    switchUser: (staffId) => set((state) => ({
        currentUser: state.allUsers.find(u => u.staffId === staffId) || state.currentUser
    })),

    allMenus: mockMenus,
    allRoles: mockRoles,
    allUsers: mockUsers,
    allProcesses: mockProcesses,
    allBusinesses: [
        { id: 'biz-1', bizCode: 'COL', bizName: 'Collections', status: 1 },
        { id: 'biz-2', bizCode: 'SRV', bizName: 'Services', status: 1 }
    ],
    qcRecords: initialQCRecords,
    devPlans: initialDevPlans,
    leaderLogs: [],

    addQCRecord: (record) => set((state) => ({ qcRecords: [...state.qcRecords, record] })),
    updateQCRecord: (id, updates) => set((state) => ({
        qcRecords: state.qcRecords.map(r => r.id === id ? { ...r, ...updates } : r)
    })),
    addDevPlan: (plan) => set((state) => ({ devPlans: [plan, ...state.devPlans] })),
    updateDevPlan: (id, updates) => set((state) => ({
        devPlans: state.devPlans.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    addLeaderLog: (log) => set((state) => ({ leaderLogs: [log, ...state.leaderLogs] })),
    updateLeaderLog: (id, updates) => set((state) => ({
        leaderLogs: state.leaderLogs.map(l => l.id === id ? { ...l, ...updates } : l)
    })),

    addUser: (user) => set((state) => ({ allUsers: [...state.allUsers, user] })),
    updateUser: (id, updates) => set((state) => ({
        allUsers: state.allUsers.map(u => u.id === id ? { ...u, ...updates } : u)
    })),
    addRole: (role) => set((state) => ({ allRoles: [...state.allRoles, role] })),
    updateRole: (id, updates) => set((state) => ({
        allRoles: state.allRoles.map(r => r.roleId === id ? { ...r, ...updates } : r)
    })),
    addProcess: (process) => set((state) => ({ allProcesses: [...state.allProcesses, process] })),
    updateProcess: (id, updates) => set((state) => ({
        allProcesses: state.allProcesses.map(p => p.id === id ? { ...p, ...updates } : p)
    })),

    currentView: 'dashboard',
    setView: (view) => set({ currentView: view }),
    activeQCRecordId: null,
    setActiveQCRecord: (id) => set({ activeQCRecordId: id }),
}));
