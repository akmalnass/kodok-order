import React from 'react';
import { useNavigate } from 'react-router-dom';
import CoffeeImage from '../assets/Coffee.jpg';

function LandingPage() {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin-login'); // Navigasi ke halaman Admin Login
  };

  const handleStaffLogin = () => {
    navigate('/staff-login'); // Navigasi ke halaman Staff Login
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Welcome to Kodok Order</h1>
        <div style={styles.buttonContainer}>
          <button
            style={styles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
            onClick={handleAdminLogin}
          >
            Admin Login
          </button>
          <button
            style={styles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#007bff')}
            onClick={handleStaffLogin}
          >
            Staff Login
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: `url(${CoffeeImage})`, // Tambahkan background image
    backgroundSize: 'cover', // Pastikan gambar menutupi seluruh area
    backgroundPosition: 'center', // Posisikan gambar di tengah
    backgroundRepeat: 'no-repeat', // Jangan ulangi gambar
    color: '#fff', // Ubah warna teks agar kontras dengan gambar
  },
  box: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Latar belakang semi-transparan
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Tambahkan bayangan
  },
  title: {
    fontSize: '2.5rem',
    color: '#fff', // Sesuaikan warna teks
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#ddd', // Sesuaikan warna teks
    marginBottom: '2rem',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center', // Posisikan tombol di tengah secara horizontal
    alignItems: 'center', // Posisikan tombol di tengah secara vertikal
    gap: '1rem', // Jarak antar tombol
  },
  button: {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3', // Warna saat hover
  },
};

export default LandingPage;