import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from '../../firebase';

function CartPage({ cart, setCart }) {
  const { tableId } = useParams(); // Ambil tableId dari URL
  const navigate = useNavigate();
  const tableNumber = tableId.split('-')[1];
  const tableCart = cart[tableNumber] || []; // Gunakan tableNumber, bukan tableId

  console.log('Full cart state:', cart);
  console.log('Table number:', tableNumber);
  console.log('Table cart contents:', tableCart);

  const handlePlaceOrder = async () => {
    const db = getFirestore(app);

    if (tableCart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      // Format data pesanan
      const formattedOrderDetails = tableCart.map((item) => ({
        menuItemId: item.id, // ID menu
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity, // Total harga untuk item ini
      }));

      // Simpan pesanan ke Firestore (tanpa orderType)
      await addDoc(collection(db, 'orders'), {
        tableNumber,
        orderDetails: formattedOrderDetails, // Gunakan data yang diformat
        status: 'Preparing',
        createdAt: new Date(),
        totalPrice: formattedOrderDetails.reduce((total, item) => total + item.totalPrice, 0),
      });

      // Tambahkan notifikasi untuk Kitchen
      await addDoc(collection(db, 'notifications'), {
        message: `New order submitted by Customer for Table ${tableNumber}`,
        time: new Date(),
        role: 'Kitchen',
        isRead: false,
      }).then(() => {
        console.log('Notification for Kitchen created successfully.');
      }).catch((err) => {
        console.error('Error creating notification for Kitchen:', err);
      });

      // Reset cart untuk tabel ini
      setCart((prevCart) => ({
        ...prevCart,
        [tableNumber]: [],
      }));

      alert('Order placed successfully!');
      navigate(`/customer-menu/${tableId}`);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleIncreaseQuantity = (itemId) => {
    setCart((prevCart) => {
      const currentTableCart = prevCart[tableNumber] || [];
      const updatedTableCart = currentTableCart.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );

      return {
        ...prevCart,
        [tableNumber]: updatedTableCart,
      };
    });
  };

  const handleDecreaseQuantity = (itemId) => {
    setCart((prevCart) => {
      const currentTableCart = prevCart[tableNumber] || [];
      const updatedTableCart = currentTableCart
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
        )
        .filter((item) => item.quantity > 0); // Hapus item jika quantity = 0

      return {
        ...prevCart,
        [tableNumber]: updatedTableCart,
      };
    });
  };

  const handleRemoveItem = (itemId) => {
    setCart((prevCart) => {
      const currentTableCart = prevCart[tableNumber] || [];
      const updatedTableCart = currentTableCart.filter((item) => item.id !== itemId);

      return {
        ...prevCart,
        [tableNumber]: updatedTableCart,
      };
    });
  };

  const totalAmount = tableCart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(`/customer-menu/${tableId}`)}>
          Back
        </button>
        <h1>Your Cart</h1>
        <h2>Table Number: {tableNumber}</h2>
      </header>

      <section style={styles.orderDetails}>
        <h2>Order Details ({tableCart.length} Item{tableCart.length !== 1 ? 's' : ''})</h2>
        {tableCart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul style={styles.itemList}>
            {tableCart.map((item) => (
              <li key={item.id} style={styles.item}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={styles.itemPrice}>RM {item.price.toFixed(2)}</span>
                </div>
                <div style={styles.quantityControls}>
                  <button
                    style={styles.quantityButton}
                    onClick={() => handleDecreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <button
                    style={styles.quantityButton}
                    onClick={() => handleIncreaseQuantity(item.id)}
                  >
                    +
                  </button>
                  <button
                    style={styles.removeButton}
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
                <div style={styles.itemTotal}>
                  RM {(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.billDetails}>
        <h2>Bill Details</h2>
        <div style={styles.billRow}>
          <span>Total</span>
          <span>RM {totalAmount.toFixed(2)}</span>
        </div>
      </section>

      <footer style={styles.footer}>
        <button style={styles.placeOrderButton} onClick={handlePlaceOrder}>
          Place Order
        </button>
      </footer>
    </div>
  );
}

const styles = {
  itemList: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    padding: '15px 0',
    borderBottom: '1px solid #eee',
  },
  itemInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  itemName: {
    fontWeight: 'bold',
  },
  itemPrice: {
    color: '#666',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  quantityButton: {
    padding: '5px 10px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  quantity: {
    minWidth: '20px',
    textAlign: 'center',
  },
  removeButton: {
    padding: '5px 10px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  itemTotal: {
    textAlign: 'right',
    fontWeight: 'bold',
  },
  container: {
    padding: '20px',
    backgroundColor: '#d8fcec',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    paddingBottom: '10px',
  },
  orderDetails: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  billDetails: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
  },
  placeOrderButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '15px 30px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  backButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    marginRight: '10px',
  },
};

export default CartPage;