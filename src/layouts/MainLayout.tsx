import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Tag, Typography } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    FileProtectOutlined,
    TeamOutlined,
    ScheduleOutlined,
    BookOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store/useAppStore';
import type { Role } from '../store/useAppStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
    children: React.ReactNode;
    currentView?: string;
    onNavigate?: (key: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, onNavigate }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { currentUser, switchRole } = useAppStore();

    const roleColors: Record<Role, string> = {
        Admin: 'red',
        M1: 'orange',
        M2: 'purple',
        Staff: 'green',
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            roles: ['Admin', 'M1', 'M2', 'Staff'],
        },
        {
            key: 'qc-module',
            icon: <FileProtectOutlined />,
            label: 'QC Module',
            roles: ['M1', 'M2', 'Staff'],
            children: [
                { key: 'qc', label: 'Sampling / QC Check', roles: ['M1', 'M2'] },
                { key: 'my-qc-action', label: 'My QC Action', roles: ['Staff'] },
            ]
        },
        {
            key: 'team',
            icon: <TeamOutlined />,
            label: 'System Management',
            roles: ['Admin', 'M1', 'M2'],
            children: [
                { key: 'team-structure', label: 'Team Structure' },
                { key: 'access-mgmt', label: 'Access Management' },
                { key: 'sampling-rules', label: 'Sampling Rules' },
            ]
        },
        {
            key: 'dev-plan',
            icon: <ScheduleOutlined />,
            label: 'Development Plan',
            roles: ['M1', 'M2', 'Staff'],
        },
        {
            key: 'leader-log',
            icon: <BookOutlined />,
            label: 'Leader Log',
            roles: ['M1', 'M2'],
        },
    ];

    // Recursive filter function
    const filterMenu = (items: any[]): any[] => {
        return items
            .filter(item => !item.roles || item.roles.includes(currentUser.role))
            .map(item => ({
                ...item,
                children: item.children ? filterMenu(item.children) : undefined
            }));
    };

    const filteredMenuItems = filterMenu(menuItems);

    const userMenu = {
        items: [
            {
                key: 'role-switch',
                label: (
                    <div className="flex flex-col gap-1 p-1">
                        <Text strong>Switch Role (Demo)</Text>
                        <div className="flex gap-2 flex-wrap">
                            {(['Admin', 'M1', 'M2', 'Staff'] as Role[]).map((r) => (
                                <Tag
                                    key={r}
                                    color={roleColors[r]}
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        switchRole(r);
                                    }}
                                >
                                    {r}
                                </Tag>
                            ))}
                        </div>
                    </div>
                ),
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                danger: true,
            },
        ],
    };

    return (
        <Layout className="min-h-screen">
            <Sider trigger={null} collapsible collapsed={collapsed} width={240} className="shadow-lg z-10">
                <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-[#001529]">
                    {collapsed ? (
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
                            QC
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold">
                                QC
                            </div>
                            <span className="font-semibold text-lg">Quality Control</span>
                        </div>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['dashboard']}
                    selectedKeys={currentView ? [currentView] : []}
                    items={filteredMenuItems}
                    className="mt-2"
                    onClick={({ key }) => onNavigate?.(key)}
                />
            </Sider>
            <Layout>
                <Header className="bg-white p-0 px-4 flex justify-between items-center shadow-sm z-10">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-lg w-16 h-16"
                    />
                    <div className="flex items-center gap-4 mr-4">
                        <div className="text-right hidden sm:block">
                            <Text strong className="block leading-tight">{currentUser.name}</Text>
                            <Tag color={roleColors[currentUser.role]} className="m-0 text-xs">
                                {currentUser.role}
                            </Tag>
                        </div>
                        {/* @ts-ignore */}
                        <Dropdown menu={userMenu} placement="bottomRight" arrow>
                            <Avatar
                                size="large"
                                src={currentUser.avatar}
                                icon={<UserOutlined />}
                                className="cursor-pointer border border-gray-200"
                            />
                        </Dropdown>
                    </div>
                </Header>
                <Content className="m-6 p-6 bg-white rounded-lg shadow-sm overflow-auto">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
