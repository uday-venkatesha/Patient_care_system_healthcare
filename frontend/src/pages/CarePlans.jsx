import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { carePlanApi } from '../services/api';
import { ClipboardList, ChevronRight, Plus } from 'lucide-react';

const PRIORITY_COLORS = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a' };
const STATUS_COLORS   = { ACTIVE: '#16a34a', DRAFT: '#64748b', ON_HOLD: '#d97706', COMPLETED: '#2563eb', CANCELLED: '#dc2626' };

export default function CarePlans() {
  const navigate = useNavigate();
  const [carePlans, setCarePlans] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchCarePlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await carePlanApi.getMy({ status: statusFilter || undefined, page, size: 15 });
      setCarePlans(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchCarePlans(); }, [fetchCarePlans]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Care Plans</h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>{totalElements} care plans assigned to you</div>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          <Plus size={16} /> New Care Plan
        </button>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'ACTIVE', 'DRAFT', 'ON_HOLD', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: statusFilter === s ? '#0f172a' : '#f1f5f9',
            color: statusFilter === s ? '#fff' : '#64748b',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading care plans…</div>
      ) : carePlans.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #f1f5f9', color: '#94a3b8' }}>
          <ClipboardList size={40} color="#d1d5db" style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 4 }}>No care plans found</div>
          <div style={{ fontSize: 14 }}>Care plans assigned to you will appear here</div>
        </div>
      ) : (
        <div>
          {carePlans.map(cp => (
            <div key={cp.id} onClick={() => navigate(`/care-plans/${cp.id}`)} style={{
              background: '#fff', borderRadius: 10, padding: '18px 20px', marginBottom: 12,
              border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.15s',
              borderLeft: `4px solid ${PRIORITY_COLORS[cp.priority] || '#94a3b8'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{cp.title}</div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: STATUS_COLORS[cp.status] + '20', color: STATUS_COLORS[cp.status] }}>
                    {cp.status}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                  Patient: <strong style={{ color: '#0f172a' }}>{cp.patientName}</strong>
                  <span style={{ fontFamily: 'monospace', marginLeft: 8, color: '#94a3b8' }}>{cp.patientMrn}</span>
                </div>
                {cp.description && (
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    {cp.description.length > 80 ? cp.description.substring(0, 80) + '…' : cp.description}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
                  Created {new Date(cp.createdAt).toLocaleDateString()} by {cp.createdByName}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 20 }}>
                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: '#fff7ed', color: PRIORITY_COLORS[cp.priority] }}>
                  {cp.priority}
                </span>
                <ChevronRight size={16} color="#94a3b8" />
              </div>
            </div>
          ))}

          {totalElements > 15 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: 13 }}>Previous</button>
              <button disabled={carePlans.length < 15} onClick={() => setPage(p => p + 1)} style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: carePlans.length < 15 ? 'not-allowed' : 'pointer', fontSize: 13 }}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
