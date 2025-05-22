import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc, onSnapshot, addDoc } from 'firebase/firestore';
import app from '../../firebase';
import { useNavigate } from 'react-router-dom';
import Header from '../Shared/Header';
import notificationSoundManager from '../Shared/NotificationSoundManager';

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [prevNotificationCount, setPrevNotificationCount] = useState(0);
  const [showEnableSound, setShowEnableSound] = useState(false);
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
          console.log('Order Data:', orderData); // Debug log
          console.log('Order Details:', orderData.orderDetails);

          // Validasi orderDetails
          if (!Array.isArray(orderData.orderDetails)) {
            console.error(`Invalid orderDetails for order ID: ${orderDoc.id}`, orderData.orderDetails);
            continue; // Lewati dokumen ini jika orderDetails tidak valid
          }

          // Proses orderDetails
          const orderDetails = await Promise.all(
            orderData.orderDetails.map(async (detail) => {
              if (!detail.menuItemId) {
                console.warn('Invalid menuItemId in orderDetails:', detail);
                return { name: 'Unknown Item', quantity: detail.quantity };
              }

              console.log('Fetching menu item with ID:', detail.menuItemId);
              const menuDoc = await getDoc(doc(db, 'menu', detail.menuItemId));
              if (!menuDoc.exists()) {
                console.warn('Menu item not found for ID:', detail.menuItemId);
              }

              return {
                ...menuDoc.data(),
                quantity: detail.quantity,
              };
            })
          );

          fetchedOrders.push({
            id: orderDoc.id,
            tableNumber: orderData.tableNumber,
            status: orderData.status,
            createdAt: orderData.createdAt,
            orderDetails,
          });
        }

        console.log('Fetched Orders:', fetchedOrders);
        console.log('Real-time Orders:', fetchedOrders);

        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again.');
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const db = getFirestore(app);
    const unsubscribe = onSnapshot(
      query(collection(db, 'orders'), where('status', 'in', ['Pending', 'Preparing'])),
      async (snapshot) => {
        const fetchedOrders = [];
        for (const orderDoc of snapshot.docs) {
          const orderData = orderDoc.data();

          // Validasi orderDetails
          if (!Array.isArray(orderData.orderDetails)) {
            console.error(`Invalid orderDetails for order ID: ${orderDoc.id}`, orderData.orderDetails);
            continue;
          }

          // Proses orderDetails
          const orderDetails = await Promise.all(
            orderData.orderDetails.map(async (detail) => {
              if (!detail.menuItemId) {
                console.warn('Invalid menuItemId in orderDetails:', detail);
                return { name: 'Unknown Item', quantity: detail.quantity };
              }

              const menuDoc = await getDoc(doc(db, 'menu', detail.menuItemId));
              if (!menuDoc.exists()) {
                console.warn('Menu item not found for ID:', detail.menuItemId);
                return { name: 'Unknown Item', quantity: detail.quantity };
              }

              return {
                ...menuDoc.data(),
                quantity: detail.quantity,
              };
            })
          );

          fetchedOrders.push({
            id: orderDoc.id,
            tableNumber: orderData.tableNumber,
            status: orderData.status,
            createdAt: orderData.createdAt?.toDate() || new Date(), // Konversi Firestore Timestamp ke Date
            orderDetails,
          });
        }

        // Urutkan berdasarkan waktu (terawal di atas)
        fetchedOrders.sort((a, b) => a.createdAt - b.createdAt);

        setOrders(fetchedOrders);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Show enable sound prompt if not unlocked
    setShowEnableSound(!notificationSoundManager.isUnlocked);
  }, []);

  const handleEnableSound = () => {
    notificationSoundManager.unlock();
    setShowEnableSound(false);
  };

  useEffect(() => {
    const db = getFirestore(app);
    const unsubscribe = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const kitchenNotifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            time: data.time.toDate().toLocaleString(),
          };
        }).filter((notif) => notif.role === 'Kitchen' || notif.role === 'Customer'); // Kitchen & Customer

        if (kitchenNotifications.length > prevNotificationCount && notificationSoundManager.isUnlocked) {
          notificationSoundManager.play();
        }
        setPrevNotificationCount(kitchenNotifications.length);
        setNotifications(kitchenNotifications);
      }
    );
    return () => unsubscribe();
  }, [prevNotificationCount]);

  const handleMarkAsReady = async (orderId, tableNumber) => {
    const db = getFirestore(app);

    try {
      // Update status pesanan menjadi "Ready"
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'Ready' });

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'Ready' } : order
        )
      );

      // Kirim notifikasi ke Admin
      await addDoc(collection(db, 'notifications'), {
        message: `Order for Table ${tableNumber} is Ready to Serve`,
        time: new Date(),
        role: 'Admin', // Notifikasi untuk Admin
        isRead: false,
      });

      // Kirim notifikasi ke Waiter
      await addDoc(collection(db, 'notifications'), {
        message: `Order for Table ${tableNumber} is Ready to Serve`,
        time: new Date(),
        role: 'Waiter', // Notifikasi untuk Waiter
        isRead: false,
      });

      console.log(`Order for Table ${tableNumber} marked as Ready and notifications sent.`);
    } catch (err) {
      console.error('Error updating order status or sending notifications:', err);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all data from localStorage
    navigate('/staff-login'); // Redirect to Staff Login Page
  };

  const markAsRead = async (id) => {
    const db = getFirestore(app);
    console.log('Marking notification as read with ID:', id); // Debug log
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { isRead: true });
      console.log(`Notification ${id} marked as read`);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <div style={styles.container}>
      {showEnableSound && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: 'white', padding: 32, borderRadius: 12, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)'}}>
            <h2>Enable Notification Sound</h2>
            <p>Tap the button below to enable real-time notification sound for the kitchen.</p>
            <button style={{padding: '12px 24px', fontSize: 18, background: '#2ecc40', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer'}} onClick={handleEnableSound}>
              Enable Sound
            </button>
          </div>
        </div>
      )}
      <Header
        title="Kitchen Dashboard"
        notifications={notifications}
        markAsRead={markAsRead} // Teruskan fungsi markAsRead ke Header
      />
      <h3>Orders</h3>
      {error && <p style={styles.error}>{error}</p>}
      <ul style={styles.orderList}>
        {orders.length > 0 ? (
          orders.map((order) => (
            <li key={order.id} style={styles.orderItem}>
              <p><strong>Table Number:</strong> {order.tableNumber}</p>
              <p><strong>Order Time:</strong> {order.createdAt.toLocaleString()}</p>
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
              {(order.status === 'Pending' || order.status === 'Preparing') && (
                <button
                  style={styles.button}
                  onClick={() => handleMarkAsReady(order.id, order.tableNumber)}
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
      {/* Simulasi Event */}
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