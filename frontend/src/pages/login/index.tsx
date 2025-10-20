import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLogin } from '@refinedev/core';

const { Title, Link, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { mutate: login } = useLogin();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [sendingReset, setSendingReset] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = (values: any) => {
    setLoggingIn(true);
    login(
      {
        email: values.email,
        password: values.password,
        remember: values.remember,
      },
      {
        onSettled: () => setLoggingIn(false),
      }
    );
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      message.error('Por favor ingresa tu correo electrónico');
      return;
    }

    try {
      setSendingReset(true);
      const response = await fetch('/api/v1/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (response.ok) {
        message.success('Si tu email existe, recibirás instrucciones para restablecer tu contraseña');
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        message.error('Error al procesar la solicitud');
      }
    } catch (error) {
      message.error('Error al procesar la solicitud');
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: '400px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0 }}>📊 Base-CRM</Title>
          <Text type="secondary">
            {showForgotPassword ? 'Restablecer Contraseña' : 'Iniciar Sesión'}
          </Text>
        </div>

        {!showForgotPassword ? (
          <Form
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{
              email: 'admin@example.com',
              password: 'admin123',
              remember: false,
            }}
          >
            <Form.Item
              name="email"
              label="Correo Electrónico"
              rules={[
                { required: true, message: 'Por favor ingresa tu correo' },
                { type: 'email', message: 'Ingresa un correo válido' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="correo@ejemplo.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Recuérdame</Checkbox>
                </Form.Item>
                <Link onClick={() => setShowForgotPassword(true)}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loggingIn}
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div>
            <Text style={{ display: 'block', marginBottom: '16px' }}>
              Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
            </Text>
            <Input
              prefix={<UserOutlined />}
              placeholder="correo@ejemplo.com"
              size="large"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              style={{ marginBottom: '16px' }}
            />
            <Button
              type="primary"
              size="large"
              block
              loading={sendingReset}
              onClick={handleForgotPassword}
              style={{ marginBottom: '8px' }}
            >
              Enviar Instrucciones
            </Button>
            <Button
              size="large"
              block
              onClick={() => setShowForgotPassword(false)}
            >
              Volver al inicio de sesión
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
