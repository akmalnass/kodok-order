import React, { useState } from 'react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import app from '../../firebase'; // Import Firebase config

function CreateOrder({ role }) {
  const [tableNumber, setTableNumber] = useState('');
  const [orderDetails, setOrderDetails] = useState([{ item: '', quantity: 1 }]);
  const [customerNotes, setCustomerNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleAddOrder = async (e) => {
    e.preventDefault();
    const db = getFirestore(app);

    try {
      const formattedOrderDetails = {};
      orderDetails.forEach((order) => {
        if (order.item && order.quantity > 0) {
          formattedOrderDetails[order.item] = order.quantity;
        }
      });

      const orderData = {
        tableNumber,
        orderDetails: formattedOrderDetails,
        customerNotes,
        status: role === 'admin' ? 'Approved' : 'Pending', // Admin boleh terus meluluskan
        assignedTo: role === 'admin' ? 'Admin' : localStorage.getItem('staffUsername'),
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'orders'), orderData);

      setTableNumber('');
      setOrderDetails([{ item: '', quantity: 1 }]);
      setCustomerNotes('');
      setSuccessMessage('Order created successfully!');
      setErrorMessage('');

      // Redirect ke /admin/order-list jika role adalah admin
      if (role === 'admin') {
        navigate('/admin/order-list');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setErrorMessage('Failed to create order. Please try again.');
      setSuccessMessage('');
    }
  };

  const handleAddItem = () => {
    setOrderDetails([...orderDetails, { item: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const updatedOrderDetails = [...orderDetails];
    updatedOrderDetails.splice(index, 1);
    setOrderDetails(updatedOrderDetails);
  };

  const handleItemChange = (index, field, value) => {
    const updatedOrderDetails = [...orderDetails];
    updatedOrderDetails[index][field] = value;
    setOrderDetails(updatedOrderDetails);
  };

  return (
    <div style={styles.container}>
      <h2>Create Order</h2>
      <form style={styles.form} onSubmit={handleAddOrder}>
        <input
          type="text"
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          style={styles.input}
          required
        />
        <div>
          <h4>Order Details</h4>
          {orderDetails.map((order, index) => (
            <div key={index} style={styles.orderItem}>
              <input
                type="text"
                placeholder="Item Name"
                value={order.item}
                onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={order.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                style={styles.input}
                required
              />
              <button
                type="button"
                style={styles.removeButton}
                onClick={() => handleRemoveItem(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" style={styles.addButton} onClick={handleAddItem}>
            Add Item
          </button>
        </div>
        <textarea
          placeholder="Customer Notes"
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
          style={styles.textarea}
        />
        <button type="submit" style={styles.button}>
          Create Order
        </button>
      </form>
      {successMessage && <p style={styles.success}>{successMessage}</p>}
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  textarea: {
    padding: '10px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '5px',
    height: '100px',
  },
  button: {
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  addButton: {
    padding: '5px 10px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    marginTop: '10px',
  },
  removeButton: {
    padding: '5px 10px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    marginLeft: '10px',
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  success: {
    color: 'green',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default CreateOrder;

