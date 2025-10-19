import type { DataProvider } from '@refinedev/core';
import { faker } from '@faker-js/faker';

// faker v10 types may not expose `locale` setter; use a cast
(faker as any).locale = 'es';

const generateContacts = (count: number) => {
  return Array.from({ length: count }).map(() => ({
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

const mockData: Record<string, any[]> = {
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
    // pagination shape may vary; fallback to defaults
    const { current = 1, pageSize = 10 } = (pagination as any) ?? {};
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

  create: async ({ resource, variables }: any) => {
    const newItem = {
      id: faker.string.uuid(),
      ...variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockData[resource].push(newItem);
    return { data: newItem } as any;
  },

  update: async ({ resource, id, variables }: any) => {
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

  deleteOne: async ({ resource, id }: any) => {
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
