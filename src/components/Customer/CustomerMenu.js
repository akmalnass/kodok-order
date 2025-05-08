import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import app from '../../firebase';

function CustomerMenu({ cart, setCart }) {
  const { tableId } = useParams(); // Ambil tableId dari URL
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      const db = getFirestore(app);
      const menuCollection = collection(db, 'menu');
      const menuSnapshot = await getDocs(menuCollection);
      const menuData = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenu(menuData);
      setFilteredMenu(menuData);
    };

    fetchMenu();
  }, []);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    if (selectedCategory === 'All') {
      setFilteredMenu(menu);
    } else {
      setFilteredMenu(menu.filter((item) => item.category === selectedCategory));
    }
  };

  const handleAddToCart = (menuItem) => {
    setCart((prevCart) => {
      const currentTableCart = prevCart[tableId] || [];
      const existingItem = currentTableCart.find((item) => item.id === menuItem.id);

      let updatedTableCart;
      if (existingItem) {
        updatedTableCart = currentTableCart.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedTableCart = [...currentTableCart, { ...menuItem, quantity: 1 }];
      }

      console.log('Cart after adding item:', cart);

      return {
        ...prevCart,
        [tableId]: updatedTableCart,
      };
    });

    console.log(`Item added to cart for table ${tableId}:`, menuItem);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Customer Menu - Table {tableId}</h1>
      </header>

      <div style={styles.categorySelector}>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={category}
          onChange={handleCategoryChange}
          style={styles.select}
        >
          <option value="All">All</option>
          <option value="Drinks">Drinks</option>
          <option value="Main Course">Main Course</option>
          <option value="Dessert">Dessert</option>
        </select>
      </div>

      <div style={styles.menuList}>
        {filteredMenu.map((item) => (
          <div key={item.id} style={styles.menuCard}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} style={styles.menuImage} />
            ) : (
              <img src="path/to/default-image.jpg" alt="Default" style={styles.menuImage} />
            )}
            <h3 style={styles.menuName}>{item.name}</h3>
            <p style={styles.menuDescription}>{item.description}</p>
            <p style={styles.menuPrice}>RM {parseFloat(item.price).toFixed(2)}</p>
            <button style={styles.addButton} onClick={() => handleAddToCart(item)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <button
        style={styles.viewCartButton}
        onClick={() => navigate(`/customer-menu/table-${tableId}/cart`)}
      >
        View Cart (
        {Array.isArray(cart[tableId])
          ? cart[tableId].reduce((total, item) => total + item.quantity, 0)
          : 0}
        )
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '20px',
  },
  categorySelector: {
    marginBottom: '20px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  menuList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    textAlign: 'center',
  },
  menuImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  menuName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  menuDescription: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '10px',
  },
  menuPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  viewCartButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CustomerMenu;