import React, { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';
import { CheckSquare, Clock, AlertTriangle, User } from 'lucide-react';

const PRIORITY_STYLES = {
  CRITICAL: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  HIGH:     { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  MEDIUM:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  LOW:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

const STATUS_OPTIONS = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];

const TaskCard = ({ task, onComplete }) => {
  const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '16px 20px',
      border: `1px solid ${p.border}`,
      borderLeft: `4px solid ${p.color}`,
      marginBottom: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{task.title}</span>
            {isOverdue && <AlertTriangle size={14} color="#ef4444" />}
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            {task.type} · Patient: <strong>{task.patientName || '—'}</strong>
          </div>
          {task.description && (
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>{task.description}</div>
          )}
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8' }}>
            {task.dueDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: isOverdue ? '#ef4444' : '#94a3b8' }}>
                <Clock size={12} /> Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.assignedToName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={12} /> {task.assignedToName}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginLeft: 16 }}>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: p.bg, color: p.color }}>
            {task.priority}
          </span>
          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: '#f8fafc', color: '#64748b' }}>
            {task.status}
          </span>
          {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
            <button onClick={() => onComplete(task.id)} style={{
              fontSize: 12, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
              background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <CheckSquare size={12} /> Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskApi.getMy({ status: statusFilter || undefined, page, size: 20, sort: 'dueDate,asc' });
      setTasks(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleComplete = async (taskId) => {
    try {
      await taskApi.complete(taskId);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const overdueCount = tasks.filter(t => t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED')).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>My Tasks</h1>
          <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>{totalElements} total</span>
            {pendingCount > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{pendingCount} pending</span>}
            {overdueCount > 0 && <span style={{ color: '#ef4444', fontWeight: 600 }}>{overdueCount} overdue</span>}
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 500,
            background: statusFilter === s ? '#0f172a' : '#f1f5f9',
            color: statusFilter === s ? '#fff' : '#64748b',
            transition: 'all 0.15s',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #f1f5f9' }}>
          <CheckSquare size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 4 }}>All caught up!</div>
          <div style={{ fontSize: 14, color: '#94a3b8' }}>No tasks match the current filter</div>
        </div>
      ) : (
        <>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} />
          ))}
          {totalElements > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{
                padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 13,
              }}>Previous</button>
              <button disabled={tasks.length < 20} onClick={() => setPage(p => p + 1)} style={{
                padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: tasks.length < 20 ? 'not-allowed' : 'pointer', fontSize: 13,
              }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
