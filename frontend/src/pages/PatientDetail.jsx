import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi, carePlanApi } from '../services/api';
import { ArrowLeft, ClipboardList, Phone, MapPin, AlertCircle } from 'lucide-react';

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
    <span style={{ fontSize: 13, color: '#64748b', width: 160, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500 }}>{value || '—'}</span>
  </div>
);

const PRIORITY_COLORS = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a' };

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [carePlans, setCarePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetch = async () => {
      try {
        const patRes = await patientApi.get(id);
        setPatient(patRes.data);
      } catch (e) {
        console.error('Failed to load patient:', e);
      } finally {
        setLoading(false);
      }
      try {
        const cpRes = await carePlanApi.getByPatient(id);
        setCarePlans(cpRes.data);
      } catch (e) {
        console.error('Failed to load care plans:', e);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div style={{ padding: 32, color: '#94a3b8' }}>Loading patient record…</div>;
  if (!patient) return <div style={{ padding: 32, color: '#dc2626' }}>Patient not found</div>;

  const tabs = ['info', 'care-plans'];

  return (
    <div>
      {/* Back + header */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{patient.fullName}</h1>
            <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>MRN: {patient.medicalRecordNumber}</div>
          </div>
          <span style={{
            fontSize: 13, padding: '5px 14px', borderRadius: 20, fontWeight: 600,
            background: patient.status === 'ICU' ? '#fef2f2' : '#eff6ff',
            color: patient.status === 'ICU' ? '#dc2626' : '#2563eb',
          }}>
            {patient.status}
          </span>
        </div>

        {patient.allergies && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '8px 12px', background: '#fef2f2', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
            <AlertCircle size={14} /> <strong>Allergies:</strong> {patient.allergies}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#fff', borderRadius: 10, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '12px 20px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            background: activeTab === tab ? '#0ea5e9' : '#fff',
            color: activeTab === tab ? '#fff' : '#64748b',
            transition: 'all 0.15s',
          }}>
            {tab === 'info' ? 'Patient Info' : `Care Plans (${carePlans.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Personal Information</h3>
          <InfoRow label="Date of Birth" value={patient.dateOfBirth} />
          <InfoRow label="Gender" value={patient.gender} />
          <InfoRow label="Phone" value={patient.phoneNumber} />
          <InfoRow label="Address" value={patient.address} />
          <InfoRow label="Department" value={patient.departmentName} />
          <InfoRow label="Primary Doctor" value={patient.primaryDoctorName} />
          <InfoRow label="Admitted" value={patient.admittedAt ? new Date(patient.admittedAt).toLocaleDateString() : null} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '20px 0 12px' }}>Emergency Contact</h3>
          <InfoRow label="Name" value={patient.emergencyContactName} />
          <InfoRow label="Phone" value={patient.emergencyContactPhone} />
          {patient.diagnosis && (
            <>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '20px 0 12px' }}>Diagnosis</h3>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>{patient.diagnosis}</p>
            </>
          )}
        </div>
      )}

      {activeTab === 'care-plans' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => navigate('/care-plans')} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <ClipboardList size={14} /> New Care Plan
            </button>
          </div>
          {carePlans.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, textAlign: 'center', color: '#94a3b8', border: '1px solid #f1f5f9' }}>
              No care plans yet for this patient
            </div>
          ) : (
            carePlans.map(cp => (
              <div key={cp.id} onClick={() => navigate(`/care-plans/${cp.id}`)} style={{
                background: '#fff', borderRadius: 10, padding: '16px 20px', marginBottom: 12,
                border: '1px solid #f1f5f9', cursor: 'pointer', transition: 'all 0.15s',
                borderLeft: `4px solid ${PRIORITY_COLORS[cp.priority] || '#94a3b8'}`,
              }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{cp.title}</div>
                  <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>{cp.status}</span>
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{cp.coordinatorName ? `Coordinator: ${cp.coordinatorName}` : 'No coordinator'}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
