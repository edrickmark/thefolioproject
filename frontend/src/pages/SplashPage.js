import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SplashPage() {
  const navigate = useNavigate();
  const [dots, setDots] = useState('...');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => {
        const count = (prev.length % 3) + 1;
        return '.'.repeat(count);
      });
    }, 500);

    const timer = setTimeout(() => {
      clearInterval(dotInterval);
      navigate('/home');
    }, 3000);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #FFE9EF 0%, #FF9CB5 100%)'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ marginBottom: '30px' }}>
          <img 
            src="/photos/c14.jpg" 
            alt="Mi Ilao Logo"
            style={{ width: '300px', height: '300px', borderRadius: '50%' }}
          />
        </div>
        <h1 style={{ fontSize: '42px', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Mi Ilao
        </h1>
        <div style={{
          width: '80px',
          height: '80px',
          border: '8px solid rgba(255,255,255,0.3)',
          borderTop: '8px solid white',
          borderRadius: '50%',
          margin: '30px auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ fontSize: '20px', marginTop: '20px' }}>
          Loading<span>{dots}</span>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default SplashPage;