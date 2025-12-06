import React, { useState } from 'react';
import { Card, Descriptions, Tag, Button, Space, Typography, Modal, Input, Form, message, Alert } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const StaffConfirmation: React.FC = () => {
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const [status, setStatus] = useState<'pending' | 'accepted' | 'disputed'>('pending');

    const handleAccept = () => {
        Modal.confirm({
            title: 'Confirm Acceptance',
            content: 'Are you sure you want to accept this QC result? This action cannot be undone.',
            onOk: () => {
                setStatus('accepted');
                message.success('QC Result accepted.');
            },
        });
    };

    const handleDisputeSubmit = (values: any) => {
        console.log('Dispute reason:', values);
        setStatus('disputed');
        setIsDisputeModalOpen(false);
        message.warning('QC Result disputed. Sent to M1 for review.');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={4} className="!mb-0">QC Result Confirmation: CS-2023001</Title>
                    <Text type="secondary">Please review the evaluation from your team leader.</Text>
                </div>
                <div>
                    {status === 'accepted' && <Tag color="success" icon={<CheckCircleOutlined />}>Accepted</Tag>}
                    {status === 'disputed' && <Tag color="warning" icon={<ExclamationCircleOutlined />}>Disputed</Tag>}
                    {status === 'pending' && <Tag color="processing">Action Required</Tag>}
                </div>
            </div>

            {status === 'pending' && (
                <Alert
                    message="Action Required"
                    description="Please review the QC result below and either accept it or raise a dispute within 24 hours."
                    type="info"
                    showIcon
                    className="mb-4"
                />
            )}

            <Card title="Evaluation Details" bordered={false} className="shadow-sm">
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="QC Result">
                        <Tag color="red">Fail</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Score">
                        <Text strong type="danger">75 / 100</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Improvement Outcomes">
                        <Space>
                            <Tag>Process Adherence</Tag>
                            <Tag>Product Knowledge</Tag>
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Evaluator Comments">
                        <div className="whitespace-pre-wrap">
                            The agent failed to verify the customer's identity before discussing account details.
                            This is a critical compliance failure.
                            Also, the product explanation was slightly inaccurate regarding the pro-ration policy.
                        </div>
                    </Descriptions.Item>
                </Descriptions>

                {status === 'pending' && (
                    <div className="flex justify-end gap-4 mt-6">
                        <Button danger onClick={() => setIsDisputeModalOpen(true)}>
                            Dispute
                        </Button>
                        <Button type="primary" onClick={handleAccept}>
                            Accept & Acknowledge
                        </Button>
                    </div>
                )}
            </Card>

            <Modal
                title="Raise Dispute"
                open={isDisputeModalOpen}
                onCancel={() => setIsDisputeModalOpen(false)}
                footer={null}
            >
                <Form layout="vertical" onFinish={handleDisputeSubmit}>
                    <Alert
                        message="Dispute Policy"
                        description="Only raise a dispute if there is a factual error in the evaluation. Subjective disagreements may be rejected."
                        type="warning"
                        showIcon
                        className="mb-4"
                    />
                    <Form.Item
                        name="reason"
                        label="Reason for Dispute"
                        rules={[{ required: true, message: 'Please provide a reason' }]}
                    >
                        <TextArea rows={4} placeholder="Explain why this evaluation is incorrect..." />
                    </Form.Item>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsDisputeModalOpen(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            Submit Dispute
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default StaffConfirmation;
