# Clean Refine CRM - Implementation Plan (Updated)

## 🎯 Project Overview

Build a modern, flexible CRM system from scratch using:

- **Frontend Framework**: Refine v4 + React 19 + TypeScript
- **UI Library**: Ant Design v5
- **Build Tool**: Vite
- **Backend**: FastAPI (REST API) - separate project
- **Data Management**: REST data provider with full CRUD operations

## 📋 Architecture Principles

1. **Clean Slate**: No legacy GraphQL code or template baggage
2. **Schema-Driven**: Entity definitions drive UI generation
3. **Customer-Specific**: Each deployment customized per industry/customer needs
4. **API-First**: Designed to work with FastAPI REST backend
5. **Developer Experience**: Hot reload, TypeScript strict mode, clear file structure

---

## 🚀 Phase 1: Project Setup & Foundation

### 1.1 Create New Vite + Refine Project

```bash
# Create new Vite + React + TypeScript project
npm create vite@latest refine-crm-clean -- --template react-ts

cd refine-crm-clean

# Install Refine core packages
npm install @refinedev/core @refinedev/react-router @refinedev/simple-rest

# Install Refine Ant Design integration
npm install @refinedev/antd antd

# Install utility libraries
npm install @faker-js/faker dayjs axios

# Install dev dependencies
npm install -D @types/node
```

> **Note**: AG Grid can be added later if advanced grid features are needed (row grouping, pivoting, advanced filtering, Excel export). For now, Ant Design Table is sufficient.

### 1.2 Project Structure

```
refine-crm-clean/
├── src/
│   ├── main.tsx                      # Application entry point
│   ├── App.tsx                       # Main app component with Refine setup
│   ├── types/                        # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── entities.ts               # Entity types (Contact initially)
│   │   └── schema.ts                 # Schema type definitions
│   ├── config/                       # Configuration files
│   │   ├── resources.ts              # Refine resource definitions
│   │   └── api.ts                    # API endpoints and configuration
│   ├── providers/                    # Data & auth providers
│   │   ├── dataProvider.ts           # REST data provider
│   │   ├── authProvider.ts           # Authentication logic
│   │   └── mockDataProvider.ts       # Mock data for development
│   ├── schemas/                      # Entity schema definitions
│   │   ├── index.ts
│   │   └── contact.schema.ts         # Contact schema (start here)
│   │   # Additional schemas added per customer/industry:
│   │   # - property.schema.ts (real estate)
│   │   # - patient.schema.ts (healthcare)
│   │   # - product.schema.ts (retail)
│   │   # - [custom].schema.ts (customer-specific entities)
│   ├── components/                   # Reusable components
│   │   ├── layout/                   # Layout components
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sider.tsx
│   │   ├── forms/                    # Form components
│   │   │   ├── DynamicForm.tsx       # Schema-driven form generator
│   │   │   └── fields/               # Custom form field components
│   │   └── common/                   # Common UI components
│   │       ├── CustomAvatar.tsx
│   │       ├── StatusTag.tsx
│   │       └── DateRangePicker.tsx
│   ├── pages/                        # Page components
│   │   ├── dashboard/
│   │   │   └── index.tsx
│   │   ├── contacts/
│   │   │   ├── list.tsx              # Contact list with Ant Table
│   │   │   ├── create.tsx
│   │   │   ├── edit.tsx
│   │   │   └── show.tsx
│   │   └── login/
│   │       └── index.tsx
│   ├── utils/                        # Utility functions
│   │   ├── formatters.ts             # Data formatting utilities
│   │   ├── validators.ts             # Validation helpers
│   │   └── helpers.ts                # General helper functions
│   └── styles/                       # Global styles
│       └── global.css
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 1.3 Update `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // FastAPI backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### 1.4 Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 📊 Phase 2: Core Type Definitions & Schemas

### 2.1 Entity Type Definitions (`src/types/entities.ts`)

```typescript
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact extends BaseEntity {
  nombres: string;        // firstnames (plural)
  apellidos: string;      // lastnames
  nombreCompleto: string; // fullname (computed or stored)
  email: string;
  telefono: string;       // phone
  estado: 'prospecto' | 'calificado' | 'cliente' | 'inactivo'; // status
  cedula?: string;        // country ID (optional)
  ciudad?: string;        // city (optional)
  pais?: string;          // country (optional)
  notas?: string;         // notes (optional)
}

// Future entities to be added per customer/industry:
// - Propiedad (real estate)
// - Paciente (healthcare)
// - Producto (retail)
// - Custom entities as needed
```

### 2.2 Schema Type Definitions (`src/types/schema.ts`)

```typescript
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'enum'
  | 'reference'
  | 'textarea'
  | 'richtext';

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  enumValues?: string[];
  referenceEntity?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };
}

export interface EntitySchema {
  name: string;
  label: string;
  pluralLabel: string;
  icon?: string;
  fields: FieldSchema[];
  defaultSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}
```

### 2.3 Contact Schema (`src/schemas/contact.schema.ts`)

```typescript
import { EntitySchema } from '@/types/schema';

export const contactSchema: EntitySchema = {
  name: 'contact',
  label: 'Contacto',
  pluralLabel: 'Contactos',
  icon: 'user',
  fields: [
    {
      name: 'nombres',
      label: 'Nombres',
      type: 'string',
      required: true,
      searchable: true,
      sortable: true,
    },
    {
      name: 'apellidos',
      label: 'Apellidos',
      type: 'string',
      required: true,
      searchable: true,
      sortable: true,
    },
    {
      name: 'nombreCompleto',
      label: 'Nombre Completo',
      type: 'string',
      required: true,
      searchable: true,
      sortable: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      unique: true,
      searchable: true,
      filterable: true,
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'phone',
      required: true,
      searchable: true,
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'enum',
      enumValues: ['prospecto', 'calificado', 'cliente', 'inactivo'],
      required: true,
      filterable: true,
      defaultValue: 'prospecto',
    },
    {
      name: 'cedula',
      label: 'Cédula',
      type: 'string',
      searchable: true,
    },
    {
      name: 'ciudad',
      label: 'Ciudad',
      type: 'string',
      filterable: true,
      sortable: true,
    },
    {
      name: 'pais',
      label: 'País',
      type: 'string',
      filterable: true,
      sortable: true,
    },
    {
      name: 'notas',
      label: 'Notas',
      type: 'textarea',
      searchable: true,
    },
  ],
  defaultSort: {
    field: 'apellidos',
    order: 'asc',
  },
};
```

---

## 🔌 Phase 3: Data Provider Setup

### 3.1 API Configuration (`src/config/api.ts`)

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  contacts: '/contactos',
  // Future endpoints added per customer:
  // properties: '/propiedades',
  // patients: '/pacientes',
  // products: '/productos',
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
};
```

### 3.2 REST Data Provider (`src/providers/dataProvider.ts`)

```typescript
import { DataProvider } from '@refinedev/core';
import axios, { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `/${resource}`;

    const { current = 1, pageSize = 10 } = pagination ?? {};

    const query: Record<string, any> = {
      page: current,
      size: pageSize,
    };

    // Add filters
    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter) {
          query[`filter_${filter.field}`] = filter.value;
        }
      });
    }

    // Add sorting
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      query.sort = sorter.field;
      query.order = sorter.order;
    }

    const { data } = await axiosInstance.get(url, { params: query });

    return {
      data: data.items,
      total: data.total,
    };
  },

  getOne: async ({ resource, id }) => {
    const url = `/${resource}/${id}`;
    const { data } = await axiosInstance.get(url);
    return { data };
  },

  getMany: async ({ resource, ids }) => {
    const url = `/${resource}`;
    const { data } = await axiosInstance.get(url, {
      params: { ids: ids.join(',') },
    });
    return { data };
  },

  create: async ({ resource, variables }) => {
    const url = `/${resource}`;
    const { data } = await axiosInstance.post(url, variables);
    return { data };
  },

  update: async ({ resource, id, variables }) => {
    const url = `/${resource}/${id}`;
    const { data } = await axiosInstance.put(url, variables);
    return { data };
  },

  deleteOne: async ({ resource, id }) => {
    const url = `/${resource}/${id}`;
    const { data } = await axiosInstance.delete(url);
    return { data };
  },

  getApiUrl: () => API_CONFIG.baseURL,
};
```

### 3.3 Mock Data Provider (`src/providers/mockDataProvider.ts`)

```typescript
import { DataProvider } from '@refinedev/core';
import { faker } from '@faker-js/faker';

faker.locale = 'es'; // Spanish locale

const generateContacts = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    nombres: faker.person.firstName(),
    apellidos: `${faker.person.lastName()} ${faker.person.lastName()}`,
    nombreCompleto: faker.person.fullName(),
    email: faker.internet.email(),
    telefono: faker.phone.number(),
    estado: faker.helpers.arrayElement([
      'prospecto',
      'calificado',
      'cliente',
      'inactivo',
    ]),
    cedula: faker.string.numeric(10),
    ciudad: faker.location.city(),
    pais: 'Colombia',
    notas: faker.lorem.paragraph(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  }));
};

const mockData = {
  contactos: generateContacts(50),
};

export const mockDataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    let data = mockData[resource] || [];

    // Apply filters
    if (filters) {
      filters.forEach((filter) => {
        if ('field' in filter && filter.operator === 'eq') {
          data = data.filter((item) => item[filter.field] === filter.value);
        }
      });
    }

    // Apply sorting
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      data = [...data].sort((a, b) => {
        const aVal = a[sorter.field];
        const bVal = b[sorter.field];
        return sorter.order === 'asc'
          ? aVal > bVal
            ? 1
            : -1
          : aVal < bVal
          ? 1
          : -1;
      });
    }

    // Apply pagination
    const { current = 1, pageSize = 10 } = pagination ?? {};
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: data.slice(start, end),
      total: data.length,
    };
  },

  getOne: async ({ resource, id }) => {
    const data = mockData[resource] || [];
    const item = data.find((item) => item.id === id);
    return { data: item };
  },

  getMany: async ({ resource, ids }) => {
    const data = mockData[resource] || [];
    const items = data.filter((item) => ids.includes(item.id));
    return { data: items };
  },

  create: async ({ resource, variables }) => {
    const newItem = {
      id: faker.string.uuid(),
      ...variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockData[resource].push(newItem);
    return { data: newItem };
  },

  update: async ({ resource, id, variables }) => {
    const data = mockData[resource] || [];
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
      data[index] = {
        ...data[index],
        ...variables,
        updatedAt: new Date().toISOString(),
      };
      return { data: data[index] };
    }
    throw new Error('Item not found');
  },

  deleteOne: async ({ resource, id }) => {
    const data = mockData[resource] || [];
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
      const deleted = data.splice(index, 1)[0];
      return { data: deleted };
    }
    throw new Error('Item not found');
  },

  getApiUrl: () => 'http://localhost:3000/mock',
};
```

---

## 🖼️ Phase 4: Main Application Setup

### 4.1 App Component (`src/App.tsx`)

```typescript
import React from 'react';
import { Refine } from '@refinedev/core';
import {
  RefineThemes,
  ThemedLayoutV2,
  notificationProvider,
} from '@refinedev/antd';
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import esES from 'antd/locale/es_ES';

// import { dataProvider } from '@/providers/dataProvider';
import { mockDataProvider as dataProvider } from '@/providers/mockDataProvider'; // Use for development
import { authProvider } from '@/providers/authProvider';

import { DashboardPage } from '@/pages/dashboard';
import {
  ContactList,
  ContactCreate,
  ContactEdit,
  ContactShow,
} from '@/pages/contacts';
import { LoginPage } from '@/pages/login';

import '@refinedev/antd/dist/reset.css';

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue} locale={esES}>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider}
            authProvider={authProvider}
            notificationProvider={notificationProvider}
            resources={[
              {
                name: 'contactos',
                list: '/contactos',
                create: '/contactos/crear',
                edit: '/contactos/editar/:id',
                show: '/contactos/mostrar/:id',
                meta: {
                  label: 'Contactos',
                  icon: '👤',
                },
              },
              // Future resources added per customer/industry
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayoutV2>
                    <Outlet />
                  </ThemedLayoutV2>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="/contactos">
                  <Route index element={<ContactList />} />
                  <Route path="crear" element={<ContactCreate />} />
                  <Route path="editar/:id" element={<ContactEdit />} />
                  <Route path="mostrar/:id" element={<ContactShow />} />
                </Route>
              </Route>
              <Route path="/login" element={<LoginPage />} />
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 4.2 Contact List Page (`src/pages/contacts/list.tsx`)

```typescript
import React from 'react';
import { List, useTable, EditButton, ShowButton, DeleteButton } from '@refinedev/antd';
import { Table, Space, Tag } from 'antd';
import { Contact } from '@/types/entities';

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

  const estadoColors = {
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
          render={(value) => (
            <Tag color={estadoColors[value]}>{value.toUpperCase()}</Tag>
          )}
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
```

### 4.3 Contact Create Page (`src/pages/contacts/create.tsx`)

```typescript
import React from 'react';
import { Create, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

export const ContactCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Nombres"
          name="nombres"
          rules={[{ required: true, message: 'Por favor ingrese los nombres' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Apellidos"
          name="apellidos"
          rules={[{ required: true, message: 'Por favor ingrese los apellidos' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Por favor ingrese el email' },
            { type: 'email', message: 'Por favor ingrese un email válido' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Teléfono"
          name="telefono"
          rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Estado"
          name="estado"
          rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
          initialValue="prospecto"
        >
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
```

### 4.4 Contact Edit Page (`src/pages/contacts/edit.tsx`)

```typescript
import React from 'react';
import { Edit, useForm } from '@refinedev/antd';
import { Form, Input, Select } from 'antd';

export const ContactEdit: React.FC = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Nombres"
          name="nombres"
          rules={[{ required: true, message: 'Por favor ingrese los nombres' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Apellidos"
          name="apellidos"
          rules={[{ required: true, message: 'Por favor ingrese los apellidos' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Por favor ingrese el email' },
            { type: 'email', message: 'Por favor ingrese un email válido' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Teléfono"
          name="telefono"
          rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Estado"
          name="estado"
          rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
        >
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
        <Form.Item label="País" name="pais">
          <Input />
        </Form.Item>
        <Form.Item label="Notas" name="notas">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
```

### 4.5 Contact Show Page (`src/pages/contacts/show.tsx`)

```typescript
import React from 'react';
import { Show, TextField, EmailField, TagField } from '@refinedev/antd';
import { Typography } from 'antd';
import { useShow } from '@refinedev/core';
import { Contact } from '@/types/entities';

const { Title } = Typography;

export const ContactShow: React.FC = () => {
  const { queryResult } = useShow<Contact>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const estadoColors = {
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
```

### 4.6 Contact Pages Index (`src/pages/contacts/index.ts`)

```typescript
export { ContactList } from './list';
export { ContactCreate } from './create';
export { ContactEdit } from './edit';
export { ContactShow } from './show';
```

---

## 🔐 Phase 5: Authentication

### 5.1 Auth Provider (`src/providers/authProvider.ts`)

```typescript
import { AuthProvider } from '@refinedev/core';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await axios.post(`${API_CONFIG.baseURL}/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', data.token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: 'Email o contraseña inválidos',
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  },

  check: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      return { authenticated: true };
    }
    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },

  getIdentity: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await axios.get(`${API_CONFIG.baseURL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch {
        return null;
      }
    }
    return null;
  },

  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      return { logout: true };
    }
    return {};
  },
};
```

### 5.2 Login Page (`src/pages/login/index.tsx`)

```typescript
import React from 'react';
import { AuthPage } from '@refinedev/antd';

export const LoginPage: React.FC = () => {
  return (
    <AuthPage
      type="login"
      title="CRM Sistema"
      formProps={{
        initialValues: {
          email: 'demo@example.com',
          password: 'demo',
        },
      }}
    />
  );
};
```

### 5.3 Dashboard Page (`src/pages/dashboard/index.tsx`)

```typescript
import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Contactos"
              value={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Prospectos"
              value={0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Clientes"
              value={0}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
```

---

## 📦 Phase 6: Backend Integration

### 6.1 FastAPI Endpoints Expected

```python
# /api/contactos
GET    /api/contactos?page=1&size=10&filter_estado=prospecto
POST   /api/contactos
GET    /api/contactos/{id}
PUT    /api/contactos/{id}
DELETE /api/contactos/{id}

# /api/auth
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# Future endpoints per customer/industry:
# /api/propiedades (real estate)
# /api/pacientes (healthcare)
# /api/productos (retail)
```

### 6.2 Response Format

```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "size": 10
}
```

### 6.3 Contact Model Example (FastAPI)

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class ContactStatus(str, Enum):
    PROSPECTO = "prospecto"
    CALIFICADO = "calificado"
    CLIENTE = "cliente"
    INACTIVO = "inactivo"

class ContactBase(BaseModel):
    nombres: str
    apellidos: str
    nombreCompleto: str
    email: EmailStr
    telefono: str
    estado: ContactStatus
    cedula: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    notas: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class Contact(ContactBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
```

---

## 🚀 Development Workflow

### Step 1: Initial Setup
```bash
npm create vite@latest refine-crm-clean -- --template react-ts
cd refine-crm-clean
npm install @refinedev/core @refinedev/react-router @refinedev/simple-rest
npm install @refinedev/antd antd
npm install @faker-js/faker dayjs axios
npm install -D @types/node
```

### Step 2: Configure Project
- Update `vite.config.ts` with path aliases and proxy
- Update `tsconfig.json` with strict mode and paths
- Create folder structure as defined in Phase 1.2

### Step 3: Build Core Types & Schemas
- Create `src/types/entities.ts` (Contact interface)
- Create `src/types/schema.ts` (Schema definitions)
- Create `src/schemas/contact.schema.ts` (Contact schema)

### Step 4: Build Data Providers
- Create `src/config/api.ts` (API configuration)
- Create `src/providers/dataProvider.ts` (REST provider)
- Create `src/providers/mockDataProvider.ts` (Mock data for development)
- Create `src/providers/authProvider.ts` (Authentication)

### Step 5: Build UI Components
- Create `src/App.tsx` (Main application)
- Create `src/pages/dashboard/index.tsx` (Dashboard)
- Create `src/pages/login/index.tsx` (Login page)
- Create `src/pages/contacts/list.tsx` (List view)
- Create `src/pages/contacts/create.tsx` (Create form)
- Create `src/pages/contacts/edit.tsx` (Edit form)
- Create `src/pages/contacts/show.tsx` (Detail view)
- Create `src/pages/contacts/index.ts` (Exports)

### Step 6: Test with Mock Data
```bash
npm run dev
```
- Navigate to http://localhost:3000
- Test contact CRUD operations
- Verify filtering, sorting, pagination
- Check form validations

### Step 7: Connect to FastAPI Backend
- Switch from `mockDataProvider` to `dataProvider` in `App.tsx`
- Ensure FastAPI backend is running on port 8000
- Test all CRUD operations with real API
- Verify authentication flow

### Step 8: Customer-Specific Development
**When defining industry and customer, follow these steps:**

1. **Define new entities** based on customer needs:
   - Real estate: `Propiedad`, `Visita`, `Contrato`
   - Healthcare: `Paciente`, `Cita`, `HistorialMedico`
   - Retail: `Producto`, `Venta`, `Inventario`

2. **Create entity types** in `src/types/entities.ts`:
   ```typescript
   export interface Propiedad extends BaseEntity {
     direccion: string;
     precio: number;
     tipo: 'casa' | 'apartamento' | 'lote';
     // ... more fields
   }
   ```

3. **Create schema** in `src/schemas/propiedad.schema.ts`:
   ```typescript
   export const propiedadSchema: EntitySchema = {
     name: 'propiedad',
     label: 'Propiedad',
     pluralLabel: 'Propiedades',
     fields: [ /* ... */ ],
   };
   ```

4. **Create pages** in `src/pages/propiedades/`:
   - `list.tsx`
   - `create.tsx`
   - `edit.tsx`
   - `show.tsx`

5. **Define relationships** between entities:
   ```typescript
   {
     name: 'contactoId',
     label: 'Contacto',
     type: 'reference',
     referenceEntity: 'contactos',
   }
   ```

6. **Update API endpoints** in `src/config/api.ts`:
   ```typescript
   export const API_ENDPOINTS = {
     contacts: '/contactos',
     properties: '/propiedades',
     // ... more endpoints
   };
   ```

7. **Add resources** to `App.tsx`:
   ```typescript
   resources={[
     { name: 'contactos', /* ... */ },
     { name: 'propiedades', /* ... */ },
     // ... more resources
   ]}
   ```

---

## 🎯 Phase 7: Enhanced Features (Optional)

### 7.1 Auto-generate `nombreCompleto`

Add a computed field that auto-generates from `nombres` + `apellidos`:

```typescript
// In create.tsx and edit.tsx
const handleValuesChange = (changedValues: any, allValues: any) => {
  if (changedValues.nombres || changedValues.apellidos) {
    const nombreCompleto = `${allValues.nombres || ''} ${allValues.apellidos || ''}`.trim();
    form.setFieldsValue({ nombreCompleto });
  }
};

<Form 
  {...formProps} 
  layout="vertical"
  onValuesChange={handleValuesChange}
>
```

### 7.2 Dynamic Form Generator

Create a reusable form component based on schemas:

```typescript
// src/components/forms/DynamicForm.tsx
import { Form, Input, Select, DatePicker } from 'antd';
import { EntitySchema } from '@/types/schema';

export const DynamicForm: React.FC<{ schema: EntitySchema }> = ({ schema }) => {
  return (
    <>
      {schema.fields.map((field) => {
        switch (field.type) {
          case 'string':
          case 'email':
          case 'phone':
            return (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={[{ required: field.required }]}
              >
                <Input />
              </Form.Item>
            );
          case 'enum':
            return (
              <Form.Item 
                key={field.name} 
                name={field.name} 
                label={field.label}
                rules={[{ required: field.required }]}
              >
                <Select>
                  {field.enumValues?.map((val) => (
                    <Select.Option key={val} value={val}>
                      {val.charAt(0).toUpperCase() + val.slice(1)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          case 'textarea':
            return (
              <Form.Item 
                key={field.name} 
                name={field.name} 
                label={field.label}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            );
          default:
            return null;
        }
      })}
    </>
  );
};
```

### 7.3 Status Colors Component

```typescript
// src/components/common/StatusTag.tsx
import React from 'react';
import { Tag } from 'antd';

interface StatusTagProps {
  status: string;
}

const STATUS_COLORS: Record<string, string> = {
  prospecto: 'blue',
  calificado: 'green',
  cliente: 'gold',
  inactivo: 'red',
};

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  return (
    <Tag color={STATUS_COLORS[status] || 'default'}>
      {status.toUpperCase()}
    </Tag>
  );
};
```

### 7.4 Add Excel Export (Future)

If needed, add AG Grid later for advanced features:

```bash
# When advanced grid features are needed:
npm install ag-grid-react ag-grid-community
# Optional for enterprise features:
npm install ag-grid-enterprise
```

---

## ✅ Success Criteria

- [x] Clean project with no legacy code
- [x] Contact CRUD working with Ant Design Table
- [x] TypeScript strict mode enabled
- [x] Mock data provider for development
- [x] Spanish-language UI (labels, messages)
- [x] Schema-driven architecture ready for expansion
- [x] Form validation working
- [x] Filtering and sorting on table
- [ ] Connected to FastAPI backend
- [ ] Authentication implemented
- [ ] Customer-specific entities added as needed

---

## 🎓 Key Points

1. **Start Simple**: Only Contacts initially, expand per customer
2. **No Multi-Tenancy**: Each deployment is customized for specific customer
3. **AG Grid Later**: Add only if advanced features needed (pivoting, grouping, Excel export)
4. **Spanish First**: All labels, messages, and data in Spanish
5. **Schema-Driven**: Easy to add new entities per industry
6. **Mock First**: Develop with mock data, switch to real API when ready

---

## 💡 Additional Suggestions

1. **`nombreCompleto` Auto-Generation**: 
   - Compute `nombreCompleto` from `nombres + apellidos` automatically on form change
   - Store in database or compute on-the-fly (decide based on query needs)

2. **Add Avatar Field**: 
   - Consider adding `avatar: string` field for contact photos
   - Use Ant Design's `Avatar` component for display

3. **Activity Timeline**: 
   - Future feature: Track interactions with contacts
   - Create `Actividad` entity with relationship to `Contacto`

4. **Bulk Operations**:
   - Add bulk import from CSV/Excel
   - Add bulk export functionality
   - Add bulk status updates

5. **Advanced Search**:
   - Implement full-text search across multiple fields
   - Add saved search filters
   - Add quick filters in sidebar

6. **Relationships**:
   - When adding new entities, define clear relationships
   - Example: `Contacto` → `Propiedad` (many-to-many for real estate)
   - Example: `Contacto` → `Venta` (one-to-many for retail)

7. **Audit Trail**:
   - Track who created/updated each record
   - Add `createdBy` and `updatedBy` fields
   - Show history of changes

---

## 📚 Resources

- **Refine Docs**: https://refine.dev/docs/
- **Ant Design**: https://ant.design/
- **Ant Design (Spanish)**: https://ant.design/docs/react/i18n
- **FastAPI**: https://fastapi.tiangolo.com/
- **Vite**: https://vitejs.dev/
- **AG Grid** (if needed): https://www.ag-grid.com/react-data-grid/

---

## 🔄 Migration Path to AG Grid (If Needed)

If you later need advanced grid features, here's the migration path:

1. **Install AG Grid**:
```bash
npm install ag-grid-react ag-grid-community ag-grid-enterprise
```

2. **Create AG Grid wrapper** (`src/components/grids/AGGridList.tsx`)

3. **Define column definitions** per entity

4. **Replace Table component** with AG Grid in list pages

5. **Benefits you'll get**:
   - Advanced filtering (set filters, number filters)
   - Row grouping and aggregation
   - Pivoting
   - Excel export
   - Column pinning
   - Cell editing
   - Master-detail views

---

## 🎯 Next Immediate Steps

1. ✅ Run through Phase 1 to create the clean project
2. ✅ Set up basic types and schemas (Phase 2)
3. ✅ Create data providers (Phase 3)
4. ✅ Build main app and contact pages (Phase 4)
5. ⏳ Test with mock data
6. ⏳ Connect to FastAPI backend (Phase 6)
7. ⏳ Add authentication (Phase 5)
8. ⏳ Define customer industry and add specific entities (Phase 6 Step 8)

**Ready to build a clean, powerful CRM! 🚀**