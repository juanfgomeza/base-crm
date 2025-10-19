import React from 'react';
import { Show, TextField, BooleanField } from '@refinedev/antd';
import { Typography } from 'antd';
import { useShow } from '@refinedev/core';
import type { User } from '@/types/entities';

const { Title } = Typography;

export const UserShow: React.FC = () => {
  const { query } = useShow<User>();
  const { data, isLoading } = query;
  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />

      <Title level={5}>Email</Title>
      <TextField value={record?.email} />

      <Title level={5}>Nombres</Title>
      <TextField value={record?.nombres} />

      <Title level={5}>Apellidos</Title>
      <TextField value={record?.apellidos} />

      <Title level={5}>Nombre Completo</Title>
      <TextField value={record?.nombreCompleto} strong />

      <Title level={5}>Usuario Activo</Title>
      <BooleanField value={record?.isActive} />

      <Title level={5}>Administrador</Title>
      <BooleanField value={record?.isSuperuser} />

      <Title level={5}>Fecha de Creación</Title>
      <TextField value={record?.createdAt ? new Date(record.createdAt).toLocaleString() : ''} />

      <Title level={5}>Última Actualización</Title>
      <TextField value={record?.updatedAt ? new Date(record.updatedAt).toLocaleString() : ''} />
    </Show>
  );
};
