import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../../firebase';
import { format } from 'date-fns';

function OrderList({ navigateToDashboard }) {
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirestore(app);
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(), // Konversi Firestore Timestamp ke JavaScript Date
        }));

        // Susun berdasarkan Status dan Timestamp
        fetchedOrders.sort((a, b) => {
          const statusOrder = ['Pending', 'Preparing', 'Completed'];
          const statusComparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);

          if (statusComparison === 0) {
            return b.createdAt - a.createdAt; // Urutkan descending berdasarkan waktu
          }

          return statusComparison;
        });

        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again.');
      }
    };

    fetchOrders();
  }, []);

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const filteredOrders = selectedTable
    ? orders.filter(
        (order) =>
          order.tableNumber === selectedTable &&
          isToday(new Date(order.createdAt))
      )
    : orders.filter((order) => isToday(new Date(order.createdAt)));

  return (
    <div style={styles.container}>
      <h2>Order List</h2>
      <button style={styles.backButton} onClick={navigateToDashboard}>
        Back to Dashboard
      </button>
      <div style={styles.filterSection}>
        <label htmlFor="tableNumber" style={styles.label}>
          Filter by Table Number:
        </label>
        <select
          id="tableNumber"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          style={styles.select}
        >
          <option value="">All Tables</option>
          {[...new Set(orders.map((order) => order.tableNumber))].map((table) => (
            <option key={table} value={table}>
              Table {table}
            </option>
          ))}
        </select>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <ul style={styles.orderList}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <li key={order.id} style={styles.orderItem}>
              <p><strong>Table Number:</strong> {order.tableNumber}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Order Time:</strong> {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm:ss')}</p>
              <p><strong>Order Details:</strong></p>
              <ul>
                {order.orderDetails.map((item, index) => (
                  <li key={index}>
                    {item.name} x {item.quantity} = RM {(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <p>No orders found for today.</p>
        )}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#D3FEEA',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  filterSection: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  select: {
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    width: '100%',
  },
  orderList: {
    listStyleType: 'none',
    padding: 0,
  },
  orderItem: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default OrderList;