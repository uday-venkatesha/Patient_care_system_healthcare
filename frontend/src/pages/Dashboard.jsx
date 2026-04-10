import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { patientApi, carePlanApi, taskApi } from '../services/api';
import { Users, ClipboardList, CheckSquare, AlertTriangle, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
  <div onClick={onClick} style={{
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', gap: 16,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 0.15s, box-shadow 0.15s',
  }}
    onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, isAdmin, isCoordinator } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ admitted: 0, activePlans: 0, myPending: 0, overdue: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch each stat independently so one failure doesn't blank the whole dashboard
      const results = await Promise.allSettled([
        patientApi.search({ status: 'ADMITTED', size: 5, sort: 'createdAt,desc' }),
        taskApi.getMy({ status: 'PENDING', size: 1 }),
        carePlanApi.getMy({ status: 'ACTIVE', size: 1 }),
      ]);

      const [patientsResult, tasksResult, carePlansResult] = results;

      if (patientsResult.status === 'fulfilled') {
        setRecentPatients(patientsResult.value.data.content || []);
        setStats(prev => ({ ...prev, admitted: patientsResult.value.data.totalElements || 0 }));
      } else {
        console.error('Failed to load patients:', patientsResult.reason);
      }

      if (tasksResult.status === 'fulfilled') {
        setStats(prev => ({ ...prev, myPending: tasksResult.value.data.totalElements || 0 }));
      } else {
        console.error('Failed to load tasks:', tasksResult.reason);
      }

      if (carePlansResult.status === 'fulfilled') {
        setStats(prev => ({ ...prev, activePlans: carePlansResult.value.data.totalElements || 0 }));
      } else {
        console.error('Failed to load care plans:', carePlansResult.reason);
      }

      setLoading(false);
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleColor = (role) => {
    const map = { ADMIN: '#7c3aed', CARE_COORDINATOR: '#0ea5e9', DOCTOR: '#16a34a', NURSE: '#ea580c' };
    return map[role] || '#64748b';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
          {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: getRoleColor(user?.role) + '20', color: getRoleColor(user?.role),
          }}>
            {user?.role?.replace('_', ' ')}
          </span>
          {user?.departmentName && (
            <span style={{ fontSize: 13, color: '#64748b' }}>· {user.departmentName}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Users} label="Admitted Patients" value={stats.admitted} color="#0ea5e9"
          onClick={() => navigate('/patients?status=ADMITTED')} />
        <StatCard icon={CheckSquare} label="My Pending Tasks" value={stats.myPending} color="#f59e0b"
          onClick={() => navigate('/tasks?status=PENDING')} />
        <StatCard icon={ClipboardList} label="Active Care Plans" value={stats.activePlans || '—'} color="#16a34a"
          onClick={() => navigate('/care-plans')} />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={stats.overdue || '—'} color="#ef4444" />
      </div>

      {/* Recent Patients */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Recent Patients</h2>
            <button onClick={() => navigate('/patients')} style={{
              fontSize: 12, color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
            }}>View all →</button>
          </div>
          {loading ? (
            <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading…</div>
          ) : recentPatients.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 14 }}>No patients found</div>
          ) : (
            recentPatients.map((p) => (
              <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)} style={{
                padding: '10px 0', borderBottom: '1px solid #f8fafc',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{p.fullName}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>MRN: {p.medicalRecordNumber}</div>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 600,
                  background: p.status === 'ICU' ? '#fef2f2' : '#f0fdf4',
                  color: p.status === 'ICU' ? '#dc2626' : '#16a34a',
                }}>
                  {p.status}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '+ Admit New Patient', to: '/patients/new', bg: '#eff6ff', color: '#2563eb' },
              { label: '+ Create Care Plan', to: '/care-plans', bg: '#f0fdf4', color: '#16a34a' },
              { label: '+ Assign Task', to: '/tasks', bg: '#fffbeb', color: '#d97706' },
            ].map(({ label, to, bg, color }) => (
              <button key={label} onClick={() => navigate(to)} style={{
                padding: '12px 16px', background: bg, color, border: 'none',
                borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                textAlign: 'left', transition: 'opacity 0.15s',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
