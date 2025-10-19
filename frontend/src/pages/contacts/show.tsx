import React from 'react';
import { Show, TextField, EmailField, TagField } from '@refinedev/antd';
import { Typography } from 'antd';
import { useShow } from '@refinedev/core';
import type { Contact } from '@/types/entities';

const { Title } = Typography;

export const ContactShow: React.FC = () => {
  const showReturn = useShow<Contact>() as any;
  const queryResult = showReturn.queryResult as any;
  const data = queryResult?.data;
  const isLoading = queryResult?.isLoading;
  const record = data?.data;

  const estadoColors: Record<string, string> = {
    prospecto: 'blue',
    calificado: 'green',
    cliente: 'gold',
    inactivo: 'red',
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>Nombre Completo</Title>
      <TextField value={record?.nombreCompleto} />

      <Title level={5}>Email</Title>
      <EmailField value={record?.email} />

      <Title level={5}>Teléfono</Title>
      <TextField value={record?.telefono} />

      <Title level={5}>Estado</Title>
      <TagField value={record?.estado} color={estadoColors[record?.estado || 'prospecto']} />

      {record?.cedula && (
        <>
          <Title level={5}>Cédula</Title>
          <TextField value={record.cedula} />
        </>
      )}

      {record?.ciudad && (
        <>
          <Title level={5}>Ciudad</Title>
          <TextField value={record.ciudad} />
        </>
      )}

      {record?.pais && (
        <>
          <Title level={5}>País</Title>
          <TextField value={record.pais} />
        </>
      )}

      {record?.notas && (
        <>
          <Title level={5}>Notas</Title>
          <TextField value={record.notas} />
        </>
      )}
    </Show>
  );
};
