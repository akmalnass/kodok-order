import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; // Tambahkan Outlet
import { collection, onSnapshot, } from 'firebase/firestore';
import { db } from '../firebase'; // Sesuaikan path dengan lokasi baru
import Header from '../components/Shared/Header';
import logo from '../assets/KodokKodok.png';


function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State untuk Sidebar

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={toggleSidebar}
        />
      )}

      {/* Tombol Sandwich */}
      <button style={styles.sandwichButton} onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', // Sembunyikan sidebar jika tertutup
        }}
      >
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

      {/* Konten Utama */}
      <div
        style={{
          ...styles.mainContent,
          marginLeft: isSidebarOpen && window.innerWidth > 768 ? '250px' : '0', // Hanya tambahkan margin di layar besar
        }}
      >
        <Header title="Admin" notifications={notifications} />
        <div style={styles.content}>
          <Outlet />
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
    transition: 'transform 0.3s ease-in-out', // Animasi buka/tutup
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '70px',
    marginTop: '60px', // Tambahkan jarak dari atas
  },
  logo: {
    width: '70px',
    height: '70px',
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
    position: 'absolute', // Tetap di bagian bawah sidebar
    bottom: '100px', // Kurangi jarak dari bawah (sebelumnya 50px)
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
  sandwichButton: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 1100, // Pastikan tombol berada di atas sidebar
    backgroundColor: '#0B8B4B',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    fontSize: '18px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  mainContent: {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  '@media (max-width: 768px)': {
    sidebar: {
      position: 'absolute', // Ubah posisi sidebar menjadi absolute
      width: '250px',
      height: '100vh',
      zIndex: 1000,
    },
    mainContent: {
      marginLeft: '0', // Hilangkan margin kiri di layar kecil
      padding: '10px',
    },
  },
};

export default AdminPage;