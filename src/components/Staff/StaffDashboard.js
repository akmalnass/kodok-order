import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import app from '../../firebase';

function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all data from localStorage
    navigate('/staff-login'); // Redirect to Staff Login Page
  };

  useEffect(() => {
    const db = getFirestore(app);

    const fetchOrdersRealtime = () => {
      const staffUsername = localStorage.getItem('staffUsername'); // Get username from local storage
      if (!staffUsername) {
        setError('No staff username found. Please login again.');
        return;
      }

      const q = query(collection(db, 'orders'), where('assignedTo', '==', staffUsername));

      // Gunakan onSnapshot untuk mendengarkan perubahan secara real-time
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedOrders = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() });
        });

        setOrders(fetchedOrders); // Perbarui state orders
      }, (err) => {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again.');
      });

      // Cleanup listener saat komponen di-unmount
      return unsubscribe;
    };

    const unsubscribe = fetchOrdersRealtime();

    return () => unsubscribe(); // Cleanup listener saat komponen di-unmount
  }, []);

  return (
    <div style={styles.container}>
      <h2>Staff Dashboard</h2>
      <p>Here are the orders assigned to you:</p>
      {error && <p style={styles.error}>{error}</p>}
      <ul style={styles.orderList}>
        {orders.map((order) => (
          <li key={order.id} style={styles.orderItem}>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Table Number:</strong> {order.tableNumber}</p>
            <p><strong>Status:</strong> {order.status}</p>
          </li>
        ))}
      </ul>
      {orders.length === 0 && !error && <p>No orders assigned to you yet.</p>}

      {/* Log Out Button */}
      <button style={styles.logoutButton} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  orderList: {
    listStyleType: 'none',
    padding: 0,
  },
  orderItem: {
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#fff',
  },
  logoutButton: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default StaffDashboard;