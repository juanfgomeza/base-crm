export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  email: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  isActive: boolean;
  isSuperuser: boolean;
}

export interface Contact extends BaseEntity {
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  estado: 'prospecto' | 'calificado' | 'cliente' | 'inactivo';
  cedula?: string;
  ciudad?: string;
  pais?: string;
  notas?: string;
}
