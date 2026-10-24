
import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Layout,
  Menu,
  Badge,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Breadcrumb,
  theme,
  Grid,
  Drawer,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import { useBranding } from '../contexts/BrandingContext';
import { homePathForRole } from '../config/roles';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const breadcrumbNameMap = {
  '/owner': 'Dashboard',
  '/owner/houses': 'Houses',
  '/owner/houses/new': 'Add House',
  '/owner/tenants': 'Tenants',
  '/owner/tenants/new': 'Add Tenant',
  '/owner/rentals': 'Rentals',
  '/owner/rentals/new': 'Add Rental',
  '/owner/rental-requests': 'Rental Requests',
  '/owner/contracts': 'Contracts',
  '/owner/payments': 'Payments',
  '/owner/payments/new': 'Record Payment',
  '/owner/receipts': 'Receipts',
  '/owner/reports': 'Reports',
  '/owner/search': 'Search',
  '/owner/notifications': 'Notifications',
  '/owner/settings': 'Settings',
  '/tenant': 'Dashboard',
  '/tenant/my-room': 'My Room',
  '/tenant/requests': 'My Requests',
  '/tenant/payments': 'My Payments',
  '/tenant/receipts': 'My Receipts',
  '/tenant/contracts': 'My Contracts',
  '/tenant/report-owner': 'Report an Owner',
  '/tenant/feedback': 'Feedback',
  '/tenant/notifications': 'Notifications',
  '/tenant/profile': 'Profile',
  '/owner/feedback': 'Feedback',
  '/admin': 'System Admin',
  '/admin/users': 'Users',
  '/admin/reports': 'Reports',
  '/admin/feedback': 'Feedback',
  '/admin/verifications': 'Owner Verifications',
  '/admin/verified-owners': 'Verified Owners',
};

const titleCase = (s) =>
  String(s)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function AppLayout({
  menuItems = [],
  siderColor = '#0a2a4d',
  children,
}) {
  // Get Ant Design theme tokens.
  const { token: themeToken } = theme.useToken();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sider:collapsed') === '1';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const location = useLocation();
  const navigate = useNavigate();

  const { appBranding: branding } = useBranding();

  useEffect(() => {
    try {
      localStorage.setItem(
        'sider:collapsed',
        collapsed ? '1' : '0'
      );
    } catch {
      // Ignore storage errors.
    }
  }, [collapsed]);

  // Build breadcrumb paths without multiline template literals.
  const pathSnippets = location.pathname
    .split('/')
    .filter((i) => i);

  const breadcrumbItems = [
    { title: <Link to="/">Home</Link> },
    ...pathSnippets.map((snippet, index) => {
      const url =
        '/' + pathSnippets.slice(0, index + 1).join('/');

      return {
        title: breadcrumbNameMap[url] || titleCase(snippet),
      };
    }),
  ];

  const profilePath =
    user?.role === 'owner'
      ? '/owner/settings'
      : user?.role === 'admin'
        ? '/admin'
        : '/tenant/profile';

  const notificationsPath =
    user?.role === 'owner'
      ? '/owner/notifications'
      : user?.role === 'admin'
        ? '/admin'
        : '/tenant/notifications';

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate(profilePath),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;

    const collectKeys = (items) =>
      items.flatMap((item) => {
        if (Array.isArray(item.children)) {
          return collectKeys(item.children);
        }

        if (typeof item.key === 'string') {
          return [item.key];
        }

        return [];
      });

    const allKeys = collectKeys(menuItems);

    const matches = allKeys
      .filter(
        (key) => path === key || path.startsWith(key + '/')
      )
      .sort((a, b) => b.length - a.length);

    return matches.length > 0 ? [matches[0]] : [];
  };

  const navMenu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKey()}
      items={menuItems}
      onClick={({ key }) => {
        navigate(key);

        if (isMobile) {
          setMobileOpen(false);
        }
      }}
      style={{
        background: 'transparent',
        borderRight: 0,
      }}
    />
  );

  // Logo block: displays branding in the sidebar and mobile drawer.
  const brandBlock = (
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: collapsed && !isMobile ? 8 : 12,
        background: '#fff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onClick={() => navigate(homePathForRole(user))}
    >
      <img
        src={branding.mark}
        alt={branding.name}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="dark"
          style={{ background: siderColor }}
          width={256}
          collapsedWidth={72}
        >
          {brandBlock}
          {navMenu}
        </Sider>
      )}

      <Drawer
        open={isMobile && mobileOpen}
        onClose={() => setMobileOpen(false)}
        placement="left"
        width={256}
        closable={false}
        styles={{
          body: {
            padding: 0,
            background: siderColor,
          },
        }}
      >
        {brandBlock}
        {navMenu}
      </Drawer>

      <Layout>
        <Header
          style={{
            padding: isMobile ? '0 16px' : '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            onClick={() =>
              isMobile
                ? setMobileOpen(true)
                : setCollapsed(!collapsed)
            }
            style={{
              fontSize: 18,
              cursor: 'pointer',
              color: themeToken.colorText,
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label={
              isMobile
                ? 'Open menu'
                : collapsed
                  ? 'Expand menu'
                  : 'Collapse menu'
            }
          >
            {isMobile ? (
              <MenuOutlined />
            ) : collapsed ? (
              <MenuUnfoldOutlined />
            ) : (
              <MenuFoldOutlined />
            )}
          </div>

          <Space size={isMobile ? 12 : 20}>
            <Link to={notificationsPath}>
              <Badge count={unreadCount} size="small">
                <BellOutlined
                  style={{
                    fontSize: 18,
                    color: themeToken.colorText,
                  }}
                />
              </Badge>
            </Link>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={36}
                  icon={<UserOutlined />}
                  src={user?.avatar}
                  style={{ backgroundColor: siderColor }}
                />

                {!isMobile && (
                  <div style={{ lineHeight: '20px' }}>
                    <Text
                      strong
                      style={{
                        fontSize: 14,
                        display: 'block',
                      }}
                    >
                      {user?.name || 'User'}
                    </Text>

                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user?.role || 'guest'}
                    </Text>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: isMobile ? 8 : 24,
            padding: isMobile ? 16 : 24,
            background: themeToken.colorBgContainer,
            borderRadius: themeToken.borderRadiusLG,
            minHeight: 280,
          }}
        >
          <Breadcrumb
            items={breadcrumbItems}
            style={{ marginBottom: 16 }}
            separator={<RightOutlined />}
          />

          {children !== undefined ? children : <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
}