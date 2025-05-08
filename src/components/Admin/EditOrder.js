import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Gabungkan import useNavigate dan useParams
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import app from '../../firebase';

function EditOrder() {
  const { id } = useParams(); // Ambil ID pesanan dari URL
  const navigate = useNavigate();
  const [order, setOrder] = useState(null); // Simpan data pesanan
  const [isEditing, setIsEditing] = useState(false); // Kawal mod pengeditan

  useEffect(() => {
    const fetchOrder = async () => {
      const db = getFirestore(app);
      const orderDoc = await getDoc(doc(db, 'orders', id));
      if (orderDoc.exists()) {
        setOrder(orderDoc.data());
      } else {
        alert('Order not found!');
        navigate('/admin/order-list'); // Kembali ke halaman Order jika pesanan tidak wujud
      }
    };

    fetchOrder();
  }, [id, navigate]);

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

  const handleCompleteOrder = async () => {
    const db = getFirestore(app);
    try {
      await updateDoc(doc(db, 'orders', id), { status: 'Completed' });
      alert('Order marked as completed!');
      navigate('/admin/order-list'); // Kembali ke halaman Order selepas selesai
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Failed to complete order.');
    }
  };

  const handleEditOrder = () => {
    setIsEditing(true); // Aktifkan mod pengeditan
  };

  const handleSaveEdit = async () => {
    const db = getFirestore(app);
    try {
      await updateDoc(doc(db, 'orders', id), order); // Simpan perubahan ke Firestore
      alert('Order updated successfully!');
      setIsEditing(false); // Matikan mod pengeditan
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order.');
    }
  };

  const handleChangeItem = (index, field, value) => {
    const updatedItems = [...order.items];
    updatedItems[index][field] = value;
    setOrder({ ...order, items: updatedItems });
  };

  if (!order) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Edit Order</h3>
      <div style={styles.invoiceDetails}>
        <p><strong>Invoice:</strong> #{id}</p>
        <p>
          <strong>Table:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              value={order.tableNumber}
              onChange={(e) => setOrder({ ...order, tableNumber: e.target.value })}
              style={styles.input}
            />
          ) : (
            order.tableNumber || 'N/A'
          )}
        </p>
      </div>
      <div style={styles.orderDetails}>
        <h4>#{order.id} Order</h4>
        <div style={styles.items}>
          {order.items && order.items.length > 0 ? ( // Pastikan order.items wujud dan tidak kosong
            order.items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <p>{item.name}</p>
                {isEditing ? (
                  <>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleChangeItem(index, 'quantity', e.target.value)}
                      style={styles.input}
                    />
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleChangeItem(index, 'price', e.target.value)}
                      style={styles.input}
                    />
                  </>
                ) : (
                  <>
                    <p>x {item.quantity}</p>
                    <p>RM {item.price}</p>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No items found in this order.</p> // Paparkan mesej jika tiada item
          )}
        </div>
        <h4>
          Total: RM{' '}
          {order.items && order.items.length > 0
            ? order.items.reduce((total, item) => total + item.quantity * item.price, 0)
            : 0}
        </h4>
      </div>
      <div style={styles.actionButtons}>
        <button style={styles.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
        <button style={styles.removeButton} onClick={handleRemoveOrder}>
          Remove Order
        </button>
        {isEditing ? (
          <button style={styles.saveButton} onClick={handleSaveEdit}>
            Save Changes
          </button>
        ) : (
          <button style={styles.editButton} onClick={handleEditOrder}>
            Edit Order
          </button>
        )}
        <button style={styles.completeButton} onClick={handleCompleteOrder}>
          Complete Order
        </button>
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
  orderDetails: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  items: {
    marginBottom: '20px',
  },
  itemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  input: {
    width: '60px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #ddd',
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
  completeButton: {
    padding: '10px 20px',
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default EditOrder;