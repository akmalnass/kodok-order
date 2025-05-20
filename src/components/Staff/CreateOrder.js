import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import app from '../../firebase';

function CreateOrder({ role }) {
  const [menu, setMenu] = useState([]);
  const [newOrder, setNewOrder] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');
  const [tables] = useState([1, 2, 3, 4, 5]); // Senarai meja
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default ke 'All'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      const db = getFirestore(app);

      try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        const fetchedMenu = [];
        querySnapshot.forEach((doc) => {
          fetchedMenu.push({ id: doc.id, ...doc.data(), quantity: 0 }); // Pastikan quantity diinisialisasi
        });

        setMenu(fetchedMenu);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError('Failed to fetch menu. Please try again.');
      }
    };

    fetchMenu();
  }, []);

  const handleQuantityChange = (menuItemId, increment) => {
    setMenu((prevMenu) =>
      prevMenu.map((item) =>
        item.id === menuItemId
          ? { ...item, quantity: Math.max(0, item.quantity + increment) }
          : item
      )
    );

    setNewOrder((prevOrder) => {
      const existingItem = prevOrder.find((item) => item.id === menuItemId);
      if (existingItem) {
        const updatedOrder = prevOrder.map((item) =>
          item.id === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + increment) }
            : item
        );
        return updatedOrder.filter((item) => item.quantity > 0);
      } else {
        const menuItem = menu.find((item) => item.id === menuItemId);
        if (menuItem && increment > 0) {
          return [...prevOrder, { ...menuItem, quantity: increment }];
        }
      }
      return prevOrder;
    });
  };

  const handleSubmitOrder = async () => {
    const db = getFirestore(app);
    const selectedItems = menu.filter((item) => item.quantity > 0);

    if (selectedItems.length === 0 || !tableNumber) {
      setError('Please select at least one item and enter a table number.');
      return;
    }

    const orderDetails = selectedItems.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity,
    }));

    const totalOrderPrice = orderDetails.reduce((sum, item) => sum + item.totalPrice, 0);

    try {
      await addDoc(collection(db, 'orders'), {
        tableNumber,
        status: role === 'admin' ? 'Approved' : 'Pending',
        orderDetails,
        totalPrice: totalOrderPrice,
        createdAt: Timestamp.now(),
      });

      alert('Order created successfully!');
      setNewOrder([]);
      setTableNumber('');
      setMenu((prevMenu) =>
        prevMenu.map((item) => ({ ...item, quantity: 0 }))
      );

      if (role === 'admin') {
        navigate('/admin/order-list');
      } else {
        navigate('/staff/order-list');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    }
  };

  const handleCancelOrder = () => {
    // Reset semua state terkait pesanan
    setNewOrder([]);
    setTableNumber('');
    setMenu((prevMenu) =>
      prevMenu.map((item) => ({ ...item, quantity: 0 }))
    );
    setError(''); // Hapus pesan error jika ada

    // Arahkan pengguna ke halaman /admin/order-list
    navigate('/admin/order-list');
  };

  const filteredMenu = selectedCategory === 'All'
    ? menu
    : menu.filter((item) => item.category === selectedCategory);

  return (
    <div style={styles.container}>
      <h2>Create Order</h2>

      <div style={styles.form}>
        <label htmlFor="tableNumber" style={styles.label}>
          Table Number:
        </label>
        <select
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          style={styles.select}
        >
          <option value="" disabled>
            Select Table
          </option>
          {tables.map((table) => (
            <option key={table} value={table}>
              Table {table}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.menuSection}>
        <h3>Menu</h3>
        <div style={styles.categorySection}>
          <label htmlFor="category" style={styles.label}>
            Category:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="All">All</option>
            {Array.from(new Set(menu.map((item) => item.category))).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.menuGrid}>
          {filteredMenu.map((menuItem) => (
            <div key={menuItem.id} style={styles.menuCard}>
              <h4>{menuItem.name}</h4>
              <p>Category: {menuItem.category}</p>
              <p>RM {menuItem.price.toFixed(2)}</p>
              <div style={styles.quantityControls}>
                <button
                  style={styles.quantityButton}
                  onClick={() => handleQuantityChange(menuItem.id, -1)}
                >
                  -
                </button>
                <span>{menuItem.quantity}</span>
                <button
                  style={styles.quantityButton}
                  onClick={() => handleQuantityChange(menuItem.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.orderSection}>
        <h3>Item List</h3>
        <ul style={styles.orderList}>
          {newOrder.map((item) => (
            <li key={item.id} style={styles.orderItem}>
              {item.name} x {item.quantity} = RM{' '}
              {(item.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <h4>
          Total: RM{' '}
          {newOrder
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)}
        </h4>
      </div>

      <div style={styles.actions}>
        <button style={styles.cancelButton} onClick={handleCancelOrder}>
          Cancel
        </button>
        <button style={styles.confirmButton} onClick={handleSubmitOrder}>
          Confirm
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}
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
  form: {
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
  menuSection: {
    marginBottom: '20px',
  },
  categorySection: {
    marginBottom: '20px',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  menuCard: {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  quantityControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  quantityButton: {
    padding: '5px 10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  orderSection: {
    marginBottom: '20px',
  },
  orderList: {
    listStyleType: 'none',
    padding: 0,
  },
  orderItem: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  confirmButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default CreateOrder;

