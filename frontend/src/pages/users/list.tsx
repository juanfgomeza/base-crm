import React from 'react';
import { 
  List, 
  useTable, 
  EditButton, 
  ShowButton, 
  DeleteButton,
  BooleanField,
} from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import type { User } from '@/types/entities';

export const UserList: React.FC = () => {
  const { tableProps } = useTable<User>({
    syncWithLocation: true,
    pagination: {
      mode: 'server',
      pageSize: 10,
    },
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column dataIndex="nombres" title="Nombres" />
        <Table.Column dataIndex="apellidos" title="Apellidos" />
        <Table.Column 
          dataIndex="nombreCompleto" 
          title="Nombre Completo"
          render={(value) => <strong>{value}</strong>}
        />
        <Table.Column
          dataIndex="isActive"
          title="Activo"
          render={(value: boolean) => (
            <BooleanField value={value} />
          )}
        />
        <Table.Column
          dataIndex="isSuperuser"
          title="Administrador"
          render={(value: boolean) => 
            value ? <Tag color="red">Admin</Tag> : <Tag color="blue">Usuario</Tag>
          }
        />
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: User) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
