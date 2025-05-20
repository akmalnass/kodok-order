import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Gabungkan import useNavigate dan useParams
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, addDoc, collection, getDocs, collection as fbCollection } from 'firebase/firestore';
import app from '../../firebase';

function EditOrder() {
  const { id } = useParams(); // Ambil ID pesanan dari URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null); // Simpan data pesanan
  const [menu, setMenu] = useState([]); // Untuk simpan semua menu
  const [isEditing, setIsEditing] = useState(false); // Kawal mod pengeditan

  useEffect(() => {
    const fetchOrderAndMenu = async () => {
      const db = getFirestore(app);
      // Fetch menu
      const menuSnapshot = await getDocs(fbCollection(db, 'menu'));
      const menuList = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenu(menuList);
      // Fetch order
      const orderDoc = await getDoc(doc(db, 'orders', id));
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        // Gabungkan menu dengan orderDetails (jika tiada dalam orderDetails, quantity=0)
        const mergedOrderDetails = menuList.map((menuItem) => {
          const found = (orderData.orderDetails || []).find((od) => od.menuItemId === menuItem.id);
          return found
            ? { ...found, name: menuItem.name, price: menuItem.price }
            : { menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 0 };
        });
        setOrder({ ...orderData, orderDetails: mergedOrderDetails });
      } else {
        alert('Order not found!');
        navigate('/admin/order-list');
      }
    };
    fetchOrderAndMenu();
  }, [id, navigate]);

  // Tambah fungsi tambah/tolak kuantiti item
  const handleQuantityChange = (index, increment) => {
    setOrder((prevOrder) => {
      const updatedOrderDetails = prevOrder.orderDetails.map((item, idx) =>
        idx === index
          ? { ...item, quantity: Math.max(0, item.quantity + increment) }
          : item
      );
      return { ...prevOrder, orderDetails: updatedOrderDetails };
    });
  };

  // Fungsi untuk update order ke Firestore dan trigger notifikasi
  const handleSaveEdit = async () => {
    const db = getFirestore(app);
    try {
      // Cari perubahan kuantiti (tambah/tolak sahaja)
      const originalOrderDoc = await getDoc(doc(db, 'orders', id));
      const originalOrder = originalOrderDoc.exists() ? originalOrderDoc.data() : null;
      const originalDetails = (originalOrder?.orderDetails || []);
      // Hanya simpan orderDetails yang quantity > 0
      const filteredOrderDetails = order.orderDetails.filter(item => item.quantity > 0);
      const changes = filteredOrderDetails.filter((item) => {
        const ori = originalDetails.find((od) => od.menuItemId === item.menuItemId);
        return (ori ? ori.quantity !== item.quantity : item.quantity > 0);
      });
      await updateDoc(doc(db, 'orders', id), {
        ...order,
        orderDetails: filteredOrderDetails,
      });
      // Hantar notifikasi ke Kitchen & Waiter hanya jika ada perubahan
      if (changes.length > 0) {
        const changeList = changes.map(item => `${item.name} x ${item.quantity}`).join(', ');
        const notifMsg = `Order for Table ${order.tableNumber} updated: ${changeList}`;
        await addDoc(collection(db, 'notifications'), {
          message: notifMsg,
          time: new Date(),
          role: 'Kitchen',
          isRead: false,
        });
        await addDoc(collection(db, 'notifications'), {
          message: notifMsg,
          time: new Date(),
          role: 'Waiter',
          isRead: false,
        });
      }
      alert('Order updated and sent to Kitchen & Waiter!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/order-list'); // Kembali ke halaman Order
  };

  const handleRemoveOrder = async () => {
    const db = getFirestore(app);
    try {
      await deleteDoc(doc(db, 'orders', id));
      alert('Order removed successfully!');
      navigate('/admin/order-list'); // Kembali ke halaman Order selepas menghapus
    } catch (error) {
      console.error('Error removing order:', error);
      alert('Failed to remove order.');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Edit Order</h3>
      <div style={styles.invoiceDetails}>
        <p><strong>Invoice:</strong> #{id}</p>
        <p><strong>Table:</strong> {order?.tableNumber || 'N/A'}</p>
      </div>
      <div style={styles.orderDetailsBox}>
        <h4># Order</h4>
        <div style={styles.itemsBox}>
          {order && order.orderDetails && order.orderDetails.length > 0 ? (
            order.orderDetails.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span>{item.name}</span>
                <div style={styles.qtyBox}>
                  <button style={styles.qtyBtn} onClick={() => handleQuantityChange(index, -1)} disabled={item.quantity <= 0}>-</button>
                  <span style={styles.qtyNum}>{item.quantity}</span>
                  <button style={styles.qtyBtn} onClick={() => handleQuantityChange(index, 1)}>+</button>
                </div>
                <span>RM {item.price}</span>
              </div>
            ))
          ) : (
            <p>No items found in this order.</p>
          )}
        </div>
        <h4>Total: RM {order && order.orderDetails ? order.orderDetails.filter(i=>i.quantity>0).reduce((total, item) => total + item.quantity * item.price, 0) : 0}</h4>
      </div>
      <div style={styles.actionButtons}>
        <button style={styles.cancelButton} onClick={handleCancel}>Cancel</button>
        <button style={styles.removeButton} onClick={handleRemoveOrder}>Remove Order</button>
        {isEditing ? (
          <button style={styles.saveButton} onClick={handleSaveEdit}>Save Changes</button>
        ) : (
          <button style={styles.editButton} onClick={() => setIsEditing(true)}>Edit Order</button>
        )}
      </div>
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
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  invoiceDetails: {
    marginBottom: '20px',
  },
  orderDetailsBox: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  itemsBox: {
    marginBottom: '20px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    gap: '10px',
    minHeight: '48px',
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    minWidth: '120px',
    width: '120px', // Tambah width tetap supaya semua qtyBox selari
  },
  qtyBtn: {
    padding: '4px 10px',
    fontSize: '18px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '32px',
    minHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: {
    minWidth: '32px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#FF4D4D',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  removeButton: {
    padding: '10px 20px',
    backgroundColor: '#FF4D4D',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default EditOrder;