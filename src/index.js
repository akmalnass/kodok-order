import React from 'react';
import ReactDOM from 'react-dom/client'; // Gunakan 'react-dom/client' untuk React 18
import App from './App';
import './index.css'; // Jika anda mempunyai fail CSS global

const root = ReactDOM.createRoot(document.getElementById('root')); // Gunakan createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
