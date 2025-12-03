import React from 'react';

function ResumoCard({ titulo, valor, cor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: cor,
        color: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        flex: '1',
        margin: '0.5rem',
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <h3>{titulo}</h3>
      <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{valor}</p>
    </div>
  );
}


export default ResumoCard;