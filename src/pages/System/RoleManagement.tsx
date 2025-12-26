import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Tree, message, Tag, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppStore, type Role, type SysMenu } from '../../store/useAppStore';

const { Option } = Select;

export const RoleManagement: React.FC = () => {
    const { allRoles, allMenus, addRole, updateRole } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [form] = Form.useForm();

    const columns = [
        { title: 'Role Name', dataIndex: 'roleName', key: 'roleName', render: (t: string) => <Tag color="purple">{t}</Tag> },
        { title: 'Description', dataIndex: 'roleDesc', key: 'roleDesc' },
        { title: 'Permissions Count', dataIndex: 'menuIds', key: 'menuIds', render: (ids: any[]) => ids?.length || 0 },
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
            render: (_: any, record: Role) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => message.info('Delete Role (Simulated)')} />
                </Space>
            )
        }
    ];

    const buildTreeData = (menus: SysMenu[], parentId: number = 0): any[] => {
        return menus
            .filter(menu => menu.parentId === parentId)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(menu => ({
                key: menu.menuId,
                title: menu.menuName,
                children: buildTreeData(menus, menu.menuId),
            }));
    };

    const treeData = buildTreeData(allMenus);


    const handleEdit = (role: Role) => {
        setEditingRole(role);
        form.setFieldsValue(role);
        setCheckedKeys(role.menuIds || []);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingRole(null);
        form.resetFields();
        form.setFieldsValue({ status: 1 });
        setCheckedKeys([]);
        setIsModalOpen(true);
    };

    const handleSaveRole = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                menuIds: checkedKeys.map(Number)
            };
            if (editingRole) {
                updateRole(editingRole.roleId, payload);
                message.success('Updated');
            } else {
                addRole({ ...payload, roleId: `role-${Date.now()}` });
                message.success('Created');
            }
            setIsModalOpen(false);
        } catch (e) { message.error('Failed'); }
    };

    return (
        <div className="animate-in slide-in-from-right-4 duration-500">
            <div className="mb-4 flex justify-end">
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Add Role</Button>
            </div>
            <Table dataSource={allRoles} columns={columns} rowKey="roleId" className="shadow-sm border rounded-lg" />

            <Modal open={isModalOpen} title={editingRole ? "Edit Role" : "Add Role"} onOk={handleSaveRole} onCancel={() => setIsModalOpen(false)} width={600}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Role Name" name="roleName" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Description" name="roleDesc"><Input.TextArea /></Form.Item>
                    <Form.Item label="Status" name="status">
                        <Select>
                            <Option value={1}>Active</Option>
                            <Option value={0}>Inactive</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Permissions">
                        <div className="p-4 bg-gray-50 rounded-lg border max-h-[300px] overflow-auto">
                            <Tree
                                checkable
                                defaultExpandAll
                                treeData={treeData}
                                checkedKeys={checkedKeys}
                                onCheck={(keys) => setCheckedKeys(Array.isArray(keys) ? keys : (keys as any).checked)}
                            />
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
