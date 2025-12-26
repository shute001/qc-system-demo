import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Tag, Typography } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    HomeOutlined,
    BarChartOutlined,
    FileProtectOutlined,
    TeamOutlined,
    ScheduleOutlined,
    BookOutlined,
    DesktopOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    SafetyCertificateOutlined,
    DashboardOutlined,
} from '@ant-design/icons';
import { useAppStore, type SysMenu, type User } from '../store/useAppStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// Icon mapping helper
const IconMap: Record<string, React.ReactNode> = {
    DashboardOutlined: <DashboardOutlined />,
    DesktopOutlined: <DesktopOutlined />,
    BarChartOutlined: <BarChartOutlined />,
    FileProtectOutlined: <FileProtectOutlined />,
    SettingOutlined: <SettingOutlined />,
    UserOutlined: <UserOutlined />,
    HomeOutlined: <HomeOutlined />,
    TeamOutlined: <TeamOutlined />,
    ScheduleOutlined: <ScheduleOutlined />,
    BookOutlined: <BookOutlined />,
    SafetyCertificateOutlined: <SafetyCertificateOutlined />,
};

interface MainLayoutProps {
    children: React.ReactNode;
    currentView?: string;
    onNavigate?: (key: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentView, onNavigate }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { currentUser, allMenus, allUsers, switchUser } = useAppStore();

    if (!currentUser) return <div className="p-10 text-center">Loading...</div>;

    // 1. Get all permitted menu IDs for the user
    const permittedMenuIds = new Set<number>();
    currentUser.roles.forEach(role => {
        role.menuIds.forEach(id => permittedMenuIds.add(id));
    });

    // 2. Filter and build tree
    const chooseDefaultIcon = (path: string) => {
        if (!path) return undefined;
        if (path.includes('team-structure') || path.includes('team')) return <UserOutlined />;
        if (path.includes('role-mgmt') || path.includes('role')) return <SafetyCertificateOutlined />;
        if (path.includes('access') || path.includes('process')) return <SettingOutlined />;
        return undefined;
    };

    const buildMenuTree = (menus: SysMenu[], parentId: number = 0): any[] => {
        return menus
            .filter(m => m.parentId === parentId && permittedMenuIds.has(m.menuId) && m.visible === 1)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(m => {
                const children = buildMenuTree(menus, m.menuId);
                const mappedIcon = m.icon ? IconMap[m.icon] : undefined;
                if (m.icon && !mappedIcon) {
                    // Help debug missing icons from backend config
                    console.warn(`Menu icon not mapped: ${m.icon} for menu ${m.menuName}`);
                }
                // If no explicit icon mapped, choose sensible default for known paths
                const finalIcon = mappedIcon || chooseDefaultIcon(m.path || '');
                return {
                    key: m.path,
                    label: m.menuName,
                    icon: finalIcon,
                    children: children.length > 0 ? children : undefined
                };
            });
    };

    const treeMenuItems = buildMenuTree(allMenus);

    const userMenu = {
        items: [
            {
                key: 'user-switch',
                label: (
                    <div className="flex flex-col gap-1 p-1" onClick={(e) => e.stopPropagation()}>
                        <Text strong>Switch User (Demo)</Text>
                        <div className="flex flex-col gap-1 mt-1">
                            {allUsers.map((u) => (
                                <Button
                                    key={u.id}
                                    type={currentUser.id === u.id ? 'primary' : 'text'}
                                    size="small"
                                    onClick={() => switchUser(u.staffId)}
                                    className="text-left w-full h-auto py-1 px-2"
                                >
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-sm font-medium">{u.staffName}</span>
                                        <span className="text-[10px] opacity-70">{u.roles?.[0]?.roleName}</span>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                ),
            },
            { type: 'divider' as const },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                danger: true as const,
            },
        ],
    };

    return (
        <Layout className="min-h-screen">
            <Sider trigger={null} collapsible collapsed={collapsed} width={240} className="shadow-lg z-10">
                <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-[#001529]">
                    {collapsed ? (
                        <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold">QC</div>
                    ) : (
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center font-bold">QC</div>
                            <span className="font-semibold text-lg">QC System Demo</span>
                        </div>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentView || 'dashboard']}
                    items={treeMenuItems}
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
                            <Text strong className="block leading-tight">{currentUser.staffName}</Text>
                            <div className="flex gap-1 justify-end">
                                {currentUser.roles.map(r => (
                                    <Tag key={r.roleId} color="green" className="m-0 text-[10px]">
                                        {r.roleName}
                                    </Tag>
                                ))}
                            </div>
                        </div>
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
