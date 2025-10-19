import React from 'react';
import { List, useTable, EditButton, ShowButton, DeleteButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import type { Contact } from '@/types/entities';

export const ContactList: React.FC = () => {
  const { tableProps } = useTable<Contact>({
    resource: 'contactos',
    sorters: {
      initial: [
        {
          field: 'apellidos',
          order: 'asc',
        },
      ],
    },
  });

  const estadoColors: Record<string, string> = {
    prospecto: 'blue',
    calificado: 'green',
    cliente: 'gold',
    inactivo: 'red',
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="nombreCompleto" title="Nombre Completo" sorter />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="telefono" title="Teléfono" />
        <Table.Column
          dataIndex="estado"
          title="Estado"
          render={(value: any) => <Tag color={estadoColors[value]}>{String(value).toUpperCase()}</Tag>}
          filters={[
            { text: 'Prospecto', value: 'prospecto' },
            { text: 'Calificado', value: 'calificado' },
            { text: 'Cliente', value: 'cliente' },
            { text: 'Inactivo', value: 'inactivo' },
          ]}
        />
        <Table.Column dataIndex="ciudad" title="Ciudad" />
        <Table.Column
          title="Acciones"
          render={(_, record: Contact) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
