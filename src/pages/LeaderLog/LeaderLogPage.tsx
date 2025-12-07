import React, { useState } from 'react';
import { Card, Table, Button, Form, Input, Modal, DatePicker, message, List, Avatar } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { LeaderLog } from '../../store/useAppStore';

const { TextArea } = Input;

const LeaderLogPage: React.FC = () => {
    const { leaderLogs, addLeaderLog } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        const newLog: LeaderLog = {
            id: `log-${Date.now()}`,
            date: values.date.format('YYYY-MM-DD'),
            attendees: values.attendees.split(',').map((s: string) => s.trim()),
            topic: values.topic,
            content: values.content,
            actionItems: values.actionItems,
        };
        addLeaderLog(newLog);
        message.success('Meeting log saved');
        setIsModalOpen(false);
        form.resetFields();
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Topic', dataIndex: 'topic', key: 'topic' },
        { title: 'Attendees', dataIndex: 'attendees', key: 'attendees', render: (a: string[]) => a.join(', ') },
        { title: 'Action Items', dataIndex: 'actionItems', key: 'actionItems', ellipsis: true },
    ];

    return (
        <div className="space-y-6">
            <Card
                title="Leader's Meeting Logs"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>New Record</Button>}
                bordered={false}
                className="shadow-sm"
            >
                <Table dataSource={leaderLogs} columns={columns} rowKey="id" locale={{ emptyText: "No meeting logs recorded." }} />
            </Card>

            <Modal
                title="New Meeting Record"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="topic" label="Meeting Topic" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Weekly Sync" />
                    </Form.Item>
                    <Form.Item name="attendees" label="Attendees (comma separated)" rules={[{ required: true }]}>
                        <Input placeholder="Alice, Bob, Charlie" />
                    </Form.Item>
                    <Form.Item name="content" label="Content / Minutes" rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="actionItems" label="Action Items">
                        <TextArea rows={2} placeholder="To-do list..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LeaderLogPage;
