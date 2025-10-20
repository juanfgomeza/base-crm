import React, { useState } from 'react';
import { Card, Form, Input, Button, Space, Typography, Switch, message } from 'antd';
import { useGetIdentity } from '@refinedev/core';
import { useTheme } from '@/contexts/ThemeContext';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const { Title, Text } = Typography;

export const UserSettingsPage: React.FC = () => {
  const { data: user } = useGetIdentity<any>();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handlePasswordChange = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_CONFIG.baseURL}/auth/password-change`,
        {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success('Contraseña cambiada exitosamente');
      form.resetFields();
    } catch (error: any) {
      message.error(error?.response?.data?.detail || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    toggleTheme();
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_CONFIG.baseURL}/users/me/settings`,
        { themePreference: newTheme },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success('Preferencia de tema actualizada');
    } catch (error) {
      message.error('Error al guardar preferencia de tema');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Configuración de Usuario</Title>

      {/* User Information */}
      <Card title="Información Personal" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Nombre:</Text>
            <br />
            <Text>{user?.nombres} {user?.apellidos}</Text>
          </div>
          <div>
            <Text strong>Email:</Text>
            <br />
            <Text>{user?.email}</Text>
          </div>
        </Space>
      </Card>

      {/* Theme Settings */}
      <Card title="Apariencia" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Tema Oscuro</Text>
              <br />
              <Text type="secondary">Cambiar entre tema claro y oscuro</Text>
            </div>
            <Switch
              checked={theme === 'dark'}
              onChange={handleThemeChange}
              checkedChildren="Oscuro"
              unCheckedChildren="Claro"
            />
          </div>
        </Space>
      </Card>

      {/* Password Change */}
      <Card title="Cambiar Contraseña">
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Contraseña Actual"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña actual' },
            ]}
          >
            <Input.Password placeholder="Contraseña actual" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Nueva Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu nueva contraseña' },
              { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
            ]}
          >
            <Input.Password placeholder="Nueva contraseña" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirmar Nueva Contraseña"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Por favor confirma tu nueva contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmar nueva contraseña" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cambiar Contraseña
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
