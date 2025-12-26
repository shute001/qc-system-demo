import React, { useState } from 'react';
import { Table, Card, Select, Button, Space, Tag, message, Tabs, Badge } from 'antd';
import { ReloadOutlined, PlusOutlined, AuditOutlined, ExclamationCircleOutlined, CheckCircleOutlined, EditOutlined, HistoryOutlined, FileProtectOutlined } from '@ant-design/icons';
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

interface SamplingPageProps {
    initialTab?: string;
}

const SamplingPage: React.FC<SamplingPageProps> = ({ initialTab }) => {
    const { qcRecords, addQCRecord, currentUser, setView, setActiveQCRecord } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [selectedSourceKeys, setSelectedSourceKeys] = useState<React.Key[]>([]);

    if (!currentUser) return null;

    const roles = currentUser.roles.map(r => r.roleName);
    const isManager = roles.some(r => ['Admin', 'M1', 'M2'].includes(r));
    const isStaff = roles.includes('Staff');

    // -- Filter Records --
    const inboxData = qcRecords.filter(r => r.status === 'Pending QC');
    const outboxData = qcRecords.filter(r => r.status === 'Wait Staff Confirm');
    const historyData = qcRecords.filter(r => r.status === 'Completed');
    const disputeData = qcRecords.filter(r => r.status === 'Dispute');
    const draftData = qcRecords.filter(r => r.status === 'Draft');
    const myTasksData = qcRecords.filter(r => (r.status === 'Wait Staff Confirm' || r.status === 'Dispute') && r.agentId === currentUser.id);

    const handleNavigateToDetail = (record: QCRecord) => {
        setActiveQCRecord(record.id);
        setView('qc-detail');
    };

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
                    agentId: 'user-staff-id', // Use a real mock user ID
                    agentName: src.agentName,
                    qcType: src.qcType,
                    type: 'Manual Sample',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Pending QC' as const,
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
                agentId: 'user-staff-id',
                agentName: 'Alice Staff',
                qcType: Math.random() > 0.5 ? 'Call' : 'Data',
                type: 'Random Sample',
                date: new Date().toISOString().split('T')[0],
                status: 'Pending QC' as const,
            }));
            newRecords.forEach(r => addQCRecord(r));
            setLoading(false);
            message.success('Random sampling completed based on rules');
        }, 1000);
    };

    // Columns
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
                            <span className="font-semibold text-gray-700">Sampling Mode:</span>
                            <Select defaultValue="manual" style={{ width: 140 }}>
                                <Option value="manual">Manual Selection</Option>
                                <Option value="random">Random Sampling</Option>
                            </Select>
                        </Space>
                        <Space>
                            <Button onClick={handleAddSample} disabled={selectedSourceKeys.length === 0} type="dashed">
                                Process Selected ({selectedSourceKeys.length})
                            </Button>
                            <Button type="primary" onClick={handleRandomSample} loading={loading} icon={<ReloadOutlined />} className="bg-green-600 hover:bg-green-700">
                                Run Auto-Sample Rules
                            </Button>
                        </Space>
                    </div>

                    <Table
                        dataSource={mockSourceData}
                        columns={[
                            { title: 'Case ID', dataIndex: 'caseId', className: 'font-mono' },
                            { title: 'Agent', dataIndex: 'agentName' },
                            { title: 'Type', dataIndex: 'qcType', render: t => <Tag color={t === 'Call' ? 'cyan' : 'blue'}>{t}</Tag> },
                            { title: 'Timestamp', dataIndex: 'date' },
                        ]}
                        rowSelection={{
                            selectedRowKeys: selectedSourceKeys,
                            onChange: (keys) => setSelectedSourceKeys(keys),
                        }}
                        pagination={{ pageSize: 5 }}
                        size="small"
                        title={() => <span className="font-semibold text-gray-600">Available Source Data</span>}
                        className="border rounded-lg overflow-hidden shadow-sm"
                    />
                </div>
            )
        },
        {
            key: 'inbox',
            label: <Badge count={inboxData.length} offset={[10, 0]}><span><AuditOutlined /> Inbox</span></Badge>,
            children: <Table dataSource={inboxData} columns={qcColumns} rowKey="id" className="border rounded-lg shadow-sm" />
        },
        {
            key: 'drafts',
            label: <Badge count={draftData.length} offset={[10, 0]} color="purple"><span><EditOutlined /> Drafts</span></Badge>,
            children: <Table dataSource={draftData} columns={qcColumns} rowKey="id" locale={{ emptyText: 'No draft cases' }} className="border rounded-lg shadow-sm" />
        },
        {
            key: 'outbox',
            label: <span><CheckCircleOutlined /> Outbox</span>,
            children: <Table dataSource={outboxData} columns={qcColumns} rowKey="id" className="border rounded-lg shadow-sm" />
        },
        {
            key: 'dispute',
            label: <Badge count={disputeData.length} offset={[10, 0]} color="red"><span><ExclamationCircleOutlined /> Disputes</span></Badge>,
            children: <Table dataSource={disputeData} columns={qcColumns} rowKey="id" className="border rounded-lg shadow-sm" />
        },
        {
            key: 'history',
            label: <span><HistoryOutlined /> History</span>,
            children: <Table dataSource={historyData} columns={qcColumns} rowKey="id" className="border rounded-lg shadow-sm" />
        }] : []),

        ...(isStaff ? [{
            key: 'my-tasks',
            label: <Badge count={myTasksData.length} offset={[10, 0]}><span><AuditOutlined /> My Actions</span></Badge>,
            children: <Table dataSource={myTasksData} columns={qcColumns} rowKey="id" className="border rounded-lg shadow-sm" />
        }] : [])
    ];

    const handleTabChange = (key: string) => {
        const viewMap: Record<string, string> = {
            'sampling': 'qc-sampling',
            'inbox': 'qc-inbox',
            'drafts': 'qc-drafts',
            'outbox': 'qc-outbox',
            'dispute': 'qc-dispute',
            'history': 'qc-history',
            'my-tasks': 'my-qc-action'
        };
        const targetView = viewMap[key];
        if (targetView) setView(targetView);
    };

    const activeKey = initialTab || (isStaff ? 'my-tasks' : 'inbox');

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <FileProtectOutlined className="text-xl text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Quality Control Hub</h2>
                    <p className="text-gray-500 text-sm">Manage cases through the full sampling and review lifecycle.</p>
                </div>
            </div>
            <Card bordered={false} className="shadow-md rounded-xl">
                <Tabs activeKey={activeKey} items={items} onChange={handleTabChange} className="px-2" />
            </Card>
        </div>
    );
};

export default SamplingPage;
