import React from 'react';
import { Card, Statistic, Row, Col, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppStore } from '../store/useAppStore';

const { Title } = Typography;

const dataVolume = [
    { name: 'Mon', cases: 120 },
    { name: 'Tue', cases: 132 },
    { name: 'Wed', cases: 101 },
    { name: 'Thu', cases: 134 },
    { name: 'Fri', cases: 90 },
    { name: 'Sat', cases: 230 },
    { name: 'Sun', cases: 210 },
];

const dataStatus = [
    { name: 'Pass', value: 850 },
    { name: 'Fail', value: 120 },
    { name: 'Dispute', value: 80 },
];

const COLORS = ['#52c41a', '#f5222d', '#faad14'];

const Dashboard: React.FC = () => {
    const { currentUser } = useAppStore();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-0">Welcome back, {currentUser.name}</Title>
                    <p className="text-gray-500">Here's what's happening in your department today.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Last updated: Just now</p>
                </div>
            </div>

            <Row gutter={16}>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Total QC Cases"
                            value={1128}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Pending Review"
                            value={93}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Pass Rate"
                            value={98.5}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Disputes"
                            value={12}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowDownOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} className="mt-6">
                <Col span={16}>
                    <Card title="Weekly QC Volume" bordered={false} className="shadow-sm">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dataVolume}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="cases" fill="#1890ff" name="QC Cases" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title="QC Result Distribution" bordered={false} className="shadow-sm">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dataStatus}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {dataStatus.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
