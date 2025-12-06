import React, { useState } from 'react';
import { Table, Card, Form, Select, DatePicker, Button, Space, Tag, message } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface QCSourceData {
    key: string;
    caseId: string;
    agentName: string;
    type: string;
    date: string;
    status: string;
}

const mockData: QCSourceData[] = Array.from({ length: 20 }).map((_, i) => ({
    key: i.toString(),
    caseId: `CS-${2023001 + i}`,
    agentName: ['Alice Smith', 'Bob Jones', 'Charlie Brown', 'Diana Prince'][i % 4],
    type: ['Inquiry', 'Complaint', 'Technical Support', 'Billing'][i % 4],
    date: '2023-10-26',
    status: 'Pending QC',
}));

const SamplingPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);

    const columns: ColumnsType<QCSourceData> = [
        {
            title: 'Case ID',
            dataIndex: 'caseId',
            key: 'caseId',
            render: (text) => <a className="text-primary font-medium">{text}</a>,
        },
        {
            title: 'Agent Name',
            dataIndex: 'agentName',
            key: 'agentName',
        },
        {
            title: 'Case Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                let color = 'blue';
                if (type === 'Complaint') color = 'red';
                if (type === 'Billing') color = 'gold';
                return <Tag color={color}>{type}</Tag>;
            },
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag>{status}</Tag>,
        },
    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    const handleAddToSample = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSelectedRowKeys([]);
            message.success(`${selectedRowKeys.length} cases added to QC task list successfully`);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <Card bordered={false} className="shadow-sm">
                <Form layout="inline" className="gap-y-4">
                    <Form.Item label="Case Type" name="type" className="w-48">
                        <Select placeholder="Select type" allowClear>
                            <Option value="inquiry">Inquiry</Option>
                            <Option value="complaint">Complaint</Option>
                            <Option value="tech">Technical Support</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Time Range" name="date">
                        <RangePicker />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />}>
                                Search
                            </Button>
                            <Button icon={<ReloadOutlined />}>Reset</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card
                title={
                    <div className="flex justify-between items-center">
                        <span>Source Data Pool</span>
                        <Space>
                            <span className="text-gray-500 text-sm font-normal">
                                {selectedRowKeys.length} selected
                            </span>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                disabled={selectedRowKeys.length === 0}
                                loading={loading}
                                onClick={handleAddToSample}
                            >
                                Add to Sample
                            </Button>
                        </Space>
                    </div>
                }
                bordered={false}
                className="shadow-sm"
            >
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={mockData}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default SamplingPage;
