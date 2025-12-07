import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Divider, Form, Radio, Input, InputNumber, Button, Space, message, Select, Tabs, Tag, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckOutlined, StopOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const QCDetail: React.FC = () => {
    const { activeQCRecordId, qcRecords, updateQCRecord, currentUser, setView, setActiveQCRecord } = useAppStore();
    const [activeTab, setActiveTab] = useState('datainfo');
    const [form] = Form.useForm();
    const [staffForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Find active record
    const activeCase = qcRecords.find(r => r.id === activeQCRecordId);

    // Redirect if no case selected
    useEffect(() => {
        if (!activeCase) {
            setView('qc');
        } else {
            // Init forms
            form.setFieldsValue({
                checkingTime: activeCase.checkingTime || dayjs().format('YYYY-MM-DD HH:mm'),
                hasError: activeCase.hasError,
                errorType: activeCase.errorType,
                m1Comments: activeCase.m1Comments,
                result: activeCase.result || 'Pass',
                score: activeCase.score ?? 100,
                outcome: activeCase.outcome,
                remediation: activeCase.remediation,
            });
            staffForm.setFieldsValue({
                staffComments: activeCase.staffComments,
                disputeReason: activeCase.disputeReason,
            });
        }
    }, [activeCase, setView, form, staffForm]);

    // Handle Save Draft
    const handleSaveDraft = () => {
        if (!activeCase) return;
        const values = form.getFieldsValue();
        setLoading(true);
        setTimeout(() => {
            updateQCRecord(activeCase.id, {
                ...values,
                status: 'Draft',
            });
            setLoading(false);
            message.success('QC Evaluation saved as Draft.');
            // Go back to list
            handleBack();
        }, 800);
    };

    if (!activeCase) return null;

    // --- Role & Status Logic ---
    const isPendingQC = activeCase.status === 'Pending QC';
    const isDraft = activeCase.status === 'Draft';
    const isDispute = activeCase.status === 'Dispute';
    const isWaitConfirm = activeCase.status === 'Wait Staff Confirm';
    const isCompleted = activeCase.status === 'Completed';

    const isM1OrAdmin = ['M1', 'M2', 'Admin'].includes(currentUser.role);
    const isStaff = currentUser.role === 'Staff';
    const isOwner = activeCase.agentId === currentUser.id;

    // Can M1 Edit?
    const canM1Edit = isM1OrAdmin && (isPendingQC || isDispute || isDraft);

    // Can Staff Action?
    const canStaffAction = isStaff && isWaitConfirm && isOwner;

    // --- Handlers ---

    const handleBack = () => {
        setActiveQCRecord(null);
        setView('qc');
    };

    const handleM1Submit = (values: any) => {
        setLoading(true);
        setTimeout(() => {
            updateQCRecord(activeCase.id, {
                ...values,
                status: 'Wait Staff Confirm', // Always goes to staff confirm after M1 submits
            });
            setLoading(false);
            message.success('QC Evaluation submitted. Sent to Staff for confirmation.');
            handleBack();
        }, 1000);
    };

    const handleStaffConfirm = () => {
        setLoading(true);
        const values = staffForm.getFieldsValue();
        setTimeout(() => {
            updateQCRecord(activeCase.id, {
                ...values,
                status: 'Completed',
            });
            setLoading(false);
            message.success('QC Result Confirmed!');
            handleBack();
        }, 1000);
    };

    const handleStaffDispute = () => {
        const values = staffForm.getFieldsValue();
        if (!values.disputeReason) {
            message.error('Please provide a reason for dispute.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            updateQCRecord(activeCase.id, {
                ...values,
                status: 'Dispute',
            });
            setLoading(false);
            message.warning('QC Result Disputed. Sent back to Manager.');
            handleBack();
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-white p-4 rounded shadow-sm">
                <div className="flex items-center gap-4">
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>Back</Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Title level={4} className="!mb-0">{activeCase.caseId}</Title>
                            <Tag color={activeCase.status === 'Completed' ? 'green' : 'blue'}>{activeCase.status}</Tag>
                            <Tag>{activeCase.qcType}</Tag>
                        </div>
                        <Text type="secondary">Agent: {activeCase.agentName} | Date: {activeCase.date}</Text>
                    </div>
                </div>
                {isDispute && <Alert type="error" message="This case is currently disputed" showIcon />}
            </div>

            {/* Main Content Form - M1 Edit or ReadOnly */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleM1Submit}
                component={false}
            // Removed disabled={!canM1Edit} from here to prevent cascading to Staff Tab
            >
                <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" className="bg-white p-4 rounded shadow-sm">
                    {/* Tab 1: Data Info */}
                    <TabPane tab="1. Data Info" key="datainfo">
                        <fieldset disabled={!canM1Edit} style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Card title="Interaction Details" size="small" className="mb-4 bg-gray-50">
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Customer">John Doe (VIP)</Descriptions.Item>
                                            <Descriptions.Item label="Duration">12m 30s</Descriptions.Item>
                                            <Descriptions.Item label="Topic">Billing Inquiry</Descriptions.Item>
                                        </Descriptions>
                                        <div className="mt-4 border-t pt-2">
                                            <Text strong>Transcription / Data Preview:</Text>
                                            <div className="mt-2 text-xs text-gray-500 font-mono bg-white p-2 border rounded h-32 overflow-auto">
                                                [00:01] Agent: Hello, thank you for calling...<br />
                                                [00:05] Customer: I have a problem with my bill...<br />
                                                ...
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card title="QC Parameters" size="small">
                                        <Form.Item name="checkingTime" label="Checking Time">
                                            <Input />
                                        </Form.Item>
                                        <Form.Item name="hasError" label="Has Error?">
                                            <Radio.Group>
                                                <Radio value={false}>No</Radio>
                                                <Radio value={true}>Yes</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                        <Form.Item name="errorType" label="Error Type">
                                            <Select allowClear>
                                                <Select.Option value="Critical">Critical</Select.Option>
                                                <Select.Option value="Non-Critical">Non-Critical</Select.Option>
                                                <Select.Option value="Fatal">Fatal</Select.Option>
                                            </Select>
                                        </Form.Item>
                                        <Form.Item name="m1Comments" label="M1 Comments">
                                            <TextArea rows={4} placeholder="Enter comments here..." />
                                        </Form.Item>
                                    </Card>
                                </Col>
                            </Row>
                            <div className="flex justify-end mt-4">
                                <Button type="primary" onClick={() => setActiveTab('result')}>Next Step</Button>
                            </div>
                        </fieldset>
                    </TabPane>

                    {/* Tab 2: Result & Outcome */}
                    <TabPane tab="2. Result & Outcome" key="result">
                        <fieldset disabled={!canM1Edit} style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item name="result" label="Final Result" rules={[{ required: true }]}>
                                        <Radio.Group buttonStyle="solid" className="w-full text-center">
                                            <Radio.Button value="Pass" className="w-1/2">Pass</Radio.Button>
                                            <Radio.Button value="Fail" className="w-1/2">Fail</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="score" label="Quality Score" rules={[{ required: true }]}>
                                        <InputNumber min={0} max={100} className="w-full" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider />
                            <Title level={5}>Rectification & Remediation</Title>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <Form.Item name="outcome" label="Improvement Outcome">
                                        <Select mode="multiple">
                                            <Select.Option value="soft_skills">Soft Skills</Select.Option>
                                            <Select.Option value="process">Process Knowledge</Select.Option>
                                            <Select.Option value="compliance">Compliance</Select.Option>
                                            <Select.Option value="system">System Handling</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="remediation" label="Remediation Actions">
                                        <Select mode="multiple">
                                            <Select.Option value="coaching">1:1 Coaching</Select.Option>
                                            <Select.Option value="training">Retraining</Select.Option>
                                            <Select.Option value="warning">Verbal Warning</Select.Option>
                                            <Select.Option value="pip">PIP</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </fieldset>

                        {canM1Edit && (
                            <>
                                <Divider />
                                <div className="flex justify-end gap-2">
                                    <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={loading}>Save Draft</Button>
                                    <Button type="primary" onClick={() => form.submit()} loading={loading} icon={<CheckOutlined />}>
                                        Submit Evaluation
                                    </Button>
                                </div>
                            </>
                        )}
                    </TabPane>

                    {/* Tab 3: Staff Acknowledgement & Dispute */}
                    <TabPane tab="3. Staff Confirmation" key="confirm">
                        {/* Only show Staff Action Form if Staff & Wait Confirm */}
                        <div className="max-w-2xl mx-auto">
                            {!canStaffAction && !isCompleted && !isDispute && (
                                <Alert message="Waiting for QC submission or not assigned to you." type="info" />
                            )}

                            {(canStaffAction || isCompleted || isDispute) && (
                                <Form form={staffForm} layout="vertical">
                                    <Card title="Staff Acknowledgement" className="border-l-4 border-l-blue-500">
                                        <Form.Item label="Staff Comments" name="staffComments">
                                            <TextArea rows={3} placeholder="Staff replies here..." disabled={!canStaffAction} />
                                        </Form.Item>

                                        {/* Show Dispute Reason if disputed or if disputing */}
                                        <Form.Item label="Dispute Reason (If applicable)" name="disputeReason">
                                            <TextArea rows={3} placeholder="Required only if disputing..." disabled={!canStaffAction} />
                                        </Form.Item>

                                        {canStaffAction && (
                                            <div className="flex gap-4 mt-6">
                                                <Button type="primary" size="large" onClick={handleStaffConfirm} loading={loading} icon={<CheckOutlined />} className="bg-green-600 hover:bg-green-500">
                                                    Acknowledge & Confirm
                                                </Button>
                                                <Button danger size="large" onClick={handleStaffDispute} loading={loading} icon={<StopOutlined />}>
                                                    Raise Dispute
                                                </Button>
                                            </div>
                                        )}
                                    </Card>
                                </Form>
                            )}
                        </div>
                    </TabPane>
                </Tabs>
            </Form>
        </div>
    );
};

export default QCDetail;
