import React, { useState } from 'react';
import { useLogout, useMenu, useGo } from '@refinedev/core';
import { Layout as AntdLayout, Menu } from 'antd';
import {
  LogoutOutlined,
  SettingOutlined,
  ContactsOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Sider: AntdSider } = AntdLayout;

export const CustomSider: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { mutate: logout } = useLogout();
  const { menuItems, selectedKey } = useMenu();
  const go = useGo();

  // Filter menu items
  const contactosItem = menuItems.find(item => item.name === 'contactos');
  const usersItem = menuItems.find(item => item.name === 'users');

  const handleMenuClick = (route?: string) => {
    if (route) {
      go({ to: route });
    }
  };

  return (
    <AntdSider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      breakpoint="lg"
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Top Menu - Main Navigation */}
        <div style={{ flex: 1, paddingTop: '16px' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            items={[
              contactosItem && {
                key: contactosItem.name,
                icon: <ContactsOutlined />,
                label: 'Contactos',
                onClick: () => handleMenuClick(contactosItem.route),
              },
            ].filter(Boolean) as any}
          />
        </div>

        {/* Bottom Menu - Admin Actions */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Configuración',
                onClick: () => handleMenuClick('/configuracion'),
              },
              usersItem && {
                key: usersItem.name,
                icon: <TeamOutlined />,
                label: 'Usuarios',
                onClick: () => handleMenuClick(usersItem.route),
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Cerrar Sesión',
                onClick: () => logout(),
                danger: true,
              },
            ].filter(Boolean) as any}
          />
        </div>
      </div>
    </AntdSider>
  );
};
