import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Tag, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useAppStore, type Process } from '../../store/useAppStore';

const { Option } = Select;

export const ProcessManagement: React.FC = () => {
    const { allProcesses, allBusinesses, addProcess, updateProcess } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<Process | null>(null);
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'Business',
            dataIndex: 'bizCode',
            key: 'bizCode',
            render: (code: string) => <Tag color="blue">{code}</Tag>
        },
        {
            title: 'Process Aid',
            dataIndex: 'procAid',
            key: 'procAid',
            render: (code: string) => <Tag color="cyan">{code}</Tag>
        },
        {
            title: 'Process Name',
            dataIndex: 'procName',
            key: 'procName',
        },
        {
            title: 'Quality Target',
            dataIndex: 'qltyTarget',
            key: 'qltyTarget',
            render: (val: number) => <Tag color={val >= 95 ? 'green' : 'orange'}>{val}%</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: number, record: Process) => (
                <Switch
                    checked={status === 1}
                    onChange={(checked) => {
                        updateProcess(record.id, { status: checked ? 1 : 0 });
                        message.success(`Process ${checked ? 'activated' : 'deactivated'}`);
                    }}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: Process) => (
                <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                >
                    Edit
                </Button>
            )
        }
    ];

    const handleEdit = (proc: Process) => {
        setEditingProcess(proc);
        form.setFieldsValue(proc);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProcess(null);
        form.resetFields();
        form.setFieldsValue({ status: 1, qltyTarget: 95 });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingProcess) {
                updateProcess(editingProcess.id, values);
                message.success('Updated');
            } else {
                addProcess({ ...values, id: `proc-${Date.now()}` });
                message.success('Created');
            }
            setIsModalOpen(false);
        } catch (e) { message.error('Failed to save'); }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-500 font-medium">Configure business lines and quality control processes.</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-green-600 hover:bg-green-700">Add Process</Button>
            </div>
            <Table dataSource={allProcesses} columns={columns} rowKey="id" className="shadow-sm border rounded-lg" />

            <Modal open={isModalOpen} title={editingProcess ? "Edit Process" : "Add Process"} onOk={handleSave} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Business Line" name="bizCode" rules={[{ required: true }]}>
                        <Select>
                            {allBusinesses.map(b => <Option key={b.id} value={b.bizCode}>{b.bizName} ({b.bizCode})</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Process Aid" name="procAid" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Process Name" name="procName" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item label="Quality Target (%)" name="qltyTarget"><InputNumber min={0} max={100} className="w-full" /></Form.Item>
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
