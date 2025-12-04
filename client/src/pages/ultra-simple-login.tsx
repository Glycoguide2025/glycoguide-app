export default function UltraSimpleLogin() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '400px'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Ultra Simple Login Test</h1>
        <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
          This is a plain HTML form with NO React Hook Form, NO Radix UI, NO libraries.
          Just try typing in the fields below.
        </p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const email = (document.getElementById('test-email') as HTMLInputElement).value;
          const password = (document.getElementById('test-password') as HTMLInputElement).value;
          alert(`Email: ${email}\nPassword: ${password}`);
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="test-email" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Email
            </label>
            <input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                color: '#000'
              }}
              onKeyDown={(e) => {
                console.log('Key pressed:', e.key);
              }}
              onChange={(e) => {
                console.log('Value changed:', e.target.value);
                const counter = document.getElementById('email-counter');
                if (counter) {
                  counter.textContent = `Characters typed: ${e.target.value.length}`;
                }
              }}
            />
            <div id="email-counter" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Characters typed: 0
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="test-password" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '500' }}>
              Password
            </label>
            <input
              id="test-password"
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                color: '#000'
              }}
              onKeyDown={(e) => {
                console.log('Password key pressed:', e.key);
              }}
              onChange={(e) => {
                console.log('Password changed:', e.target.value.length, 'chars');
                const counter = document.getElementById('password-counter');
                if (counter) {
                  counter.textContent = `Characters typed: ${e.target.value.length}`;
                }
              }}
            />
            <div id="password-counter" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Characters typed: 0
            </div>
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
          >
            Test Submit
          </button>
        </form>
        
        <div style={{ marginTop: '20px', padding: '12px', background: '#f0f0f0', borderRadius: '4px', fontSize: '12px' }}>
          <strong>Instructions:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Try typing in the email field</li>
            <li>Watch the character counter update</li>
            <li>Check browser console for key events</li>
            <li>If this works, the issue is with React Hook Form or Radix UI</li>
            <li>If this doesn't work, the issue is DOM/CSS level</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
