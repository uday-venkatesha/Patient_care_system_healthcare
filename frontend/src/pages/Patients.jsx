import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../services/api';
import { Search, Plus, ChevronRight, User } from 'lucide-react';

const STATUS_COLORS = {
  ADMITTED: { bg: '#eff6ff', color: '#2563eb' },
  DISCHARGED: { bg: '#f9fafb', color: '#6b7280' },
  ICU: { bg: '#fef2f2', color: '#dc2626' },
  OBSERVATION: { bg: '#fffbeb', color: '#d97706' },
  OUTPATIENT: { bg: '#f0fdf4', color: '#16a34a' },
};

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientApi.search({
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        size: 15,
        sort: 'lastName,asc',
      });
      setPatients(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Debounce search
  useEffect(() => { setPage(0); }, [search, statusFilter]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Patients</h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>{totalElements} total patients</div>
        </div>
        <button onClick={() => navigate('/patients/new')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8,
          padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
        }}>
          <Plus size={16} /> Admit Patient
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by name or MRN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 38px', boxSizing: 'border-box',
              border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14,
              background: '#fff', outline: 'none',
            }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{
          padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
          fontSize: 14, background: '#fff', outline: 'none', color: '#374151',
        }}>
          <option value="">All Statuses</option>
          {['ADMITTED', 'ICU', 'OBSERVATION', 'OUTPATIENT', 'DISCHARGED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              {['Patient', 'MRN', 'Department', 'Primary Doctor', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading patients…</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No patients found</td></tr>
            ) : (
              patients.map((p) => {
                const statusStyle = STATUS_COLORS[p.status] || { bg: '#f9fafb', color: '#6b7280' };
                return (
                  <tr key={p.id} onClick={() => navigate(`/patients/${p.id}`)} style={{
                    borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'background 0.1s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={15} color="#2563eb" />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{p.fullName}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            {p.gender} · DOB {p.dateOfBirth}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: 'monospace', color: '#475569' }}>{p.medicalRecordNumber}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{p.departmentName || '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{p.primaryDoctorName || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <ChevronRight size={16} color="#94a3b8" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalElements > 15 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} style={{
              padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff',
              fontSize: 13, cursor: page === 0 ? 'not-allowed' : 'pointer', color: '#374151',
            }}>Previous</button>
            <span style={{ padding: '6px 12px', fontSize: 13, color: '#64748b' }}>Page {page + 1}</span>
            <button disabled={patients.length < 15} onClick={() => setPage(p => p + 1)} style={{
              padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff',
              fontSize: 13, cursor: patients.length < 15 ? 'not-allowed' : 'pointer', color: '#374151',
            }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
