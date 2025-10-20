import type { DataProvider } from '@refinedev/core';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  paramsSerializer: {
    // Custom serializer to avoid [] brackets in array parameters
    // FastAPI expects: filter_estado=prospecto&filter_estado=calificado
    // Not: filter_estado[]=prospecto&filter_estado[]=calificado
    serialize: (params: Record<string, any>) => {
      const parts: string[] = [];
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (Array.isArray(value)) {
          // Repeat the parameter name for each value (FastAPI style)
          value.forEach((v) => {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
          });
        } else if (value !== null && value !== undefined) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      });
      return parts.join('&');
    },
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to convert camelCase to snake_case
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `/${resource}`;

    // Refine uses 'currentPage' not 'current'
    const { current, currentPage, pageSize = 10 } = (pagination as any) ?? {};
    const page = currentPage || current || 1;

    const query: Record<string, any> = {
      page: page - 1, // Backend expects 0-based page
      size: pageSize,
    };

    // Add filters
    if (filters) {
      (filters as any).forEach((filter: any) => {
        if ('field' in filter) {
          const fieldName = camelToSnake(filter.field);
          // If value is an array with single element, extract it
          const filterValue =
            Array.isArray(filter.value) && filter.value.length === 1
              ? filter.value[0]
              : filter.value;
          query[`filter_${fieldName}`] = filterValue;
        }
      });
    }

    // Add sorting
    if (sorters && (sorters as any).length > 0) {
      const sorter = (sorters as any)[0];
      const fieldName = camelToSnake(sorter.field);
      query.sort = fieldName;
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
