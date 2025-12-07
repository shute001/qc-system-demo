import React, { useState } from 'react';
import { Card, Descriptions, Tag, Button, Space, Typography, Modal, Input, Form, message, Alert, Table } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { QCRecord } from '../../store/useAppStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

const StaffConfirmation: React.FC = () => {
    const { qcRecords, updateQCRecord, currentUser } = useAppStore();
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<QCRecord | null>(null);

    // Filter records: Status 'Wait Staff Confirm', and assigned to current user (mock check)
    // For demo purposes, we might show all 'Wait Staff Confirm' if we are logged in as 'Staff' generic
    const pendingRecords = qcRecords.filter(r => r.status === 'Wait Staff Confirm');

    const handleAccept = (record: QCRecord) => {
        Modal.confirm({
            title: 'Confirm Acceptance',
            content: 'Are you sure you want to accept this QC result? This action cannot be undone.',
            onOk: () => {
                updateQCRecord(record.id, { status: 'Completed' });
                message.success('QC Result accepted.');
                setSelectedRecord(null);
            },
        });
    };

    const handleDisputeSubmit = (values: any) => {
        if (!selectedRecord) return;
        updateQCRecord(selectedRecord.id, {
            status: 'Dispute',
            disputeReason: values.reason
        });
        setIsDisputeModalOpen(false);
        setSelectedRecord(null);
        message.warning('QC Result disputed. Sent to M1 for review.');
    };

    const columns = [
        { title: 'Case ID', dataIndex: 'caseId', key: 'caseId' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Result', dataIndex: 'result', key: 'result', render: (r: string) => <Tag color={r === 'Pass' ? 'green' : 'red'}>{r}</Tag> },
        { title: 'Score', dataIndex: 'score', key: 'score' },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: QCRecord) => (
                <Button icon={<EyeOutlined />} onClick={() => setSelectedRecord(record)}>Review</Button>
            )
        }
    ];

    if (!selectedRecord) {
        return (
            <Card title={`Pending Confirmations (${pendingRecords.length})`} bordered={false} className="shadow-sm">
                <Table dataSource={pendingRecords} columns={columns} rowKey="id" locale={{ emptyText: "No QC results waiting for your confirmation." }} />
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Button onClick={() => setSelectedRecord(null)}>Back to List</Button>
                <div>
                    <Title level={4} className="!mb-0">QC Result: {selectedRecord.caseId}</Title>
                </div>
            </div>

            <Alert
                message="Action Required"
                description="Please review the QC result below and either accept it or raise a dispute."
                type="info"
                showIcon
                className="mb-4"
            />

            <Card title="Evaluation Details" bordered={false} className="shadow-sm">
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="QC Result">
                        <Tag color={selectedRecord.result === 'Pass' ? 'green' : 'red'}>{selectedRecord.result}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Score">
                        <Text strong type={selectedRecord.score! < 80 ? 'danger' : 'success'}>{selectedRecord.score} / 100</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Improvement Outcomes">
                        <Space>
                            {selectedRecord.outcome?.map(o => <Tag key={o}>{o}</Tag>)}
                        </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Evaluator Comments">
                        <div className="whitespace-pre-wrap">{selectedRecord.m1Comments || "No comments."}</div>
                    </Descriptions.Item>
                </Descriptions>

                <div className="flex justify-end gap-4 mt-6">
                    <Button danger onClick={() => setIsDisputeModalOpen(true)}>
                        Dispute
                    </Button>
                    <Button type="primary" onClick={() => handleAccept(selectedRecord)}>
                        Accept & Acknowledge
                    </Button>
                </div>
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
                        description="Only raise a dispute if there is a factual error in the evaluation."
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
