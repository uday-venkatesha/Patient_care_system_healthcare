import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: '#e2e8f0' }}>404</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Page Not Found</div>
      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>The page you're looking for doesn't exist.</div>
      <button onClick={() => navigate('/dashboard')} style={{
        padding: '10px 20px', background: '#0ea5e9', color: '#fff',
        border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
      }}>Go to Dashboard</button>
    </div>
  );
}
