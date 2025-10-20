import React from 'react';
import { List, useTable, EditButton, ShowButton, DeleteButton } from '@refinedev/antd';
import { Table, Space, Tag, Typography } from 'antd';
import type { Contact } from '@/types/entities';

const { Text } = Typography;

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
    pagination: {
      mode: 'server',
      pageSize: 10,
    },
  });

  const estadoColors: Record<string, string> = {
    prospecto: 'blue',
    calificado: 'green',
    cliente: 'gold',
    inactivo: 'red',
  };

  // Get total count
  const total = tableProps.pagination !== false ? (tableProps.pagination as any)?.total || 0 : 0;
  const pageSize = tableProps.pagination !== false ? (tableProps.pagination as any)?.pageSize || 10 : 10;
  // Always show pagination so the page size selector remains visible
  // and pageSize is preserved across sorting/filtering actions

  return (
    <List
      headerButtons={({ defaultButtons }) => (
        <>
          <Text strong>Total: {total} contactos</Text>
          {defaultButtons}
        </>
      )}
    >
      <Table 
        {...tableProps} 
        rowKey="id"
        pagination={{
          ...(tableProps.pagination as any),
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      >
        <Table.Column 
          dataIndex="nombreCompleto" 
          title="Nombre Completo" 
          sorter
          key="nombreCompleto"
        />
        <Table.Column 
          dataIndex="email" 
          title="Email"
          sorter
          key="email"
        />
        <Table.Column 
          dataIndex="telefono" 
          title="Teléfono"
          key="telefono"
        />
        <Table.Column
          dataIndex="estado"
          title="Estado"
          key="estado"
          render={(value: any) => <Tag color={estadoColors[value]}>{String(value).toUpperCase()}</Tag>}
          filters={[
            { text: 'Prospecto', value: 'prospecto' },
            { text: 'Calificado', value: 'calificado' },
            { text: 'Cliente', value: 'cliente' },
            { text: 'Inactivo', value: 'inactivo' },
          ]}
          filterMultiple={true}
        />
        <Table.Column 
          dataIndex="ciudad" 
          title="Ciudad"
          sorter
          key="ciudad"
        />
        <Table.Column
          title="Acciones"
          key="actions"
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
