import React from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Switch } from 'antd';
import type { User } from '@/types/entities';

export const UserEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<User>();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Por favor ingrese el email' },
            { type: 'email', message: 'Email inválido' },
          ]}
        >
          <Input placeholder="usuario@ejemplo.com" />
        </Form.Item>

        <Form.Item
          label="Contraseña (dejar en blanco para no cambiar)"
          name="password"
          rules={[
            { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
          ]}
        >
          <Input.Password placeholder="******" />
        </Form.Item>

        <Form.Item
          label="Nombres"
          name="nombres"
          rules={[{ required: true, message: 'Por favor ingrese los nombres' }]}
        >
          <Input placeholder="Juan" />
        </Form.Item>

        <Form.Item
          label="Apellidos"
          name="apellidos"
          rules={[{ required: true, message: 'Por favor ingrese los apellidos' }]}
        >
          <Input placeholder="Pérez" />
        </Form.Item>

        <Form.Item
          label="Usuario Activo"
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Administrador"
          name="isSuperuser"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
