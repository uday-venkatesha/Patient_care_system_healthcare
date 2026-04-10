import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  boxSizing: 'border-box',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
  outline: 'none',
  color: '#0f172a',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 0 };

export default function PatientForm() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    diagnosis: '',
    status: 'ADMITTED',
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        gender: form.gender || undefined,
        status: form.status || undefined,
      };
      const res = await patientApi.create(payload);
      navigate(`/patients/${res.data.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to admit patient. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/patients')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#64748b' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Admit New Patient</h1>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Fill in the patient details below</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {error && (
            <div ref={errorRef} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Personal Info */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>Personal Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>First Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inputStyle} value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Last Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inputStyle} value={form.lastName} onChange={set('lastName')} required />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Date of Birth <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" style={inputStyle} value={form.dateOfBirth} onChange={set('dateOfBirth')} required max={new Date(Date.now() - 86400000).toISOString().split('T')[0]} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Gender</label>
                <select style={inputStyle} value={form.gender} onChange={set('gender')}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Phone Number</label>
                <input style={inputStyle} value={form.phoneNumber} onChange={set('phoneNumber')} placeholder="+1 (555) 000-0000" />
              </div>
              <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={form.address} onChange={set('address')} placeholder="123 Main St, City, State" />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>Emergency Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Contact Name</label>
                <input style={inputStyle} value={form.emergencyContactName} onChange={set('emergencyContactName')} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Contact Phone</label>
                <input style={inputStyle} value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>

          {/* Clinical Info */}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>Clinical Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Admission Status</label>
                <select style={inputStyle} value={form.status} onChange={set('status')}>
                  <option value="ADMITTED">Admitted</option>
                  <option value="ICU">ICU</option>
                  <option value="OBSERVATION">Observation</option>
                  <option value="OUTPATIENT">Outpatient</option>
                  <option value="DISCHARGED">Discharged</option>
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Allergies</label>
                <input style={inputStyle} value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin, Aspirin" />
              </div>
              <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Diagnosis</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                  value={form.diagnosis}
                  onChange={set('diagnosis')}
                  placeholder="Primary diagnosis or reason for admission"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, padding: '10px 14px', fontSize: 14 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/patients')}
              style={{
                padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: 8,
                background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px', border: 'none', borderRadius: 8,
                background: submitting ? '#7dd3fc' : '#0ea5e9', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Admitting…' : 'Admit Patient'}
            </button>
          </div>
          </div>
        </div>
      </form>
    </div>
  );
}
