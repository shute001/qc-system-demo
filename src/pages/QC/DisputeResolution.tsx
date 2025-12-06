import React, { useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Divider, Form, Radio, Input, Button, message, Alert } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DisputeResolution: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleFinish = (values: any) => {
        setLoading(true);
        console.log('Dispute Resolution:', values);
        setTimeout(() => {
            setLoading(false);
            message.success('Dispute resolved successfully');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Button icon={<ArrowLeftOutlined />} type="text" />
                <div>
                    <Title level={4} className="!mb-0">Dispute Resolution: CS-2023001</Title>
                    <Text type="secondary">Reviewing dispute from Agent: Alice Smith</Text>
                </div>
            </div>

            <Row gutter={24}>
                <Col span={12}>
                    <Card title="Original Evaluation & Dispute" bordered={false} className="shadow-sm h-full">
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Original Score">
                                <Text type="danger" strong>75 / 100</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="QC Comments">
                                The agent failed to verify the customer's identity before discussing account details.
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider>Agent's Dispute</Divider>
                        <Alert
                            message="Dispute Reason"
                            description="I actually did verify the customer's identity at the very beginning of the call, but the recording might have cut off the first few seconds. Please check the system logs."
                            type="warning"
                            showIcon
                            className="mb-4"
                        />

                        <div className="bg-gray-50 p-4 rounded text-sm font-mono h-48 overflow-y-auto border border-gray-100 mt-4">
                            <p className="text-gray-500 italic">Transcript snippet...</p>
                            <p><span className="text-blue-600 font-bold">Agent:</span> ...can I have your full name and PIN please?</p>
                            <p><span className="text-green-600 font-bold">Customer:</span> John Doe, 1234.</p>
                            <p><span className="text-blue-600 font-bold">Agent:</span> Thank you, John.</p>
                        </div>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Final Decision" bordered={false} className="shadow-sm h-full">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleFinish}
                            initialValues={{
                                decision: 'uphold',
                            }}
                        >
                            <Form.Item
                                name="decision"
                                label="Decision"
                                rules={[{ required: true }]}
                            >
                                <Radio.Group buttonStyle="solid" className="w-full">
                                    <Radio.Button value="uphold" className="w-1/2 text-center">Uphold Original Score</Radio.Button>
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
                                            <Input type="number" min={0} max={100} />
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>

                            <Form.Item
                                name="comments"
                                label="Resolution Comments"
                                rules={[{ required: true, message: 'Please provide explanation' }]}
                            >
                                <TextArea rows={6} placeholder="Explain your decision..." />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading} block icon={<CheckCircleOutlined />}>
                                    Submit Resolution
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
