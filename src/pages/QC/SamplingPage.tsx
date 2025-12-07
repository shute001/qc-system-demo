import React, { useState } from 'react';
import { Table, Card, Form, Select, DatePicker, Button, Space, Tag, message, Tabs, Badge } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, AuditOutlined, ExclamationCircleOutlined, CheckCircleOutlined, EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { useAppStore } from '../../store/useAppStore';
import type { QCRecord } from '../../store/useAppStore';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

// Mock Source Data for Sampling
interface QCSourceData {
    key: string;
    caseId: string;
    agentName: string;
    qcType: 'Data' | 'Call';
    date: string;
    status: string;
}

const mockSourceData: QCSourceData[] = Array.from({ length: 20 }).map((_, i) => ({
    key: i.toString(),
    caseId: `SRC-${2023001 + i}`,
    agentName: ['Alice Staff', 'Bob Staff', 'Charlie Staff', 'Diana Staff'][i % 4],
    qcType: i % 3 === 0 ? 'Call' : 'Data',
    date: '2023-10-26',
    status: 'Ready for QC',
}));

const SamplingPage: React.FC = () => {
    const { qcRecords, addQCRecord, currentUser, setActiveQCRecord, setView, samplingRules } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [selectedSourceKeys, setSelectedSourceKeys] = useState<React.Key[]>([]);

    const isManager = ['Admin', 'M1', 'M2'].includes(currentUser.role);
    const isStaff = currentUser.role === 'Staff';

    // -- Filter Records --
    // Inbox: Pending QC
    const inboxData = qcRecords.filter(r => r.status === 'Pending QC');

    // Outbox: Wait Staff Confirm (Removed 'Completed' from here)
    const outboxData = qcRecords.filter(r => r.status === 'Wait Staff Confirm');

    // History: Completed
    const historyData = qcRecords.filter(r => r.status === 'Completed');

    // Dispute Box
    const disputeData = qcRecords.filter(r => r.status === 'Dispute');

    // Draft Box
    const draftData = qcRecords.filter(r => r.status === 'Draft');

    // Staff My Tasks
    const myTasksData = qcRecords.filter(r => (r.status === 'Wait Staff Confirm' || r.status === 'Dispute') && r.agentId === currentUser.id);

    const handleNavigateToDetail = (record: QCRecord) => {
        setActiveQCRecord(record.id);
        setView('qc-detail');
    };

    // -- Actions --
    const handleAddSample = () => {
        if (selectedSourceKeys.length === 0) {
            message.warning('Please select records to sample');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const newRecords: QCRecord[] = selectedSourceKeys.map(k => {
                const src = mockSourceData.find(s => s.key === k)!;
                return {
                    id: `qc-new-${Date.now()}-${k}`,
                    caseId: src.caseId,
                    agentId: 'u1',
                    agentName: src.agentName,
                    qcType: src.qcType,
                    type: 'Manual Sample',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pending QC',
                };
            });
            newRecords.forEach(r => addQCRecord(r));
            setSelectedSourceKeys([]);
            setLoading(false);
            message.success(`Added ${newRecords.length} records to Inbox`);
        }, 800);
    };

    const handleRandomSample = () => {
        setLoading(true);
        setTimeout(() => {
            const newRecords: QCRecord[] = Array.from({ length: 3 }).map((_, i) => ({
                id: `random-${Date.now()}-${i}`,
                caseId: `RND-${Date.now()}-${i}`,
                agentId: 'u1',
                agentName: 'Alice Staff',
                qcType: Math.random() > 0.5 ? 'Call' : 'Data',
                type: 'Random Sample',
                date: new Date().toISOString().split('T')[0],
                status: 'Pending QC',
            }));
            newRecords.forEach(r => addQCRecord(r));
            setLoading(false);
            message.success('Random sampling completed based on rules');
        }, 1000);
    };

    // -- Columns --
    const qcColumns: ColumnsType<QCRecord> = [
        {
            title: 'Case ID',
            dataIndex: 'caseId',
            key: 'caseId',
            render: (text, record) => (
                <a onClick={() => handleNavigateToDetail(record)} className="text-primary font-medium hover:underline">
                    {text}
                </a>
            ),
        },
        { title: 'Agent Name', dataIndex: 'agentName', key: 'agentName' },
        {
            title: 'QC Type',
            dataIndex: 'qcType',
            key: 'qcType',
            render: (t) => <Tag color={t === 'Call' ? 'cyan' : 'blue'}>{t}</Tag>
        },
        { title: 'Type', dataIndex: 'type', key: 'type' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (s) => {
                let color = 'default';
                if (s === 'Pending QC') color = 'orange';
                if (s === 'Draft') color = 'purple';
                if (s === 'Wait Staff Confirm') color = 'processing';
                if (s === 'Dispute') color = 'error';
                if (s === 'Completed') color = 'success';
                return <Tag color={color}>{s}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button type="link" size="small" onClick={() => handleNavigateToDetail(record)}>
                    {record.status === 'Draft' ? 'Continue Edit' : 'View / Process'}
                </Button>
            )
        }
    ];

    const items = [
        ...(isManager ? [{
            key: 'sampling',
            label: <span><PlusOutlined /> Sampling</span>,
            children: (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <Space>
                            <span className="font-semibold">Sampling Mode:</span>
                            <Select defaultValue="manual" style={{ width: 120 }}>
                                <Option value="manual">Manual Pick</Option>
                                <Option value="random">Random Rule</Option>
                            </Select>
                        </Space>
                        <Space>
                            <Button onClick={handleAddSample} disabled={selectedSourceKeys.length === 0}>
                                Add Selected to Inbox
                            </Button>
                            <Button type="primary" onClick={handleRandomSample} loading={loading} icon={<ReloadOutlined />}>
                                Auto Sample (Run Rules)
                            </Button>
                        </Space>
                    </div>

                    <Table
                        dataSource={mockSourceData}
                        columns={[
                            { title: 'Case ID', dataIndex: 'caseId' },
                            { title: 'Agent', dataIndex: 'agentName' },
                            { title: 'Type', dataIndex: 'qcType', render: t => <Tag>{t}</Tag> },
                            { title: 'Date', dataIndex: 'date' },
                        ]}
                        rowSelection={{
                            selectedRowKeys: selectedSourceKeys,
                            onChange: (keys) => setSelectedSourceKeys(keys),
                        }}
                        pagination={{ pageSize: 5 }}
                        size="small"
                        title={() => 'Source Data Pool'}
                    />
                </div>
            )
        },
        {
            key: 'inbox',
            label: <Badge count={inboxData.length} offset={[10, 0]}><span><AuditOutlined /> Inbox (To QC)</span></Badge>,
            children: <Table dataSource={inboxData} columns={qcColumns} rowKey="id" />
        },
        {
            key: 'drafts',
            label: <Badge count={draftData.length} offset={[10, 0]} color="purple"><span><EditOutlined /> Draft Box</span></Badge>,
            children: <Table dataSource={draftData} columns={qcColumns} rowKey="id" locale={{ emptyText: 'No drafts found' }} />
        },
        {
            key: 'outbox',
            label: <span><CheckCircleOutlined /> Outbox (Wait Confirm)</span>,
            children: <Table dataSource={outboxData} columns={qcColumns} rowKey="id" />
        },
        {
            key: 'dispute',
            label: <Badge count={disputeData.length} offset={[10, 0]} color="red"><span><ExclamationCircleOutlined /> Dispute Box</span></Badge>,
            children: <Table dataSource={disputeData} columns={qcColumns} rowKey="id" />
        },
        {
            key: 'history',
            label: <span><HistoryOutlined /> History (Completed)</span>,
            children: <Table dataSource={historyData} columns={qcColumns} rowKey="id" />
        }] : []),

        ...(isStaff ? [{
            key: 'my-tasks',
            label: <Badge count={myTasksData.length} offset={[10, 0]}><span><AuditOutlined /> My QC Actions</span></Badge>,
            children: <Table dataSource={myTasksData} columns={qcColumns} rowKey="id" />
        }] : [])
    ];

    return (
        <Card bordered={false} className="shadow-sm">
            <Tabs defaultActiveKey={isStaff ? 'my-tasks' : 'inbox'} items={items} />
        </Card>
    );
};

export default SamplingPage;
