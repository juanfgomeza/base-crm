import type { DataProvider } from '@refinedev/core';
import axios from 'axios';
import type { AxiosInstance } from 'axios';
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
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const url = `/${resource}`;

    const { current = 1, pageSize = 10 } = (pagination as any) ?? {};

    const query: Record<string, any> = {
      page: current,
      size: pageSize,
    };

    // Add filters
    if (filters) {
      (filters as any).forEach((filter: any) => {
        if ('field' in filter) {
          query[`filter_${filter.field}`] = filter.value;
        }
      });
    }

    // Add sorting
    if (sorters && (sorters as any).length > 0) {
      const sorter = (sorters as any)[0];
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
