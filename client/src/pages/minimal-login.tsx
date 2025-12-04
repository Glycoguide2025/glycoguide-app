import { useState } from "react";

export default function MinimalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setMessage(`Attempting login with: ${email}`);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Login failed'}`);
      }
    } catch (err) {
      setMessage(`Network error: ${err}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '10px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <h1 style={{
          color: '#86A873',
          marginBottom: '10px',
          fontSize: '32px',
          textAlign: 'center'
        }}>
          Minimal Login Test
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          Absolute minimum code - if this doesn't work, it's environmental
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px'
          }}>
            Email Address
          </label>
          <input
            id="test-email-input"
            type="text"
            value={email}
            onChange={(e) => {
              console.log('Email onChange fired:', e.target.value);
              setEmail(e.target.value);
            }}
            onKeyDown={(e) => console.log('Email onKeyDown:', e.key)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#86A873'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '5px',
            fontFamily: 'monospace'
          }}>
            Length: {email.length} | Value: "{email}"
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px'
          }}>
            Password
          </label>
          <input
            id="test-password-input"
            type="password"
            value={password}
            onChange={(e) => {
              console.log('Password onChange fired:', e.target.value);
              setPassword(e.target.value);
            }}
            onKeyDown={(e) => {
              console.log('Password onKeyDown:', e.key);
              if (e.key === 'Enter') handleLogin();
            }}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#86A873'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '5px',
            fontFamily: 'monospace'
          }}>
            Length: {password.length} | Hidden: {password ? '•'.repeat(password.length) : '(empty)'}
          </div>
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px',
            background: '#86A873',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#759b62'}
          onMouseOut={(e) => e.currentTarget.style.background = '#86A873'}
        >
          Sign In
        </button>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#f0f0f0',
            borderRadius: '6px',
            fontSize: '14px',
            wordBreak: 'break-all'
          }}>
            <strong>Status:</strong> {message}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#e3f2fd',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li>Email length: {email.length}</li>
            <li>Password length: {password.length}</li>
            <li>Check browser console for onChange/onKeyDown logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
