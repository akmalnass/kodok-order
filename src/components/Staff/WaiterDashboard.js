import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import app from '../../firebase';

function WaiterDashboard() {
  const [menu, setMenu] = useState([]);
  const [newOrder, setNewOrder] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [error, setError] = useState('');
  const [tables] = useState([1, 2, 3, 4, 5]); // Senarai meja
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default ke 'All'

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

    // Perbarui newOrder secara real-time
    setNewOrder((prevOrder) => {
      const existingItem = prevOrder.find((item) => item.id === menuItemId);
      if (existingItem) {
        // Jika item sudah ada di newOrder, perbarui jumlahnya
        const updatedOrder = prevOrder.map((item) =>
          item.id === menuItemId
            ? { ...item, quantity: Math.max(0, item.quantity + increment) }
            : item
        );
        // Hapus item jika jumlahnya menjadi 0
        return updatedOrder.filter((item) => item.quantity > 0);
      } else {
        // Jika item belum ada di newOrder, tambahkan item baru
        const menuItem = menu.find((item) => item.id === menuItemId);
        if (menuItem && increment > 0) {
          return [...prevOrder, { ...menuItem, quantity: increment }];
        }
      }
      return prevOrder;
    });
  };

  const handleAddToOrder = () => {
    const selectedItems = menu.filter((item) => item.quantity > 0);
    console.log('Selected Items:', selectedItems); // Debug item yang dipilih
    setNewOrder(selectedItems);
  };

  const handleSubmitOrder = async () => {
    const db = getFirestore(app);

    // Dapatkan item yang dipilih secara langsung dari menu
    const selectedItems = menu.filter((item) => item.quantity > 0);

    // Validasi input
    if (selectedItems.length === 0 || !tableNumber) {
      setError('Please select at least one item and enter a table number.');
      return;
    }

    // Format orderDetails dengan price dan totalPrice
    const orderDetails = selectedItems.map((item) => ({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity, // Kira total harga untuk item ini
    }));

    // Kira jumlah keseluruhan harga untuk pesanan
    const totalOrderPrice = orderDetails.reduce((sum, item) => sum + item.totalPrice, 0);

    try {
      // Simpan pesanan ke Firestore
      await addDoc(collection(db, 'orders'), {
        tableNumber,
        status: 'Pending',
        orderDetails,
        totalPrice: totalOrderPrice, // Simpan jumlah keseluruhan harga
        createdAt: new Date(),
      });

      // Reset state selepas berjaya
      alert('Order created successfully!');
      setNewOrder([]);
      setTableNumber('');
      setMenu((prevMenu) =>
        prevMenu.map((item) => ({ ...item, quantity: 0 }))
      );
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    }
  };


  // Filter menu berdasarkan kategori yang dipilih
  const filteredMenu = selectedCategory === 'All'
    ? menu // Tampilkan semua item jika kategori adalah 'All'
    : menu.filter((item) => item.category === selectedCategory); // Filter berdasarkan kategori

  console.log('Selected Category:', selectedCategory);
  console.log('Filtered Menu:', filteredMenu);
  console.log('Updated Order:', newOrder); // Menambah log untuk newOrder

  return (
    <div style={styles.container}>
      <h2>Waiter Dashboard</h2>

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
        <p style={styles.orText}>OR</p>
        <input
          type="number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          style={styles.input}
          placeholder="Enter table number"
        />
      </div>

      <div style={styles.menuSection}>
        <h3>Menu</h3>
        {/* Dropdown untuk memilih kategori */}
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
        <ul style={styles.menuList}>
          {filteredMenu.map((menuItem) => (
            <li key={menuItem.id} style={styles.menuItem}>
              <div style={styles.menuDetails}>
                <p>{menuItem.name}</p>
                <p>Category: {menuItem.category}</p>
                <p>RM {menuItem.price.toFixed(2)}</p>
              </div>
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
            </li>
          ))}
        </ul>
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
        <button style={styles.cancelButton} onClick={() => setNewOrder([])}>
          Cancel
        </button>
        <button
          style={styles.confirmButton}
          onClick={() => {
            handleAddToOrder(); // Tambahkan item ke dalam pesanan
            handleSubmitOrder(); // Hantar pesanan
          }}
        >
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
  orText: {
    textAlign: 'center',
    margin: '10px 0',
    fontWeight: 'bold',
  },
  input: {
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
  menuList: {
    listStyleType: 'none',
    padding: 0,
  },
  menuItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  menuDetails: {
    flex: 1,
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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

export default WaiterDashboard;