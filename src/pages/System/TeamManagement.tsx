import React, { useState } from 'react';
import { Tabs, Table, Button, Card, Tag, Switch, InputNumber, Form, Modal, Input, Select, message } from 'antd';
import { UserOutlined, SettingOutlined, SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { User, Role } from '../../store/useAppStore';

const { TabPane } = Tabs;
const { Option } = Select;

interface TeamManagementProps {
    initialTab?: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ initialTab = 'structure' }) => {
    const { staffList, setView } = useAppStore();

    // -- Tab Sync Logic --
    const handleTabChange = (key: string) => {
        const viewMap: Record<string, string> = {
            'structure': 'team-structure',
            'access': 'access-mgmt',
            'rules': 'sampling-rules',
        };
        const targetView = viewMap[key];
        if (targetView) {
            setView(targetView);
        }
    };

    // -- Tab 1: Team Structure --
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Mock columns for Staff
    const structureColumns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Department', dataIndex: 'department', key: 'department', render: (t: string) => t || 'N/A' },
        { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color="blue">{r}</Tag> },
    ];

    const handleAddStaff = () => {
        message.success('Staff added (Mock)');
        setIsAddModalOpen(false);
    };

    // -- Tab 2: Access Management --
    const accessColumns = [
        { title: 'Role', dataIndex: 'role', key: 'role', render: (r: string) => <Tag color="geekblue">{r}</Tag> },
        {
            title: 'QC Module',
            key: 'qc',
            render: (_: any, record: any) => (
                <Switch defaultChecked={['M1', 'Staff'].includes(record.role)} disabled />
            )
        },
        {
            title: 'Team Mgmt',
            key: 'team',
            render: (_: any, record: any) => (
                <Switch defaultChecked={record.role === 'Admin'} disabled />
            )
        },
        {
            title: 'Dev Plan',
            key: 'dev',
            render: (_: any, record: any) => (
                <Switch defaultChecked={['M1', 'Staff'].includes(record.role)} disabled />
            )
        },
    ];

    const accessData = [
        { key: '1', role: 'Staff' },
        { key: '2', role: 'M1' },
        { key: '3', role: 'Admin' },
    ];

    // -- Tab 3: Sampling Rules --
    const { samplingRules, updateSamplingRules } = useAppStore();
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

                    <TabPane tab={<span><UserOutlined />Team Structure</span>} key="structure">
                        <div className="mb-4 flex justify-between">
                            <span className="text-gray-500">Manage all staff members and hierarchy.</span>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalOpen(true)}>
                                Add Staff
                            </Button>
                        </div>
                        <Table dataSource={staffList} columns={structureColumns} rowKey="id" />
                    </TabPane>

                    <TabPane tab={<span><SafetyCertificateOutlined />Access Management</span>} key="access">
                        <div className="mb-4 text-gray-500">Configure module access for different roles.</div>
                        <Table dataSource={accessData} columns={accessColumns} pagination={false} />
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

            <Modal title="Add New Staff" open={isAddModalOpen} onOk={handleAddStaff} onCancel={() => setIsAddModalOpen(false)}>
                <Form layout="vertical">
                    <Form.Item label="Name"><Input /></Form.Item>
                    <Form.Item label="ID"><Input /></Form.Item>
                    <Form.Item label="Role">
                        <Select>
                            <Option value="Staff">Staff</Option>
                            <Option value="M1">M1</Option>
                            <Option value="M2">M2</Option>
                            <Option value="Admin">Admin</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Reports To (Line Manager ID)">
                        <Select>
                            {staffList.filter(u => ['M1', 'M2'].includes(u.role)).map(u => (
                                <Option key={u.id} value={u.id}>{u.name} ({u.role})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeamManagement;
