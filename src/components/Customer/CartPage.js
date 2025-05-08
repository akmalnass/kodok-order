import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function CartPage({ cart, setCart }) {
  const { tableId } = useParams(); // Ambil tableId dari URL
  const navigate = useNavigate();
  const tableCart = cart[tableId] || []; // Ambil cart untuk tableId tertentu

  const handlePlaceOrder = () => {
    alert(`Order placed for Table ${tableId}`);
    setCart((prevCart) => ({
      ...prevCart,
      [tableId]: [], // Kosongkan cart untuk tableId ini
    }));
    navigate(`/customer-menu/table-${tableId}`); // Kembali ke menu utama
  };

  const totalAmount = tableCart.reduce((total, item) => total + item.price * item.quantity, 0);

  console.log('Cart for Table:', tableCart);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Your Cart</h1>
        <h2>Table Number: {tableId}</h2> {/* Tambahkan Table Number */}
      </header>

      <section style={styles.orderDetails}>
        <h2>Order Details ({tableCart.length} Item{tableCart.length > 1 ? 's' : ''})</h2>
        {tableCart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <ul>
            {tableCart.map((item) => (
              <li key={item.id}>
                <div>
                  <h3>{item.name}</h3> {/* Nama item */}
                  <p>Price: RM {item.price.toFixed(2)}</p> {/* Harga item */}
                  <p>Quantity: {item.quantity}</p> {/* Kuantiti item */}
                  <p>Total: RM {(item.price * item.quantity).toFixed(2)}</p> {/* Jumlah */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={styles.billDetails}>
        <h2>Bill Details</h2>
        <div style={styles.billRow}>
          <span>Item Total</span>
          <span>RM {totalAmount.toFixed(2)}</span>
        </div>
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
};

export default CartPage;