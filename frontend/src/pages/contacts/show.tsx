import React from 'react';
import { Show, EmailField, TagField } from '@refinedev/antd';
import { Descriptions } from 'antd';
import { useShow } from '@refinedev/core';
import type { Contact } from '@/types/entities';

export const ContactShow: React.FC = () => {
  const { query } = useShow<Contact>();
  const { data, isLoading } = query;
  const record = data?.data;

  console.log('Show page data:', { data, record });

  const estadoColors: Record<string, string> = {
    prospecto: 'blue',
    calificado: 'green',
    cliente: 'gold',
    inactivo: 'red',
  };

  return (
    <Show isLoading={isLoading}>
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Nombre Completo">
          {record?.nombreCompleto || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Email">
          {record?.email ? <EmailField value={record.email} /> : '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Teléfono">
          {record?.telefono || '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Estado">
          {record?.estado ? (
            <TagField 
              value={record.estado} 
              color={estadoColors[record.estado]} 
            />
          ) : '-'}
        </Descriptions.Item>

        {record?.cedula && (
          <Descriptions.Item label="Cédula">
            {record.cedula}
          </Descriptions.Item>
        )}

        {record?.ciudad && (
          <Descriptions.Item label="Ciudad">
            {record.ciudad}
          </Descriptions.Item>
        )}

        {record?.pais && (
          <Descriptions.Item label="País">
            {record.pais}
          </Descriptions.Item>
        )}

        {record?.notas && (
          <Descriptions.Item label="Notas">
            {record.notas}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Show>
  );
};
