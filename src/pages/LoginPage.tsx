import React from 'react';
import { Card, Form, Input, Button, Checkbox, message, Typography, Avatar } from 'antd';
import { UserOutlined, LockOutlined, DeploymentUnitOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

// 登入頁面元件
const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        if (values.username === 'admin' && values.password === 'admin') {
            login();
            navigate('/', { replace: true });
        } else {
            message.error('帳號或密碼錯誤');
        }
    };

    return (
        <div className="login-page" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0a0b0d 0%, #161719 50%, #0a0b0d 100%)',
            backgroundAttachment: 'fixed',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 背景裝飾 */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-25%',
                width: '150%',
                height: '200%',
                background: 'radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%)',
                animation: 'float 20s ease-in-out infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-50%',
                right: '-25%',
                width: '150%',
                height: '200%',
                background: 'radial-gradient(circle at 50% 50%, rgba(24, 144, 255, 0.1) 0%, transparent 50%)',
                animation: 'float 25s ease-in-out infinite reverse',
                pointerEvents: 'none'
            }} />

            <Card
                className="login-card"
                style={{
                    width: 320,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(24px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(200%)'
                }}
                bodyStyle={{
                    padding: '24px',
                    background: 'transparent'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{
                        marginBottom: 16,
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                        }}>
                            <DeploymentUnitOutlined style={{
                                fontSize: '28px',
                                color: 'white'
                            }} />
                        </div>
                    </div>
                    <Title level={2} style={{ color: 'var(--text-primary)', margin: '0 0 4px 0', fontWeight: '700', fontSize: '28px', letterSpacing: '-0.5px' }}>
                        SRE Platform
                    </Title>
                    <Text style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        display: 'block',
                        fontWeight: '500'
                    }}>
                        智慧化系統可靠性管理平台
                    </Text>
                </div>
                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{ username: 'admin', password: 'admin' }}
                    style={{ marginTop: '0' }}
                >
                    <Form.Item
                        label={
                            <span style={{
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}>
                                帳號
                            </span>
                        }
                        name="username"
                        rules={[{ required: true, message: '請輸入帳號' }]}
                        style={{ marginBottom: '16px' }}
                    >
                        <Input
                            size="large"
                            prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                            style={{
                                background: 'var(--bg-container)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                height: '40px',
                                fontSize: '15px',
                                color: 'var(--text-primary)'
                            }}
                            placeholder="請輸入帳號"
                            autoComplete="username"
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            <span style={{
                                color: 'var(--text-primary)',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}>
                                密碼
                            </span>
                        }
                        name="password"
                        rules={[{ required: true, message: '請輸入密碼' }]}
                        style={{ marginBottom: '16px' }}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                            style={{
                                background: 'var(--bg-container)',
                                border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-lg)',
                                height: '40px',
                                fontSize: '15px',
                                color: 'var(--text-primary)'
                            }}
                            placeholder="請輸入密碼"
                            autoComplete="current-password"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Checkbox style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                記住我
                            </Checkbox>
                            <Button type="link" style={{
                                color: 'var(--brand-primary)',
                                fontSize: '13px',
                                padding: 0,
                                height: 'auto'
                            }}>
                                忘記密碼？
                            </Button>
                        </div>
                    </Form.Item>
                    <Form.Item style={{ marginTop: 16, marginBottom: 8 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            style={{
                                height: '44px',
                                fontSize: '16px',
                                fontWeight: '600',
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                                border: 'none',
                                boxShadow: '0 6px 24px rgba(108, 117, 125, 0.3)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className="login-submit-button"
                        >
                            登入系統
                        </Button>
                    </Form.Item>
                    <div style={{
                        textAlign: 'center',
                        marginTop: '8px'
                    }}>
                        <Text style={{
                            color: 'var(--text-tertiary)',
                            fontSize: '12px'
                        }}>
                            測試帳號：admin / admin
                        </Text>
                    </div>
                </Form>
            </Form>
        </Card>
    </div>
    );
};

export default LoginPage;
