import React, { useState } from 'react';
import { Card, Table, Button, Form, Input, Modal, Tag, Rate, Space, message, Tabs, Divider } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { DevPlan, User } from '../../store/useAppStore';

const { TextArea } = Input;
const { TabPane } = Tabs;

const DevPlanPage: React.FC = () => {
    const { devPlans, addDevPlan, updateDevPlan, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<DevPlan | null>(null);
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('my_plans');

    // Filter plans based on role
    // For Staff: Show only their plans
    // For M1/Admin: Show all plans (or filter by team in real app)
    const myPlans = devPlans.filter(p => p.staffId === currentUser.id);
    const pendingReviewPlans = devPlans.filter(p => p.status === 'Submitted' && ['M1', 'M2', 'Admin'].includes(currentUser.role));

    const handleCreate = () => {
        setEditingPlan(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (plan: DevPlan) => {
        setEditingPlan(plan);
        form.setFieldsValue(plan);
        setIsModalOpen(true);
    };

    const handleSubmit = (values: any) => {
        if (editingPlan) {
            // Edit existing
            if (currentUser.role === 'Staff' && editingPlan.status === 'Draft') {
                updateDevPlan(editingPlan.id, { ...values, status: 'Submitted' });
                message.success('Plan submitted for review');
            } else if (['M1', 'M2', 'Admin'].includes(currentUser.role)) {
                // Manager Evaluation
                updateDevPlan(editingPlan.id, {
                    ...values, // Manager comments/rating
                    status: 'Evaluated'
                });
                message.success('Plan evaluated');
            } else if (currentUser.role === 'Staff' && editingPlan.status === 'Evaluated') {
                // Staff Confirm
                updateDevPlan(editingPlan.id, { status: 'Confirmed' });
                message.success('Plan confirmed');
            }
        } else {
            // Create New
            const newPlan: DevPlan = {
                id: `dp-${Date.now()}`,
                staffId: currentUser.id,
                staffName: currentUser.name,
                month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                objectives: values.objectives,
                keyResults: values.keyResults,
                status: 'Submitted', // Direct submit for demo
            };
            addDevPlan(newPlan);
            message.success('New Development Plan created');
        }
        setIsModalOpen(false);
    };

    const columns = [
        { title: 'Month', dataIndex: 'month', key: 'month' },
        {
            title: 'Staff Name',
            dataIndex: 'staffName',
            key: 'staffName',
            hidden: currentUser.role === 'Staff'
        },
        { title: 'Objectives', dataIndex: 'objectives', key: 'objectives', ellipsis: true },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => {
                let color = 'default';
                if (s === 'Submitted') color = 'processing';
                if (s === 'Evaluated') color = 'warning';
                if (s === 'Confirmed') color = 'success';
                return <Tag color={color}>{s}</Tag>;
            }
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (r: number) => <Rate disabled defaultValue={r} count={5} />
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: DevPlan) => {
                if (currentUser.role === 'Staff') {
                    if (record.status === 'Evaluated') {
                        return <Button size="small" type="primary" onClick={() => {
                            updateDevPlan(record.id, { status: 'Confirmed' });
                            message.success('Plan Confirmed!');
                        }}>Confirm</Button>;
                    }
                    return <Tag>View Only</Tag>;
                } else {
                    // Manager
                    return record.status === 'Submitted' ?
                        <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Evaluate</Button>
                        : <Tag>Done</Tag>;
                }
            }
        }
    ].filter(c => !c.hidden);

    return (
        <div className="space-y-6">
            <Card bordered={false} className="shadow-sm">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="My Plans" key="my_plans">
                        <div className="mb-4">
                            {currentUser.role === 'Staff' && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                                    Create Monthly Plan
                                </Button>
                            )}
                        </div>
                        <Table dataSource={myPlans} columns={columns} rowKey="id" />
                    </TabPane>

                    {['M1', 'M2', 'Admin'].includes(currentUser.role) && (
                        <TabPane tab={`Pending Review (${pendingReviewPlans.length})`} key="pending">
                            <Table dataSource={pendingReviewPlans} columns={columns} rowKey="id" />
                        </TabPane>
                    )}
                </Tabs>
            </Card>

            <Modal
                title={editingPlan ? "Evaluate Plan" : "New Development Plan"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="objectives" label="Objectives" rules={[{ required: true }]}>
                        <TextArea rows={3} disabled={!!editingPlan} />
                    </Form.Item>
                    <Form.Item name="keyResults" label="Key Results" rules={[{ required: true }]}>
                        <TextArea rows={3} disabled={!!editingPlan} />
                    </Form.Item>

                    {editingPlan && ['M1', 'Admin'].includes(currentUser.role) && (
                        <>
                            <Divider>Manager Evaluation</Divider>
                            <Form.Item name="managerComments" label="Comments">
                                <TextArea rows={3} />
                            </Form.Item>
                            <Form.Item name="rating" label="Rating">
                                <Rate />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default DevPlanPage;
