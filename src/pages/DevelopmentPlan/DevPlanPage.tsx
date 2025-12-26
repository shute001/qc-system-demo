import React, { useState } from 'react';
import { Card, Table, Button, Form, Input, Modal, Tag, Rate, message, Tabs, Divider } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { DevPlan } from '../../store/useAppStore';

const { TextArea } = Input;
const { TabPane } = Tabs;

const DevPlanPage: React.FC = () => {
    const { devPlans, addDevPlan, updateDevPlan, currentUser } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<DevPlan | null>(null);
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState('my_plans');

    if (!currentUser) return null;

    const roleNames = currentUser.roles.map(rn => rn.roleName);
    const isManager = roleNames.some(rn => ['Admin', 'M1', 'M2'].includes(rn));
    const isStaff = roleNames.includes('Staff');

    // Filter plans based on role
    const myPlans = devPlans.filter(p => p.staffId === currentUser.staffId);
    const pendingReviewPlans = devPlans.filter(p => p.status === 'Submitted' && isManager);

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
            if (isStaff && editingPlan.status === 'Draft') {
                updateDevPlan(editingPlan.id, { ...values, status: 'Submitted' });
                message.success('Plan submitted for review');
            } else if (isManager) {
                updateDevPlan(editingPlan.id, { ...values, status: 'Evaluated' });
                message.success('Plan evaluated');
            } else if (isStaff && editingPlan.status === 'Evaluated') {
                updateDevPlan(editingPlan.id, { status: 'Confirmed' });
                message.success('Plan confirmed');
            }
        } else {
            const newPlan: DevPlan = {
                id: `dp-${Date.now()}`,
                staffId: currentUser.staffId,
                staffName: currentUser.staffName,
                month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                objectives: values.objectives,
                keyResults: values.keyResults,
                status: 'Submitted',
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
            hidden: isStaff
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
                if (isStaff) {
                    if (record.status === 'Evaluated') {
                        return <Button size="small" type="primary" onClick={() => {
                            updateDevPlan(record.id, { status: 'Confirmed' });
                            message.success('Plan Confirmed!');
                        }}>Confirm</Button>;
                    }
                    return <Tag>View Only</Tag>;
                } else {
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
                            {isStaff && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                                    Create Monthly Plan
                                </Button>
                            )}
                        </div>
                        <Table dataSource={myPlans} columns={columns} rowKey="id" />
                    </TabPane>

                    {isManager && (
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

                    {editingPlan && isManager && (
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
