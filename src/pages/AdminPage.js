import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; // Tambahkan Outlet
import { collection, onSnapshot, } from 'firebase/firestore';
import { db } from '../firebase'; // Sesuaikan path dengan lokasi baru
import Header from '../components/Shared/Header';
import logo from '../assets/KodokKodok.png';
import adminNotificationSound from '../assets/admin-notifications.mp3'; // Import bunyi notifikasi

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State untuk Sidebar
  const [adminAudio] = useState(typeof Audio !== 'undefined' ? new Audio(adminNotificationSound) : null);
  const [lastNotifCount, setLastNotifCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false); // Tambah button untuk enable sound
  const [showSoundPopup, setShowSoundPopup] = useState(false); // State untuk pop up

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const enableSound = () => {
    setSoundEnabled(true);
    setShowSoundPopup(false);
    if (adminAudio) {
      adminAudio.play();
    }
  };

  // Pop up enable sound jika belum aktif
  useEffect(() => {
    if (!soundEnabled && location.pathname === '/admin/dashboard') {
      setShowSoundPopup(true);
    } else {
      setShowSoundPopup(false);
    }
  }, [soundEnabled, location.pathname]);

  // Mendengarkan notifikasi secara real-time dari Firestore
  useEffect(() => {
    if (!soundEnabled) return; // Jangan play sound jika belum enable
    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const adminNotifications = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              time: data.time.toDate().toLocaleString(),
            };
          })
          .filter((notif) => notif.role === 'Admin');
        setNotifications(adminNotifications);
        // Play sound if ada notifikasi baru
        if (adminAudio && adminNotifications.length > lastNotifCount) {
          adminAudio.currentTime = 0;
          adminAudio.play();
        }
        setLastNotifCount(adminNotifications.length);
      }
    );
    return () => unsubscribe();
  }, [adminAudio, lastNotifCount, soundEnabled]);

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
        {/* Pop up enable sound */}
        {showSoundPopup && (
          <div style={styles.popupOverlay}>
            <div style={styles.popupBox}>
              <h3>Enable Notification Sound</h3>
              <p>Click the button below to enable notification sound for Admin.</p>
              <button onClick={enableSound} style={styles.enableSoundButton}>
                Enable Notification Sound
              </button>
            </div>
          </div>
        )}
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
  enableSoundButton: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.4)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBox: {
    background: '#fff',
    padding: '32px 40px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    minWidth: '320px',
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