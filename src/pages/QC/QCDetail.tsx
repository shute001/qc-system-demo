import React, { useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Divider, Form, Radio, Input, InputNumber, Button, Space, message, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const QCDetail: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleFinish = (values: any) => {
        setLoading(true);
        console.log('QC Result:', values);
        setTimeout(() => {
            setLoading(false);
            message.success('QC Result saved successfully');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button icon={<ArrowLeftOutlined />} type="text" />
                <div>
                    <Title level={4} className="!mb-0">QC Evaluation: CS-2023001</Title>
                    <Text type="secondary">Agent: Alice Smith | Type: Inquiry</Text>
                </div>
            </div>

            <Row gutter={24}>
                {/* Left Column: Data Info */}
                <Col span={12}>
                    <Card title="Case Information" bordered={false} className="shadow-sm h-full">
                        <Descriptions column={1} bordered>
                            <Descriptions.Item label="Case ID">CS-2023001</Descriptions.Item>
                            <Descriptions.Item label="Customer">John Doe (VIP)</Descriptions.Item>
                            <Descriptions.Item label="Interaction Time">2023-10-26 14:30:00</Descriptions.Item>
                            <Descriptions.Item label="Duration">12m 45s</Descriptions.Item>
                            <Descriptions.Item label="Channel">Voice Call</Descriptions.Item>
                            <Descriptions.Item label="Summary">
                                Customer called regarding a billing discrepancy on the October invoice.
                                Agent explained the pro-rated charges and offered a $10 credit for the inconvenience.
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Transcript Snippet</Divider>
                        <div className="bg-gray-50 p-4 rounded text-sm font-mono h-64 overflow-y-auto border border-gray-100">
                            <p><span className="text-blue-600 font-bold">Agent:</span> Thank you for calling, this is Alice. How can I help you?</p>
                            <p><span className="text-green-600 font-bold">Customer:</span> Hi, my bill is higher than usual.</p>
                            <p><span className="text-blue-600 font-bold">Agent:</span> I can certainly check that for you. One moment please.</p>
                            <p className="text-gray-400 italic">... (silence for 20s) ...</p>
                            <p><span className="text-blue-600 font-bold">Agent:</span> Thanks for waiting. I see the pro-rated charge here...</p>
                        </div>
                    </Card>
                </Col>

                {/* Right Column: QC Result Form */}
                <Col span={12}>
                    <Card title="QC Evaluation" bordered={false} className="shadow-sm h-full">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                            initialValues={{
                                result: 'pass',
                                score: 100,
                            }}
                        >
                            <Form.Item
                                name="result"
                                label="QC Result"
                                rules={[{ required: true }]}
                            >
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value="pass">Pass</Radio.Button>
                                    <Radio.Button value="fail">Fail</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                name="score"
                                label="Score (0-100)"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} max={100} className="w-full" />
                            </Form.Item>

                            <Form.Item
                                name="outcome"
                                label="Improvement Outcome"
                            >
                                <Select mode="multiple" placeholder="Select outcomes">
                                    <Select.Option value="soft_skills">Soft Skills / Empathy</Select.Option>
                                    <Select.Option value="process">Process Adherence</Select.Option>
                                    <Select.Option value="product">Product Knowledge</Select.Option>
                                    <Select.Option value="compliance">Compliance Risk</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="comments"
                                label="Comments / Feedback"
                                rules={[{ required: true, message: 'Please provide feedback' }]}
                            >
                                <TextArea rows={6} placeholder="Enter detailed feedback for the agent..." />
                            </Form.Item>

                            <Form.Item>
                                <Space className="w-full justify-end">
                                    <Button icon={<SaveOutlined />}>Save Draft</Button>
                                    <Button type="primary" htmlType="submit" loading={loading} icon={<CheckOutlined />}>
                                        Submit Evaluation
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default QCDetail;
