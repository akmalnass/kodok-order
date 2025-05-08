import React from 'react';

function Header({ title }) {
  return (
    <header style={{ padding: '0px', backgroundColor: '#D3FEEA', color: '#000', textAlign: 'left' }}>
        <h1 style={{ marginLeft: '50px' }}>{title}</h1> 
    </header>
  );
}

export default Header;