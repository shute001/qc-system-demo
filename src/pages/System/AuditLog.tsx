import React, { useState, useEffect } from 'react';
import { Table, Card, Form, Input, DatePicker, Button, Space, Tag, Modal, Descriptions, message, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { AuditLog, AppState } from '../../store/useAppStore';
import { useAppStore } from '../../store/useAppStore';

const { RangePicker } = DatePicker;

const AuditLogPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [modules, setModules] = useState<string[]>([]);
    const [operations, setOperations] = useState<string[]>([]);

    const fetchAuditLogs = useAppStore((state: AppState) => state.fetchAuditLogs);
    const fetchAuditOptions = useAppStore((state: AppState) => state.fetchAuditOptions);

    const fetchLogs = async (page = currentPage, size = pageSize) => {
        setLoading(true);
        try {
            const values = form.getFieldsValue();
            const params = {
                staffId: values.staffId,
                module: values.module,
                operation: values.operation,
                page: page - 1,
                size: size,
            };

            // In demo, we just simulate the fetch
            const res = fetchAuditLogs(params);
            setData(res.content);
            setTotal(res.totalElements);
        } catch (error) {
            message.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = () => {
        try {
            const res = fetchAuditOptions();
            setModules(res.modules);
            setOperations(res.operations);
        } catch (error) {
            console.error('Failed to fetch audit options', error);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [currentPage, pageSize]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLogs(1, pageSize);
    };

    const handleReset = () => {
        form.resetFields();
        handleSearch();
    };

    const showDetail = (record: AuditLog) => {
        setSelectedLog(record);
        setDetailModalVisible(true);
    };

    const formatJson = (jsonStr: string) => {
        if (!jsonStr) return 'N/A';
        try {
            const obj = JSON.parse(jsonStr);
            return (
                <pre style={{ maxHeight: '200px', overflow: 'auto', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                    {JSON.stringify(obj, null, 2)}
                </pre>
            );
        } catch (e) {
            return <div style={{ whiteSpace: 'pre-wrap' }}>{jsonStr}</div>;
        }
    };

    const renderFieldModifications = (log: AuditLog) => {
        if (!log || !log.changedValue) return 'N/A';
        let diffs: any[] = [];

        try {
            const parsed = JSON.parse(log.changedValue);
            if (Array.isArray(parsed)) {
                diffs = parsed;
            }
        } catch (e) {
            return <div style={{ color: '#999' }}>{log.changedValue}</div>;
        }

        if (diffs.length > 0) {
            return (
                <Table
                    size="small"
                    pagination={false}
                    dataSource={diffs}
                    rowKey={(record) => `${record.field}-${record.old}-${record.new}`}
                    columns={[
                        { title: 'Field', dataIndex: 'field', key: 'field', width: '30%' },
                        {
                            title: 'Old Value',
                            dataIndex: 'old',
                            key: 'old',
                            render: (t) => <span style={{ color: t === 'N/A' ? '#bfbfbf' : '#cf1322' }}>{t}</span>
                        },
                        {
                            title: 'New Value',
                            dataIndex: 'new',
                            key: 'new',
                            render: (t) => <span style={{ color: t === 'N/A' ? '#bfbfbf' : '#3f8600' }}>{t}</span>
                        },
                    ]}
                />
            );
        }

        return <span style={{ color: '#999' }}>No changes in monitored fields</span>;
    };

    const columns = [
        {
            title: 'Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: 'Staff ID',
            dataIndex: 'staffId',
            key: 'staffId',
            width: 120,
        },
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            width: 100,
            render: (module: string) => <Tag color="blue">{module}</Tag>,
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            width: 150,
        },
        {
            title: 'API Path',
            dataIndex: 'apiPath',
            key: 'apiPath',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: number) => (
                <Tag color={status === 1 ? 'success' : 'error'}>
                    {status === 1 ? 'Success' : 'Failure'}
                </Tag>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 130,
        },
        {
            title: 'Action',
            key: 'action',
            width: 80,
            render: (_: any, record: AuditLog) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => showDetail(record)}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <Card bordered={false}>
            <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
                <Form.Item name="staffId" label="Staff ID">
                    <Input placeholder="Search Staff ID" allowClear style={{ width: 150 }} />
                </Form.Item>
                <Form.Item name="module" label="Module">
                    <Select placeholder="Select Module" allowClear showSearch style={{ width: 150 }}>
                        {modules.map(m => <Select.Option key={m} value={m}>{m}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="operation" label="Operation">
                    <Select placeholder="Select Operation" allowClear showSearch style={{ width: 180 }}>
                        {operations.map(o => <Select.Option key={o} value={o}>{o}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="timeRange" label="Time Range">
                    <RangePicker showTime style={{ width: 320 }} />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                            Search
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                            Reset
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                }}
            />

            <Modal
                title="Audit Log Detail"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedLog && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Operation Time">
                            {dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Performer">
                            {selectedLog.staffId} {selectedLog.staffName ? `(${selectedLog.staffName})` : ''}
                        </Descriptions.Item>
                        <Descriptions.Item label="API Path">
                            [{selectedLog.method}] {selectedLog.apiPath}
                        </Descriptions.Item>
                        <Descriptions.Item label="Request Params">
                            {formatJson(selectedLog.params)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Field Modifications">
                            {renderFieldModifications(selectedLog)}
                        </Descriptions.Item>
                        {selectedLog.status === 0 && (
                            <Descriptions.Item label="Error Message">
                                <span style={{ color: 'red' }}>{selectedLog.errorMsg}</span>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="IP Address">
                            {selectedLog.ipAddress}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Card>
    );
};

export default AuditLogPage;
