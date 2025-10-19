import React from 'react';
import { AuthPage } from '@refinedev/antd';
import { Typography } from 'antd';

const { Title } = Typography;

export const LoginPage: React.FC = () => {
  return (
    <AuthPage
      type="login"
      title={<Title level={2}>Base CRM</Title>}
      formProps={{
        initialValues: {
          email: 'admin@example.com',
          password: 'admin123',
        },
      }}
      renderContent={(content) => (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '40px',
              borderRadius: '8px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              width: '400px',
            }}
          >
            {content}
          </div>
        </div>
      )}
    />
  );
};
