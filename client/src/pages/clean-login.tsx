import { useState } from "react";

export default function CleanLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(`Attempting login with: ${email}`);
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        setResult("Login successful!");
        window.location.href = '/';
      } else {
        const data = await res.json();
        setResult(`Login failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #d1fae5, #ffffff, #fecaca)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#86A873',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          GlycoGuide - Clean Test
        </h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
          100% Plain Login Form
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                console.log('Email onChange fired:', e.target.value);
                setEmail(e.target.value);
              }}
              onKeyDown={(e) => console.log('Email keydown:', e.key)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #86A873',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your email"
              autoComplete="off"
              data-testid="input-clean-email"
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Typed: "{email}" ({email.length} chars)
            </p>
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                console.log('Password onChange fired:', e.target.value);
                setPassword(e.target.value);
              }}
              onKeyDown={(e) => console.log('Password keydown:', e.key)}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #86A873',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your password"
              autoComplete="off"
              data-testid="input-clean-password"
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Typed: {password.length} chars
            </p>
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
              fontWeight: '600',
              cursor: 'pointer'
            }}
            data-testid="button-clean-submit"
          >
            Sign In
          </button>

          {result && (
            <div style={{
              padding: '12px',
              background: '#f0f0f0',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {result}
            </div>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          <a href="/auth" style={{ color: '#86A873' }}>Back to normal login</a>
        </p>
      </div>
    </div>
  );
}
