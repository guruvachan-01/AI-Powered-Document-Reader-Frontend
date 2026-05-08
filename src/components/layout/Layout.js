import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LayoutDashboard, MessageSquare, LogOut, User } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}><Zap size={18} color="#6c63ff" /></div>
          <span style={styles.brandText}>DocQA</span>
        </div>

        <nav style={styles.nav}>
          <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Documents" />
          <NavItem to="/chat" icon={<MessageSquare size={18} />} label="Chat" />
        </nav>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={styles.userName}>{user?.username}</div>
              <div style={styles.userRole}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === '/'}
    style={({ isActive }) => ({
      ...styles.navItem,
      background: isActive ? 'var(--accent-dim)' : 'transparent',
      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
      borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const styles = {
  shell: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  sidebar: {
    width: 220, flexShrink: 0,
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 20px 16px',
    borderBottom: '1px solid var(--border)',
  },
  brandIcon: {
    width: 32, height: 32,
    background: 'var(--accent-dim)', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandText: { fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16 },
  nav: { flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 20px', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', transition: 'all 0.2s',
  },
  userSection: {
    padding: 16, borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--accent-dim)', border: '1px solid var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: 'var(--accent)',
  },
  userName: { fontSize: 13, fontWeight: 500 },
  userRole: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  logoutBtn: {
    background: 'none', color: 'var(--text-muted)', padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center',
  },
  main: { flex: 1, overflow: 'auto' },
};

export default Layout;
