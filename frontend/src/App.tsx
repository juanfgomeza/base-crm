import { Refine, Authenticated } from '@refinedev/core';
import routerProvider, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from '@refinedev/react-router';
import { RefineThemes, ThemedLayout, useNotificationProvider } from '@refinedev/antd';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import esES from 'antd/locale/es_ES';

import { dataProvider } from '@/providers/dataProvider';
import { authProvider } from '@/providers/authProvider';
import { CustomSider } from '@/components/CustomSider';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

import { DashboardPage } from '@/pages/dashboard';
import { LoginPage } from '@/pages/login';
import { UserSettingsPage } from '@/pages/settings';
import {
  ContactList,
  ContactCreate,
  ContactEdit,
  ContactShow,
} from '@/pages/contacts';
import {
  UserList,
  UserCreate,
  UserEdit,
  UserShow,
} from '@/pages/users';

import '@refinedev/antd/dist/reset.css';
import './App.css';

function AppContent() {
  const notificationProvider = useNotificationProvider();
  const { theme: appTheme } = useTheme();

  return (
    <ConfigProvider 
      theme={{
        ...RefineThemes.Blue,
        algorithm: appTheme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }} 
      locale={esES}
    >
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
              {
                name: 'users',
                list: '/users',
                create: '/users/crear',
                edit: '/users/editar/:id',
                show: '/users/mostrar/:id',
                meta: {
                  label: 'Usuarios',
                  icon: '👥',
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <Authenticated
                    key="authenticated-layout"
                    fallback={<Navigate to="/login" replace />}
                  >
                    <ThemedLayout
                      Sider={() => <CustomSider />}
                      Title={({ collapsed }) => (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          padding: '12px 16px',
                          fontSize: collapsed ? '16px' : '20px',
                          fontWeight: 'bold',
                          color: '#1890ff'
                        }}>
                          {collapsed ? '📊' : '📊 Base-CRM'}
                        </div>
                      )}
                    >
                      <Outlet />
                    </ThemedLayout>
                  </Authenticated>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="/contactos">
                  <Route index element={<ContactList />} />
                  <Route path="crear" element={<ContactCreate />} />
                  <Route path="editar/:id" element={<ContactEdit />} />
                  <Route path="mostrar/:id" element={<ContactShow />} />
                </Route>
                <Route path="/users">
                  <Route index element={<UserList />} />
                  <Route path="crear" element={<UserCreate />} />
                  <Route path="editar/:id" element={<UserEdit />} />
                  <Route path="mostrar/:id" element={<UserShow />} />
                </Route>
                <Route path="/configuracion" element={<UserSettingsPage />} />
              </Route>
              <Route path="/login" element={<LoginPage />} />
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
