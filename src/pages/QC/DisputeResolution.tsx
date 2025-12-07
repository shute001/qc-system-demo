import React, { useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Divider, Form, Radio, Input, Button, message, Alert, Table, InputNumber, Tag } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { QCRecord } from '../../store/useAppStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DisputeResolution: React.FC = () => {
    const { qcRecords, updateQCRecord } = useAppStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<QCRecord | null>(null);

    const disputedRecords = qcRecords.filter(r => r.status === 'Dispute');

    const handleFinish = (values: any) => {
        if (!selectedRecord) return;
        setLoading(true);
        setTimeout(() => {
            updateQCRecord(selectedRecord.id, {
                status: 'Wait Staff Confirm', // Send back to staff
                score: values.decision === 'revise' ? values.newScore : selectedRecord.score,
                m1Comments: values.comments // M1 updates comments
            });
            setLoading(false);
            setSelectedRecord(null);
            message.success('Dispute resolved. Sent back to staff for confirmation.');
        }, 1000);
    };

    const columns = [
        { title: 'Case ID', dataIndex: 'caseId', key: 'caseId' },
        { title: 'Agent', dataIndex: 'agentName', key: 'agentName' },
        { title: 'Dispute Reason', dataIndex: 'disputeReason', key: 'reason', ellipsis: true },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: QCRecord) => (
                <Button icon={<EyeOutlined />} onClick={() => setSelectedRecord(record)}>Resolve</Button>
            )
        }
    ];

    if (!selectedRecord) {
        return (
            <Card title={`Disputed Cases (${disputedRecords.length})`} bordered={false} className="shadow-sm">
                <Table dataSource={disputedRecords} columns={columns} rowKey="id" locale={{ emptyText: "No disputed cases found." }} />
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button icon={<ArrowLeftOutlined />} onClick={() => setSelectedRecord(null)} />
                <div>
                    <Title level={4} className="!mb-0">Dispute Resolution: {selectedRecord.caseId}</Title>
                    <Text type="secondary">Reviewing dispute from Agent: {selectedRecord.agentName}</Text>
                </div>
            </div>

            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Original Evaluation & Dispute" bordered={false} className="shadow-sm h-full">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Original Score">
                                <Text type={selectedRecord.score! < 80 ? 'danger' : 'success'} strong>{selectedRecord.score} / 100</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="QC Comments">
                                {selectedRecord.m1Comments}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Agent's Dispute</Divider>
                        <Alert
                            message="Dispute Reason"
                            description={selectedRecord.disputeReason}
                            type="warning"
                            showIcon
                            className="mb-4"
                        />
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Final Decision" bordered={false} className="shadow-sm h-full">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                            initialValues={{
                                decision: 'uphold', // default
                                comments: selectedRecord.m1Comments // pre-fill with old comments
                            }}
                        >
                            <Form.Item
                                name="decision"
                                label="Decision"
                                rules={[{ required: true }]}
                            >
                                <Radio.Group buttonStyle="solid" className="w-full">
                                    <Radio.Button value="uphold" className="w-1/2 text-center">Uphold Score</Radio.Button>
                                    <Radio.Button value="revise" className="w-1/2 text-center">Revise Score</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                noStyle
                                shouldUpdate={(prev, current) => prev.decision !== current.decision}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('decision') === 'revise' ? (
                                        <Form.Item
                                            name="newScore"
                                            label="New Score"
                                            rules={[{ required: true, message: 'Please enter new score' }]}
                                        >
                                            <InputNumber min={0} max={100} className="w-full" />
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>

                            <Form.Item
                                name="comments"
                                label="Resolution Comments (Updated)"
                                rules={[{ required: true, message: 'Please provide explanation' }]}
                            >
                                <TextArea rows={6} placeholder="Update comments for the agent..." />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block icon={<CheckCircleOutlined />}>
                                    Submit Resolution & Return to Staff
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DisputeResolution;
