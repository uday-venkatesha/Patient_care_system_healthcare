import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { carePlanApi, taskApi } from '../services/api';
import { ArrowLeft, CheckSquare, Clock, User } from 'lucide-react';

export default function CarePlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [carePlan, setCarePlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cpRes, tasksRes] = await Promise.all([
          carePlanApi.get(id),
          taskApi.getByCarePlan(id),
        ]);
        setCarePlan(cpRes.data);
        setTasks(tasksRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleCompleteTask = async (taskId) => {
    await taskApi.complete(taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));
  };

  if (loading) return <div style={{ padding: 32, color: '#94a3b8' }}>Loading…</div>;
  if (!carePlan) return <div style={{ padding: 32, color: '#dc2626' }}>Care plan not found</div>;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const PRIORITY_COLORS = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a' };

  return (
    <div>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f1f5f9', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{carePlan.title}</h1>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Patient: <strong style={{ color: '#0f172a' }}>{carePlan.patientName}</strong>
              <span style={{ fontFamily: 'monospace', marginLeft: 8 }}>{carePlan.patientMrn}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>{carePlan.status}</span>
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: '#fff7ed', color: PRIORITY_COLORS[carePlan.priority], fontWeight: 600 }}>{carePlan.priority}</span>
          </div>
        </div>

        {carePlan.description && <p style={{ fontSize: 14, color: '#475569', margin: '0 0 12px', lineHeight: 1.6 }}>{carePlan.description}</p>}
        {carePlan.goals && (
          <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>GOALS</div>
            <p style={{ fontSize: 14, color: '#374151', margin: 0, lineHeight: 1.6 }}>{carePlan.goals}</p>
          </div>
        )}

        {/* Progress */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
            <span>Task Progress</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{completedTasks}/{tasks.length} ({progress}%)</span>
          </div>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#16a34a' : '#0ea5e9', borderRadius: 3, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <h2 style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Tasks ({tasks.length})</h2>
      {tasks.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 10, padding: 32, textAlign: 'center', color: '#94a3b8', border: '1px solid #f1f5f9' }}>No tasks in this care plan yet</div>
      ) : (
        tasks.map(task => (
          <div key={task.id} style={{
            background: '#fff', borderRadius: 10, padding: '14px 18px', marginBottom: 10,
            border: '1px solid #f1f5f9',
            borderLeft: `3px solid ${task.status === 'COMPLETED' ? '#16a34a' : PRIORITY_COLORS[task.priority] || '#94a3b8'}`,
            opacity: task.status === 'COMPLETED' ? 0.75 : 1,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: task.status === 'COMPLETED' ? '#94a3b8' : '#0f172a', textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none' }}>
                  {task.title}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  <span>{task.type}</span>
                  {task.assignedToName && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><User size={11} /> {task.assignedToName}</span>}
                  {task.dueDate && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f8fafc', color: '#64748b' }}>{task.status}</span>
                {task.status !== 'COMPLETED' && (
                  <button onClick={() => handleCompleteTask(task.id)} style={{
                    fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                    background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <CheckSquare size={12} /> Done
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
