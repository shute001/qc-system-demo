import React from 'react';
import { Card, Typography, List, Tag, Button, Statistic, Row, Col } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useAppStore } from '../store/useAppStore';

const { Title, Text } = Typography;

const Workspace: React.FC = () => {
    const { currentUser, qcRecords, setView, setActiveQCRecord } = useAppStore();

    // -- Filter Actionable Items based on Role --
    const isStaff = currentUser.role === 'Staff';
    const isManagement = ['Admin', 'M1', 'M2'].includes(currentUser.role);

    // -- Management View (Admin/M1/M2): Queue Monitoring --
    if (isManagement) {
        // Calculate M1/M2 Queues
        const inboxCount = qcRecords.filter(r => r.status === 'Pending QC').length;
        const outboxCount = qcRecords.filter(r => r.status === 'Wait Staff Confirm').length;
        const disputeCount = qcRecords.filter(r => r.status === 'Dispute').length;
        const totalCount = qcRecords.length;

        const title = currentUser.role === 'Admin' ? 'System Overview' : 'My Workspace';
        const subTitle = currentUser.role === 'Admin' ? 'Monitor overall system health and queues.' : 'Overview of workflow status.';

        return (
            <div className="space-y-6">
                <div>
                    <Title level={2} className="!mb-0">{title}</Title>
                    <p className="text-gray-500">{subTitle}</p>
                </div>

                <Row gutter={16}>
                    <Col span={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                            <Statistic
                                title="Total QC Records"
                                value={totalCount}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" onClick={() => setView('qc-inbox')}>
                            <Statistic
                                title="Inbox (Pending QC)"
                                value={inboxCount}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                                suffix={<Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setView('qc-inbox'); }} style={{ padding: 0, marginLeft: 8 }}>View</Button>}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" onClick={() => setView('qc-outbox')}>
                            <Statistic
                                title="Outbox (Wait Confirm)"
                                value={outboxCount}
                                prefix={<RightOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                                suffix={<Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setView('qc-outbox'); }} style={{ padding: 0, marginLeft: 8 }}>View</Button>}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow" onClick={() => setView('qc-dispute')}>
                            <Statistic
                                title="Active Disputes"
                                value={disputeCount}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                                suffix={<Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setView('qc-dispute'); }} style={{ padding: 0, marginLeft: 8 }}>View</Button>}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    // -- Manager/Staff View: To-Do List --
    // For Managers: Inbox items (Pending QC)
    // For Staff: Wait Confirm or Dispute items
    const myTasks = qcRecords.filter(r => {
        if (isStaff) {
            return (r.status === 'Wait Staff Confirm' || r.status === 'Dispute') && r.agentId === currentUser.id;
        } else {
            return r.status === 'Pending QC';
        }
    });

    const pendingCount = myTasks.length;

    const handleProcess = (id: string, view: string) => {
        // Staff go directly to key for specific tab if needed, but for now we direct to detail
        setActiveQCRecord(id);
        setView('qc-detail');
    };

    const handleViewList = () => {
        setView('my-qc-action');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-0">My Workspace</Title>
                    <p className="text-gray-500">Welcome back, {currentUser.name}. You have {pendingCount} items requiring attention.</p>
                </div>
                <div className="text-right">
                    <Text type="secondary">{new Date().toLocaleDateString()}</Text>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Pending Tasks"
                            value={pendingCount}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: pendingCount > 0 ? '#faad14' : '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm">
                        <Statistic
                            title="Completed Today"
                            value={3} // Mock
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                title={<span><ClockCircleOutlined className="mr-2" />To-Do List</span>}
                bordered={false}
                className="shadow-sm"
                extra={<Button type="link" onClick={handleViewList}>View All <RightOutlined /></Button>}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={myTasks.slice(0, 5)} // Show top 5
                    renderItem={(item) => (
                        <List.Item
                            actions={[<Button type="link" onClick={() => handleProcess(item.id, '')}>Process</Button>]}
                        >
                            <List.Item.Meta
                                avatar={<Tag color={item.qcType === 'Call' ? 'cyan' : 'blue'}>{item.qcType}</Tag>}
                                title={<a onClick={() => handleProcess(item.id, '')}>{item.caseId}</a>}
                                description={
                                    <span>
                                        <Text strong>{item.type}</Text> - {item.date} {isStaff ? `(Status: ${item.status})` : `(Agent: ${item.agentName})`}
                                    </span>
                                }
                            />
                            <div>
                                <Tag color={item.status === 'Dispute' ? 'red' : 'orange'}>{item.status}</Tag>
                            </div>
                        </List.Item>
                    )}
                    locale={{ emptyText: 'No pending tasks. Great job!' }}
                />
            </Card>
        </div>
    );
};

export default Workspace;
