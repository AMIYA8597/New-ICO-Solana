// src/components/ui/input.js
export function Input(props) {
    return (
      <input
        {...props}
        style={{
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
        }}
      />
    );
  }
  