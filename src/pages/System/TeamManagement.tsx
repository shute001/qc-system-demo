import React, { useState, useEffect } from 'react';
import { Tabs, Card } from 'antd';
import { UserOutlined, SafetyCertificateOutlined, SettingOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import { UserManagement } from './UserManagement';
import { RoleManagement } from './RoleManagement';
import { ProcessManagement } from './ProcessManagement';

const { TabPane } = Tabs;

interface TeamManagementProps {
    initialTab?: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ initialTab = 'users' }) => {
    const { currentUser, setView } = useAppStore();

    // Helper to check if user has access to a specific view based on their role's permissions
    const canAccess = (perm: string): boolean => {
        if (!currentUser) return false;
        // Search through all roles for the permission
        return currentUser.roles.some(role => {
            // Check if any menu in allMenus that matches the perm is in the role's menuIds
            // Actually, a simpler way in demo is checking role names or specific permission strings if we mapped them
            // But let's simulate a more robust check:
            if (currentUser.staffId === 'admin') return true;

            // In a real app we'd check against a flat permissions list. For demo:
            if (perm === 'users' && (role.roleName === 'Admin' || role.roleName === 'M1' || role.roleName === 'LM')) return true;
            if (perm === 'roles' && role.roleName === 'Admin') return true;
            if (perm === 'processes' && (role.roleName === 'Admin' || role.roleName === 'M1')) return true;
            return false;
        });
    };

    const canViewUsers = canAccess('users');
    const canViewRoles = canAccess('roles');
    const canViewProcesses = canAccess('processes');

    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        // Ensure active tab is something user can actually see
        if (activeTab === 'users' && !canViewUsers) {
            if (canViewRoles) setActiveTab('roles');
            else if (canViewProcesses) setActiveTab('process');
        } else if (activeTab === 'roles' && !canViewRoles) {
            if (canViewUsers) setActiveTab('users');
            else if (canViewProcesses) setActiveTab('process');
        } else if (activeTab === 'process' && !canViewProcesses) {
            if (canViewUsers) setActiveTab('users');
            else if (canViewRoles) setActiveTab('roles');
        }
    }, [currentUser]);

    const handleTabChange = (key: string) => {
        const viewMap: Record<string, string> = {
            'users': 'team-structure',
            'roles': 'role-mgmt',
            'process': 'access-mgmt'
        };
        const targetView = viewMap[key];
        if (targetView) {
            setView(targetView);
        }
        setActiveTab(key);
    };

    if (!canViewUsers && !canViewRoles && !canViewProcesses) {
        return <div className="p-6">Access Denied: No System Management permissions found for your role.</div>;
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <SettingOutlined className="text-xl text-green-700" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">System Management</h2>
                    <p className="text-gray-500 text-sm">Control users, roles, and business processes.</p>
                </div>
            </div>

            <Card bordered={false} className="shadow-md rounded-xl overflow-hidden">
                <Tabs activeKey={activeTab} onChange={handleTabChange} className="px-2">
                    {canViewUsers && (
                        <TabPane tab={<span className="flex items-center gap-2"><UserOutlined />User Management</span>} key="users">
                            <UserManagement />
                        </TabPane>
                    )}

                    {canViewRoles && (
                        <TabPane tab={<span className="flex items-center gap-2"><SafetyCertificateOutlined />Role Management</span>} key="roles">
                            <RoleManagement />
                        </TabPane>
                    )}

                    {canViewProcesses && (
                        <TabPane tab={<span className="flex items-center gap-2"><SettingOutlined />Process Management</span>} key="process">
                            <ProcessManagement />
                        </TabPane>
                    )}
                </Tabs>
            </Card>
        </div>
    );
};

export default TeamManagement;
