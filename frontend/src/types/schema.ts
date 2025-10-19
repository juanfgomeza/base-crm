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
