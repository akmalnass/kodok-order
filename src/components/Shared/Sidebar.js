import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/KodokKodok.png'; // Pastikan path logo betul

function Sidebar({ activeSection, setActiveSection }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin-login'); // Redirect ke halaman login
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <div style={styles.logoText}>KodokKodok</div>
      </div>
      <button
        style={{
          ...styles.menuItem,
          ...(activeSection === 'salesDashboard' ? styles.menuItemActive : {}),
        }}
        onClick={() => setActiveSection('salesDashboard')}
      >
        Sales Dashboard
      </button>
      <button
        style={{
          ...styles.menuItem,
          ...(activeSection === 'manageStaff' ? styles.menuItemActive : {}),
        }}
        onClick={() => setActiveSection('manageStaff')}
      >
        Manage Staff
      </button>
      <button
        style={{
          ...styles.menuItem,
          ...(activeSection === 'manageMenu' ? styles.menuItemActive : {}),
        }}
        onClick={() => setActiveSection('manageMenu')}
      >
        Manage Menu
      </button>
      <button
        style={{
          ...styles.menuItem,
          ...(activeSection === 'orderList' ? styles.menuItemActive : {}),
        }}
        onClick={() => setActiveSection('orderList')}
      >
        View Order List
      </button>
      <button style={styles.menuItem} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed', // Tetap di sisi kiri layar
    top: 0,
    left: 0,
    bottom: 0,
    width: '250px',
    height: '100vh', // Isi seluruh tinggi viewport
    backgroundColor: '#0B8B4B',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    boxShadow: '14px 4px 30px rgba(0, 0, 0, 0.25)',
    overflowY: 'auto', // Tambahkan scroll jika konten terlalu panjang
  },
  logoContainer: {
    marginBottom: '20px',
  },
  logo: {
    width: '100px',
    height: 'auto',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
  },
  menuItem: {
    width: '100%',
    padding: '10px 20px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#00D16A',
    border: 'none',
    borderRadius: '5px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  menuItemActive: {
    backgroundColor: '#007BFF',
  },
};

export default Sidebar;