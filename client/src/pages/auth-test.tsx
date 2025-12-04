import { useState } from "react";

export default function AuthTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Email: ${email}\nPassword: ${password}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '10px', color: '#86A873' }}>Simple Login Test</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>Basic HTML inputs - no React Hook Form</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label 
              htmlFor="email"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <small style={{ color: '#666' }}>Value: {email || '(empty)'}</small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="password"
              style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <small style={{ color: '#666' }}>Entered: {password ? '***' : '(empty)'}</small>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: '#86A873',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Test Submit
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f0f0f0',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Debug Info:</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Email length: {email.length}</p>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>Password length: {password.length}</p>
          <p style={{ margin: '5px 0', fontSize: '14px', color: email ? 'green' : 'red' }}>
            {email ? '✓ Email input working!' : '✗ Email input not working'}
          </p>
        </div>
      </div>
    </div>
  );
}
