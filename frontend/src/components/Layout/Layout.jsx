import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, ClipboardList, CheckSquare,
  Bell, Menu, X, LogOut, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: null },
  { to: '/patients',  icon: Users,           label: 'Patients',  roles: null },
  { to: '/care-plans',icon: ClipboardList,   label: 'Care Plans',roles: null },
  { to: '/tasks',     icon: CheckSquare,     label: 'My Tasks',  roles: null },
];

export default function Layout() {
  const { user, logout, unreadCount, notifications, wsConnected, clearUnread, isAdmin, isCoordinator } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const toggleNotifications = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen) clearUnread();
  };

  const getSeverityColor = (severity) => {
    const map = { CRITICAL: '#ef4444', WARNING: '#f59e0b', INFO: '#3b82f6', ERROR: '#ef4444' };
    return map[severity] || '#3b82f6';
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: '#0f172a',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        flexShrink: 0,
        zIndex: 100,
      }}>
        {/* Header */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1e293b' }}>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#38bdf8' }}>CareCoord</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Clinical Workflow</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', textDecoration: 'none',
              color: isActive ? '#38bdf8' : '#94a3b8',
              background: isActive ? '#1e293b' : 'transparent',
              borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
              transition: 'all 0.15s',
            })}>
              <Icon size={18} />
              {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {sidebarOpen && user && (
          <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{user.fullName}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{user.role?.replace('_', ' ')}</div>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid #334155', color: '#94a3b8',
              borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12, width: '100%',
            }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          gap: 16, justifyContent: 'flex-end', flexShrink: 0,
        }}>
          {/* WS status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: wsConnected ? '#16a34a' : '#dc2626' }}>
            {wsConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {wsConnected ? 'Live' : 'Offline'}
          </div>

          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button onClick={toggleNotifications} style={{
              background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 6,
            }}>
              <Bell size={20} color="#475569" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
                  borderRadius: '50%', width: 17, height: 17,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', marginTop: 8,
                width: 360, maxHeight: 400, overflowY: 'auto',
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 1000,
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                  Notifications
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={n.id || i} style={{
                      padding: '12px 16px', borderBottom: '1px solid #f8fafc',
                      borderLeft: `4px solid ${getSeverityColor(n.severity)}`,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
                        {n.severity === 'CRITICAL' && <AlertTriangle size={12} style={{ marginRight: 4, color: '#ef4444' }} />}
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(n.timestamp || n.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
          }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
