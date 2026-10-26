// src/components/TestCard.tsx
export default function TestCard() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      zIndex: 9999 
    }}>
      <div style={{
        width: '400px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        border: '3px solid red'
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '16px' }}>
          TEST CARD
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
          Nëse e sheh këtë kutí me border të kuq, CSS po punon
        </p>
        <input 
          type="text"
          placeholder="Test input"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '16px'
          }}
        />
        <button style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
}