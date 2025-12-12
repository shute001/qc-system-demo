import React, { useState } from 'react';
import { Tabs, Table, Button, Card, Tag, Switch, InputNumber, Form, Modal, Input, Select, message, Space, Popconfirm } from 'antd';
import { UserOutlined, SettingOutlined, SafetyCertificateOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { User, Process, RoleDefinition, PagePermission } from '../../store/useAppStore';

const { TabPane } = Tabs;
const { Option } = Select;

// ProcessManagement Component
const ProcessManagement: React.FC = () => {
    const { processList, staffList, addProcess, updateProcess, deleteProcess } = useAppStore();
    const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<Process | null>(null);
    const [processForm] = Form.useForm();

    // Country, Region, and Business Line options
    const countryOptions = ['CN', 'US', 'SG', 'UK', 'JP', 'AU'];
    const regionOptions = {
        'CN': ['SH', 'BJ', 'GZ', 'SZ', 'CD'],
        'US': ['NY', 'LA', 'SF', 'CH', 'BO'],
        'SG': ['SG'],
        'UK': ['LON', 'MAN'],
        'JP': ['TKY', 'OSA'],
        'AU': ['SYD', 'MEL']
    };
    const businessLineOptions = ['COLLECTION', 'SALES', 'CS', 'TECH_SUPPORT', 'MARKETING'];

    // Calculate assigned users count for each process
    const getAssignedUsersCount = (processId: string) => {
        return staffList.filter(user => user.processes?.includes(processId)).length;
    };

    // Process table columns
    const processColumns = [
        {
            title: 'Process Code',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => <Tag color="blue">{code}</Tag>
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 250
        },
        {
            title: 'Country/Region',
            key: 'location',
            render: (_: any, record: Process) => `${record.country}-${record.region}`
        },
        {
            title: 'Business Line',
            dataIndex: 'businessLine',
            key: 'businessLine',
            render: (line: string) => {
                const colorMap: Record<string, string> = {
                    'COLLECTION': 'green',
                    'SALES': 'blue',
                    'CS': 'orange',
                    'TECH_SUPPORT': 'purple',
                    'MARKETING': 'magenta'
                };
                return <Tag color={colorMap[line] || 'default'}>{line}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Process) => (
                <Switch
                    checked={status === 'Active'}
                    onChange={(checked) => {
                        updateProcess(record.id, { status: checked ? 'Active' : 'Inactive' });
                        message.success(`Process ${checked ? 'activated' : 'deactivated'}`);
                    }}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            )
        },
        {
            title: 'Assigned Users',
            key: 'userCount',
            render: (_: any, record: Process) => {
                const count = getAssignedUsersCount(record.id);
                return <Tag>{count}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Process) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditProcess(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Process"
                        description={
                            getAssignedUsersCount(record.id) > 0
                                ? "This process has assigned users. Please reassign them first."
                                : "Are you sure you want to delete this process?"
                        }
                        onConfirm={() => {
                            if (getAssignedUsersCount(record.id) > 0) {
                                message.error('Cannot delete process with assigned users');
                                return;
                            }
                            deleteProcess(record.id);
                            message.success('Process deleted successfully');
                        }}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{
                            danger: true,
                            disabled: getAssignedUsersCount(record.id) > 0
                        }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleAddProcess = () => {
        setEditingProcess(null);
        processForm.resetFields();
        setIsProcessModalOpen(true);
    };

    const handleEditProcess = (process: Process) => {
        setEditingProcess(process);
        processForm.setFieldsValue({
            code: process.code,
            name: process.name,
            country: process.country,
            region: process.region,
            businessLine: process.businessLine,
            status: process.status
        });
        setIsProcessModalOpen(true);
    };

    const handleSaveProcess = async () => {
        try {
            const values = await processForm.validateFields();

            if (editingProcess) {
                // Update existing process
                updateProcess(editingProcess.id, {
                    code: values.code,
                    name: values.name,
                    country: values.country,
                    region: values.region,
                    businessLine: values.businessLine,
                    status: values.status
                });
                message.success('Process updated successfully');
            } else {
                // Create new process
                const newProcess: Process = {
                    id: `PROC-${Date.now()}`,
                    code: values.code,
                    name: values.name,
                    country: values.country,
                    region: values.region,
                    businessLine: values.businessLine,
                    status: values.status,
                    createdAt: new Date().toISOString()
                };
                addProcess(newProcess);
                message.success('Process created successfully');
            }
            setIsProcessModalOpen(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const [selectedCountry, setSelectedCountry] = useState<string>('CN');

    return (
        <>
            <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-500">Manage business processes and their assignments.</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProcess}>
                    Add Process
                </Button>
            </div>
            <Table
                dataSource={processList}
                columns={processColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingProcess ? "Edit Process" : "Add New Process"}
                open={isProcessModalOpen}
                onOk={handleSaveProcess}
                onCancel={() => setIsProcessModalOpen(false)}
                width={600}
            >
                <Form form={processForm} layout="vertical">
                    <Form.Item
                        label="Process Code"
                        name="code"
                        rules={[
                            { required: true, message: 'Please enter process code' },
                            { pattern: /^[A-Z0-9_-]+$/, message: 'Only uppercase letters, numbers, hyphens and underscores allowed' }
                        ]}
                    >
                        <Input placeholder="e.g., COLLECTION-CNSH-001" />
                    </Form.Item>

                    <Form.Item
                        label="Process Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter process name' }]}
                    >
                        <Input placeholder="e.g., Collection China Shanghai Branch" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            label="Country"
                            name="country"
                            rules={[{ required: true, message: 'Please select country' }]}
                        >
                            <Select
                                placeholder="Select country"
                                onChange={(value) => {
                                    setSelectedCountry(value);
                                    processForm.setFieldsValue({ region: undefined });
                                }}
                            >
                                {countryOptions.map(c => (
                                    <Option key={c} value={c}>{c}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Region"
                            name="region"
                            rules={[{ required: true, message: 'Please select region' }]}
                        >
                            <Select placeholder="Select region">
                                {regionOptions[selectedCountry as keyof typeof regionOptions]?.map(r => (
                                    <Option key={r} value={r}>{r}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Business Line"
                        name="businessLine"
                        rules={[{ required: true, message: 'Please select business line' }]}
                    >
                        <Select placeholder="Select business line">
                            {businessLineOptions.map(bl => (
                                <Option key={bl} value={bl}>{bl}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Status"
                        name="status"
                        initialValue="Active"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

// RoleManagement Component
const RoleManagement: React.FC = () => {
    const { roleDefinitions, pagePermissions, staffList, addRole, updateRole, deleteRole } = useAppStore();
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
    const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<RoleDefinition | null>(null);
    const [roleForm] = Form.useForm();
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    // Calculate users count for each role
    const getUsersCount = (roleKey: string) => {
        return staffList.filter(user => user.role === roleKey).length;
    };

    // Group permissions by category
    const groupedPermissions = pagePermissions.reduce((acc, perm) => {
        if (!acc[perm.category]) {
            acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
    }, {} as Record<string, PagePermission[]>);

    // Role table columns
    const roleColumns = [
        {
            title: 'Role Name',
            dataIndex: 'roleName',
            key: 'roleName',
            render: (name: string) => <Tag color="purple">{name}</Tag>
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 300
        },
        {
            title: 'Permissions',
            key: 'permissions',
            render: (_: any, record: RoleDefinition) => (
                <span>{record.permissions.length}/{pagePermissions.length} pages</span>
            )
        },
        {
            title: 'Users Count',
            key: 'usersCount',
            render: (_: any, record: RoleDefinition) => {
                const count = getUsersCount(record.roleKey);
                return <Tag>{count}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: RoleDefinition) => (
                <Switch
                    checked={status === 'Active'}
                    onChange={(checked) => {
                        updateRole(record.id, { status: checked ? 'Active' : 'Inactive' });
                        message.success(`Role ${checked ? 'activated' : 'deactivated'}`);
                    }}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: RoleDefinition) => (
                <Space>
                    <Button
                        type="link"
                        icon={<SafetyCertificateOutlined />}
                        onClick={() => handleEditPermissions(record)}
                    >
                        Edit Permissions
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditRole(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Role"
                        description={
                            getUsersCount(record.roleKey) > 0
                                ? "This role has assigned users. Please reassign them first."
                                : "Are you sure you want to delete this role?"
                        }
                        onConfirm={() => {
                            if (getUsersCount(record.roleKey) > 0) {
                                message.error('Cannot delete role with assigned users');
                                return;
                            }
                            deleteRole(record.id);
                            message.success('Role deleted successfully');
                        }}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{
                            danger: true,
                            disabled: getUsersCount(record.roleKey) > 0
                        }}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleAddRole = () => {
        setEditingRole(null);
        roleForm.resetFields();
        setIsRoleModalOpen(true);
    };

    const handleEditRole = (role: RoleDefinition) => {
        setEditingRole(role);
        roleForm.setFieldsValue({
            roleKey: role.roleKey,
            roleName: role.roleName,
            description: role.description,
            status: role.status
        });
        setIsRoleModalOpen(true);
    };

    const handleSaveRole = async () => {
        try {
            const values = await roleForm.validateFields();

            if (editingRole) {
                // Update existing role
                updateRole(editingRole.id, {
                    roleName: values.roleName,
                    description: values.description,
                    status: values.status
                });
                message.success('Role updated successfully');
            } else {
                // Create new role
                const newRole: RoleDefinition = {
                    id: `ROLE-${Date.now()}`,
                    roleKey: values.roleKey,
                    roleName: values.roleName,
                    description: values.description,
                    permissions: [], // Start with no permissions
                    status: values.status,
                    createdAt: new Date().toISOString()
                };
                addRole(newRole);
                message.success('Role created successfully');
            }
            setIsRoleModalOpen(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleEditPermissions = (role: RoleDefinition) => {
        setSelectedRoleForPermissions(role);
        setSelectedPermissions([...role.permissions]);
        setIsPermissionModalOpen(true);
    };

    const handleSavePermissions = () => {
        if (selectedRoleForPermissions) {
            updateRole(selectedRoleForPermissions.id, {
                permissions: selectedPermissions
            });
            message.success('Permissions updated successfully');
            setIsPermissionModalOpen(false);
        }
    };

    const handleCategorySelectAll = (category: string, checked: boolean) => {
        const categoryPerms = groupedPermissions[category].map(p => p.key);
        if (checked) {
            setSelectedPermissions(prev => [...new Set([...prev, ...categoryPerms])]);
        } else {
            setSelectedPermissions(prev => prev.filter(p => !categoryPerms.includes(p)));
        }
    };

    return (
        <>
            <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-500">Manage user roles and configure page access permissions.</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRole}>
                    Add Role
                </Button>
            </div>
            <Table
                dataSource={roleDefinitions}
                columns={roleColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            {/* Role Create/Edit Modal */}
            <Modal
                title={editingRole ? "Edit Role" : "Add New Role"}
                open={isRoleModalOpen}
                onOk={handleSaveRole}
                onCancel={() => setIsRoleModalOpen(false)}
                width={600}
            >
                <Form form={roleForm} layout="vertical">
                    <Form.Item
                        label="Role Key"
                        name="roleKey"
                        rules={[{ required: true, message: 'Please select or enter role key' }]}
                    >
                        <Select disabled={!!editingRole} placeholder="Select role type">
                            <Option value="Admin">Admin</Option>
                            <Option value="M1">M1</Option>
                            <Option value="M2">M2</Option>
                            <Option value="Staff">Staff</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Role Name"
                        name="roleName"
                        rules={[{ required: true, message: 'Please enter role name' }]}
                    >
                        <Input placeholder="e.g., Administrator" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Describe the role's responsibilities..." />
                    </Form.Item>

                    <Form.Item
                        label="Status"
                        name="status"
                        initialValue="Active"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Inactive">Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Permission Configuration Modal */}
            <Modal
                title={`Configure Permissions - ${selectedRoleForPermissions?.roleName}`}
                open={isPermissionModalOpen}
                onOk={handleSavePermissions}
                onCancel={() => setIsPermissionModalOpen(false)}
                width={700}
            >
                <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <Card
                            key={category}
                            type="inner"
                            title={
                                <div className="flex justify-between items-center">
                                    <span>{category}</span>
                                    <Space>
                                        <Button
                                            size="small"
                                            onClick={() => handleCategorySelectAll(category, true)}
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => handleCategorySelectAll(category, false)}
                                        >
                                            Deselect All
                                        </Button>
                                    </Space>
                                </div>
                            }
                            size="small"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {perms.map(perm => (
                                    <label key={perm.key} className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(perm.key)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPermissions(prev => [...prev, perm.key]);
                                                } else {
                                                    setSelectedPermissions(prev => prev.filter(p => p !== perm.key));
                                                }
                                            }}
                                            className="mr-2"
                                        />
                                        <span>{perm.name}</span>
                                    </label>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="mt-4 text-gray-500">
                    Selected: {selectedPermissions.length}/{pagePermissions.length} pages
                </div>
            </Modal>
        </>
    );
};

interface TeamManagementProps {
    initialTab?: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ initialTab = 'structure' }) => {
    const { staffList, addStaff, updateStaff, setView, samplingRules, updateSamplingRules, processList } = useAppStore();

    // -- Tab Sync Logic --
    const handleTabChange = (key: string) => {
        const viewMap: Record<string, string> = {
            'structure': 'team-structure',
            'roles': 'role-mgmt',
            'access': 'access-mgmt',
            'rules': 'sampling-rules',
        };
        const targetView = viewMap[key];
        if (targetView) {
            setView(targetView);
        }
    };

    // -- Tab 1: User Management --
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchStaffId, setSearchStaffId] = useState('');
    const [searchManagerId, setSearchManagerId] = useState('');
    const [form] = Form.useForm();

    // Filter Logic
    const filteredStaff = staffList.filter(user => {
        const matchStaff = !searchStaffId || user.id.toLowerCase().includes(searchStaffId.toLowerCase());
        const matchManager = !searchManagerId || (user.lineManagerId && user.lineManagerId.toLowerCase().includes(searchManagerId.toLowerCase()));
        return matchStaff && matchManager;
    });

    // Structure Columns
    const structureColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Department', dataIndex: 'department', key: 'department', render: (t: string) => t || 'N/A' },
        {
            title: 'Line Manager',
            dataIndex: 'lineManagerId',
            key: 'lineManagerId',
            render: (mid: string) => {
                const manager = staffList.find(u => u.id === mid);
                return manager ? <span>{manager.name} <Tag>{mid}</Tag></span> : '-';
            }
        },
        { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color="blue">{r}</Tag> },
        {
            title: 'Processes',
            dataIndex: 'processes',
            key: 'processes',
            render: (p: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {p?.map(proc => <Tag key={proc} bordered={false}>{proc}</Tag>) || '-'}
                </div>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: User) => (
                <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
            )
        }
    ];

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            id: user.id,
            role: user.role,
            lineManagerId: user.lineManagerId,
            processes: user.processes || [],
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                // Update
                updateStaff(editingUser.id, {
                    ...values,
                });
                message.success('Staff updated successfully');
            } else {
                // Add
                addStaff({
                    ...values,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.name}`,
                    department: 'CS', // Default
                });
                message.success('Staff added successfully');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // -- Tab 1.5: Role Management (New) --
    const roleColumns = [
        { title: 'Role Name', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color="purple">{r}</Tag> },
        { title: 'Description', dataIndex: 'desc', key: 'desc' },
        { title: 'Users Count', dataIndex: 'count', key: 'count' },
    ];

    const roleData = [
        { key: '1', role: 'Admin', desc: 'Full system access', count: 1 },
        { key: '2', role: 'M1', desc: 'Manager Level 1 - Approvals & QC', count: 1 },
        { key: '3', role: 'M2', desc: 'Manager Level 2 - Senior QC', count: 1 },
        { key: '4', role: 'Staff', desc: 'Standard Staff User', count: 2 },
    ];


    // -- Tab 3: Sampling Rules --
    const [rulesForm] = Form.useForm();

    const onFinishRules = (values: any) => {
        // Transform form values back to store structure
        const newRules = [
            { department: 'CS', qcType: 'Data', percentage: values.cs_data_rate, minCount: values.cs_data_min },
            { department: 'CS', qcType: 'Call', percentage: values.cs_call_rate, minCount: values.cs_call_min },
        ] as any;
        updateSamplingRules(newRules);
        message.success('Sampling rules updated in system');
    };

    // Initialize form
    React.useEffect(() => {
        const csData = samplingRules.find(r => r.department === 'CS' && r.qcType === 'Data');
        const csCall = samplingRules.find(r => r.department === 'CS' && r.qcType === 'Call');
        rulesForm.setFieldsValue({
            cs_data_rate: csData?.percentage || 10,
            cs_data_min: csData?.minCount || 5,
            cs_call_rate: csCall?.percentage || 5,
            cs_call_min: csCall?.minCount || 3,
        });
    }, [samplingRules, rulesForm]);

    // Role-based view protection
    if (useAppStore.getState().currentUser.role === 'Staff') {
        return <div className="p-6">You do not have permission to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            <Card bordered={false} className="shadow-sm">
                <Tabs activeKey={initialTab} onChange={handleTabChange}>

                    <TabPane tab={<span><UserOutlined />User Management</span>} key="structure">
                        <div className="mb-4 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Manage all staff members, roles, and process assignments.</span>
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                                    Add Staff
                                </Button>
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Search by Staff ID..."
                                    allowClear
                                    onChange={(e) => setSearchStaffId(e.target.value)}
                                    style={{ width: 250 }}
                                    prefix={<UserOutlined className="text-gray-400" />}
                                />
                                <Input
                                    placeholder="Search by Manager ID..."
                                    allowClear
                                    onChange={(e) => setSearchManagerId(e.target.value)}
                                    style={{ width: 250 }}
                                    prefix={<UserOutlined className="text-gray-400" />}
                                />
                            </div>
                        </div>
                        <Table dataSource={filteredStaff} columns={structureColumns} rowKey="id" />
                    </TabPane>

                    <TabPane tab={<span><SafetyCertificateOutlined />Role Management</span>} key="roles">
                        <div className="mb-4 text-gray-500">Define and manage user roles and their scopes.</div>
                        <Table dataSource={roleData} columns={roleColumns} pagination={false} />
                    </TabPane>

                    <TabPane tab={<span><SafetyCertificateOutlined />Process Management</span>} key="access">
                        <ProcessManagement />
                    </TabPane>

                    <TabPane tab={<span><SettingOutlined />Sampling Rules</span>} key="rules">
                        <div className="max-w-2xl">
                            <div className="mb-6 text-gray-500">Set automatic sampling rules for QC generation.</div>
                            <Form form={rulesForm} layout="vertical" onFinish={onFinishRules}>
                                <Card type="inner" title="Customer Service Department (CS)" className="mb-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="mb-2 font-medium">Data Entry Transactions</h4>
                                            <Form.Item label="Sampling Rate (%)" name="cs_data_rate">
                                                <InputNumber min={0} max={100} className="w-full" />
                                            </Form.Item>
                                            <Form.Item label="Min Samples / Agent" name="cs_data_min">
                                                <InputNumber min={0} className="w-full" />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <h4 className="mb-2 font-medium">Call Interactions</h4>
                                            <Form.Item label="Sampling Rate (%)" name="cs_call_rate">
                                                <InputNumber min={0} max={100} className="w-full" />
                                            </Form.Item>
                                            <Form.Item label="Min Samples / Agent" name="cs_call_min">
                                                <InputNumber min={0} className="w-full" />
                                            </Form.Item>
                                        </div>
                                    </div>
                                </Card>
                                <Button type="primary" htmlType="submit">Save Global Rules</Button>
                            </Form>
                        </div>
                    </TabPane>

                </Tabs>
            </Card>

            <Modal
                title={editingUser ? "Edit Staff" : "Add New Staff"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="ID" name="id" rules={[{ required: true }]}><Input disabled={!!editingUser} /></Form.Item>

                    <Form.Item label="Role" name="role" rules={[{ required: true }]}>
                        <Select>
                            <Option value="Staff">Staff</Option>
                            <Option value="M1">M1</Option>
                            <Option value="M2">M2</Option>
                            <Option value="Admin">Admin</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Reports To (Line Manager)" name="lineManagerId">
                        <Select allowClear>
                            {staffList.filter(u => ['M1', 'M2'].includes(u.role)).map(u => (
                                <Option key={u.id} value={u.id}>{u.name} ({u.role})</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Assigned Processes" name="processes">
                        <Select mode="multiple" placeholder="Select processes to assign">
                            {processList.filter(p => p.status === 'Active').map(p => (
                                <Option key={p.id} value={p.id}>
                                    <div>
                                        <Tag color="blue" className="mr-1">{p.code}</Tag>
                                        {p.name}
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeamManagement;
