import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import app from '../../firebase';
import { useNavigate } from 'react-router-dom';

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirestore(app);

      try {
        const q = query(collection(db, 'orders'), where('status', 'in', ['Pending', 'Preparing']));
        const querySnapshot = await getDocs(q);

        const fetchedOrders = [];
        for (const orderDoc of querySnapshot.docs) {
          const orderData = orderDoc.data();
          const orderDetails = await Promise.all(
            orderData.orderDetails.map(async (detail) => {
              console.log('Fetching menu item with ID:', detail.menuItemId);
              const menuDoc = await getDoc(doc(db, 'menu', detail.menuItemId));
              if (menuDoc.exists()) {
                return {
                  ...menuDoc.data(),
                  quantity: detail.quantity,
                };
              } else {
                console.warn('Menu item not found for ID:', detail.menuItemId);
                return { name: 'Unknown Item', quantity: detail.quantity };
              }
            })
          );

          fetchedOrders.push({ id: orderDoc.id, ...orderData, orderDetails });
        }

        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again.');
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsReady = async (orderId) => {
    const db = getFirestore(app);

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Ready' });

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'Ready' } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all data from localStorage
    navigate('/staff-login'); // Redirect to Staff Login Page
  };

  return (
    <div style={styles.container}>
      <h2>Kitchen Dashboard</h2>
      <h3>Orders</h3>
      {error && <p style={styles.error}>{error}</p>}
      <ul style={styles.orderList}>
        {orders.length > 0 ? (
          orders.map((order) => (
            <li key={order.id} style={styles.orderItem}>
              <p><strong>Table Number:</strong> {order.tableNumber}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Order Details:</strong></p>
              <ul>
                {Array.isArray(order.orderDetails) && order.orderDetails.length > 0 ? (
                  order.orderDetails.map((item, index) => (
                    <li key={index}>
                      <p>{item.name} x {item.quantity}</p>
                    </li>
                  ))
                ) : (
                  <p>No order details available.</p>
                )}
              </ul>
              {order.customerNotes && (
                <p><strong>Customer Notes:</strong> {order.customerNotes}</p>
              )}
              {order.status === 'Pending' && (
                <button
                  style={styles.button}
                  onClick={() => handleMarkAsReady(order.id)}
                >
                  Mark as Ready
                </button>
              )}
            </li>
          ))
        ) : (
          <p style={styles.noOrder}>No Order Right Now.</p>
        )}
      </ul>
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
    maxWidth: '800px',
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
  button: {
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    marginTop: '10px',
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
  noOrder: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#666',
    marginTop: '20px',
  },
};

export default KitchenDashboard;