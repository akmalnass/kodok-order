import React, { useState, useEffect, useRef } from 'react';
import notificationIcon from '../../assets/notification-bell.png';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Pastikan path ke firebase.js benar

function Header({ title, notifications }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false); // Tutup dropdown jika klik di luar
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { isRead: true });
      console.log(`Notification ${id} marked as read`);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const unreadNotifications = notifications.filter((notif) => !notif.isRead);

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.notificationContainer}>
        <img
          src={notificationIcon}
          alt="Notifications"
          style={styles.notificationIcon}
          onClick={toggleDropdown}
        />
        {unreadNotifications.length > 0 && (
          <span style={styles.notificationBadge}>{unreadNotifications.length}</span>
        )}
        {isDropdownOpen && (
          <div ref={dropdownRef} style={styles.dropdown}>
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notif, index) => (
                <div key={index} style={styles.notificationItem}>
                  <p style={styles.notificationMessage}>{notif.message}</p>
                  <small style={styles.notificationTime}>{notif.time}</small>
                  <button
                    style={styles.markAsReadButton}
                    onClick={() => markAsRead(notif.id)}
                  >
                    Mark as Read
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.noNotifications}>No Notifications</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#D3FEEA',
    color: '#000',
  },
  title: {
    marginLeft: '50px',
  },
  notificationContainer: {
    position: 'relative',
    cursor: 'pointer',
  },
  notificationIcon: {
    width: '24px',
    height: '24px',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
  },
  dropdown: {
    position: 'absolute',
    top: '30px',
    right: '0',
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    borderRadius: '5px',
    width: '250px',
    zIndex: 1000,
    padding: '10px',
  },
  notificationItem: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  notificationMessage: {
    margin: 0,
    fontSize: '14px',
  },
  notificationTime: {
    fontSize: '12px',
    color: '#888',
  },
  noNotifications: {
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
  },
  markAsReadButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '0',
    marginTop: '5px',
    display: 'block',
  },
};

export default Header;