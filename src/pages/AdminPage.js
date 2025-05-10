import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; // Tambahkan Outlet
import { collection, onSnapshot, } from 'firebase/firestore';
import { db } from '../firebase'; // Sesuaikan path dengan lokasi baru
import Header from '../components/Shared/Header';
import logo from '../assets/KodokKodok.png';


function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mendapatkan path semasa
  const [notifications, setNotifications] = useState([]);

  // Fungsi untuk menambahkan notifikasi ke Firestore

  // Mendengarkan notifikasi secara real-time dari Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const adminNotifications = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              time: data.time.toDate().toLocaleString(), // Konversi Timestamp ke string
            };
          })
          .filter((notif) => notif.role === 'Admin'); // Filter untuk Admin
        setNotifications(adminNotifications);
      }
    );

    return () => unsubscribe(); // Bersihkan listener saat komponen unmount
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear all data from localStorage
    navigate('/admin-login'); // Redirect to Admin Login Page
  };


  console.log('Admin Notifications:', notifications);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <div style={styles.logoText}>KodokKodok</div>
        </div>
        <button
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/admin/dashboard' ? styles.menuItemActive : {}),
          }}
          onClick={() => navigate('/admin/dashboard')}
        >
          Sales Dashboard
        </button>
        <button
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/admin/Staff-Management' ? styles.menuItemActive : {}),
          }}
          onClick={() => navigate('/admin/Staff-Management')}
        >
          Staff Management
        </button>
        <button
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/admin/Menu-list' ? styles.menuItemActive : {}),
          }}
          onClick={() => navigate('/admin/Menu-list')}
        >
          Menu
        </button>
        <button
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/admin/Order-list' ? styles.menuItemActive : {}),
          }}
          onClick={() => navigate('/admin/Order-list')}
        >
          Order List
        </button>
        <button style={styles.logoutButton} onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <div style={styles.mainContent}>
        <Header title="Admin" notifications={notifications} />
        <div style={styles.content}>
          <Outlet /> {/* Tambahkan Outlet untuk memaparkan kandungan halaman anak */}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#D3FEEA',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '250px',
    height: '100vh',
    backgroundColor: '#0B8B4B',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    boxShadow: '14px 4px 30px rgba(0, 0, 0, 0.25)',
    overflowY: 'auto',
    zIndex: 1000,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '70px',
  },
  logo: {
    width: '100px',
    height: '100px',
    backgroundColor: 'transparent',
    borderRadius: '0',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700', // Bold
    fontFamily: 'Arial, sans-serif', // Font rapi
    color: 'black',
    marginLeft: '10px',
  },
  menuItem: {
    width: '100%',
    padding: '15px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '400',
    color: 'black',
    backgroundColor: '#00D16A',
    borderRadius: '10px',
    marginBottom: '10px',
    cursor: 'pointer',
  },
  menuItemActive: {
    backgroundColor: '#F4FFC3', // Warna highlight untuk halaman aktif
    color: '#000', // Warna teks untuk halaman aktif
  },
  logoutButton: {
    position: 'absolute', // Letakkan di bahagian bawah
    bottom: '50px', // Jarak dari bawah
    width: 'calc(100% - 40px)', // Sesuaikan lebar dengan padding sidebar
    padding: '15px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '400',
    color: 'black',
    backgroundColor: '#FF4D4D', // Warna merah untuk log out
    borderRadius: '10px',
    cursor: 'pointer',
  },
  mainContent: {
    flex: 1,
    marginLeft: '250px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  '@media (max-width: 768px)': {
    sidebar: {
      position: 'relative',
      width: '100%',
      height: 'auto',
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: '10px',
    },
    mainContent: {
      marginLeft: '0',
      padding: '10px',
    },
  },
};

export default AdminPage;