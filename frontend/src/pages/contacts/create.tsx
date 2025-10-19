import React from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

export const ContactCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Nombres" name="nombres" rules={[{ required: true, message: 'Por favor ingrese los nombres' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Apellidos" name="apellidos" rules={[{ required: true, message: 'Por favor ingrese los apellidos' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Por favor ingrese el email' }, { type: 'email', message: 'Por favor ingrese un email válido' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Teléfono" name="telefono" rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Estado" name="estado" rules={[{ required: true, message: 'Por favor seleccione el estado' }]} initialValue="prospecto">
          <Select>
            <Select.Option value="prospecto">Prospecto</Select.Option>
            <Select.Option value="calificado">Calificado</Select.Option>
            <Select.Option value="cliente">Cliente</Select.Option>
            <Select.Option value="inactivo">Inactivo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Cédula" name="cedula">
          <Input />
        </Form.Item>
        <Form.Item label="Ciudad" name="ciudad">
          <Input />
        </Form.Item>
        <Form.Item label="País" name="pais" initialValue="Colombia">
          <Input />
        </Form.Item>
        <Form.Item label="Notas" name="notas">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Create>
  );
};
