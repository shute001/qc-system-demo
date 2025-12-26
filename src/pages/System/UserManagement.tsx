import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppStore, type User, type Role, type Process } from '../../store/useAppStore';

const { Option } = Select;

export const UserManagement: React.FC = () => {
    const { allUsers, allRoles, allProcesses, addUser, updateUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [filteredUsers, setFilteredUsers] = useState<User[]>(allUsers);

    const handleSearch = () => {
        const values = searchForm.getFieldsValue();
        let results = allUsers;
        if (values.staffId) {
            results = results.filter(u => u.staffId.includes(values.staffId));
        }
        if (values.managerId) {
            results = results.filter(u => u.managerId === values.managerId);
        }
        setFilteredUsers(results);
    };

    const handleReset = () => {
        searchForm.resetFields();
        setFilteredUsers(allUsers);
    };

    // Keep filtered results in sync with store
    React.useEffect(() => {
        handleSearch();
    }, [allUsers]);

    const columns = [
        { title: 'Staff ID', dataIndex: 'staffId', key: 'staffId', className: 'font-mono' },
        { title: 'Name', dataIndex: 'staffName', key: 'staffName', className: 'font-semibold' },
        {
            title: 'Role',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles: Role[]) => roles?.map(r => <Tag key={r.roleId} color="blue">{r.roleName}</Tag>)
        },
        {
            title: 'Processes',
            dataIndex: 'processes',
            key: 'processes',
            render: (procs: Process[]) => (
                <div className="flex flex-wrap gap-1">
                    {procs?.map(p => <Tag key={p.id} color="cyan">{p.procCode}</Tag>)}
                </div>
            )
        },
        {
            title: 'Line Manager',
            dataIndex: 'managerName',
            key: 'managerName',
            render: (name: string) => name || '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => (
                <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: User) => (
                <div className="space-x-2">
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Delete?" onConfirm={() => {
                        message.success('User deactivated (Simulated)');
                    }}>
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
            )
        }
    ];

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            ...user,
            roleIds: user.roles?.map(r => r.roleId),
            processIds: user.processes?.map(p => p.id),
            name: user.staffName
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        form.setFieldsValue({ status: 1 });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const selectedRoles = allRoles.filter(r => values.roleIds.includes(r.roleId));
            const selectedProcesses = allProcesses.filter(p => values.processIds.includes(p.id));
            const manager = allUsers.find(u => u.id === values.managerId);

            const payload: any = {
                ...values,
                staffName: values.name,
                roles: selectedRoles,
                processes: selectedProcesses,
                managerId: values.managerId,
                managerName: manager?.staffName
            };

            if (editingUser) {
                updateUser(editingUser.id, payload);
                message.success('Updated');
            } else {
                addUser({
                    ...payload,
                    id: `user-${Date.now()}`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.name}`
                });
                message.success('Created');
            }

            setIsModalOpen(false);
        } catch (e) { message.error('Failed to save'); }
    };

    const managerList = allUsers.filter(u => u.roles.some(r => r.roleName === 'LM' || r.roleName === 'Admin'));

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                <Form form={searchForm} layout="inline" className="flex-1">
                    <Form.Item name="staffId" label="Staff ID">
                        <Input placeholder="Search Staff ID" allowClear onPressEnter={handleSearch} />
                    </Form.Item>
                    <Form.Item name="managerId" label="Line Manager">
                        <Select
                            placeholder="Select Manager"
                            allowClear
                            style={{ width: 200 }}
                            onChange={handleSearch}
                        >
                            {managerList.map(u => (
                                <Option key={u.id} value={u.id}>{u.staffName} ({u.staffId})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={handleSearch} className="bg-green-600">Search</Button>
                        <Button onClick={handleReset} className="ml-2">Reset</Button>
                    </Form.Item>
                </Form>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Add Staff</Button>
            </div>
            <Table
                dataSource={filteredUsers}
                columns={columns}
                rowKey="id"
                className="shadow-sm border rounded-lg"
            />

            <Modal open={isModalOpen} title={editingUser ? "Edit User" : "Add User"} onOk={handleSave} onCancel={() => setIsModalOpen(false)} width={600}>
                <Form form={form} layout="vertical" className="grid grid-cols-2 gap-x-4">
                    <Form.Item label="Staff ID" name="staffId" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>

                    <Form.Item label="Role" name="roleIds" rules={[{ required: true }]} className="col-span-2">
                        <Select mode="multiple" placeholder="Select roles">
                            {allRoles.map(r => <Option key={r.roleId} value={r.roleId}>{r.roleName}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Line Manager" name="managerId" className="col-span-2">
                        <Select allowClear showSearch optionFilterProp="children">
                            {managerList.map(u => (
                                <Option key={u.id} value={u.id}>{u.staffName} ({u.staffId})</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Processes" name="processIds" className="col-span-2">
                        <Select mode="multiple">
                            {allProcesses.map(p => <Option key={p.id} value={p.id}>{p.procCode}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Status" name="status">
                        <Select>
                            <Option value={1}>Active</Option>
                            <Option value={0}>Inactive</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
