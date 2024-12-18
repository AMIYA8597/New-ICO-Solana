// src/components/ui/card.js
export function Card({ children }) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
        {children}
      </div>
    );
  }
  