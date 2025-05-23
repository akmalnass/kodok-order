import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import app from '../../firebase';

function CustomerMenu({ tableId, cart, setCart }) {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [category, setCategory] = useState('');
  const [showPopup, setShowPopup] = useState(false);
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
      console.log('Menu Data:', menuData); // Debugging data menu
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
    let showAlert = true;
    setCart((prevTables) => {
      const currentTableCart = prevTables[tableId] || [];
      const existingItem = currentTableCart.find((item) => item.id === menuItem.id);

      let updatedTableCart;
      if (existingItem) {
        updatedTableCart = currentTableCart.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedTableCart = [...currentTableCart, { ...menuItem, quantity: 1 }];
      }
      // Alert hanya sekali selepas setCart selesai
      if (showAlert) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 2000); // Popup hilang selepas 2 saat
        showAlert = false;
      }
      return {
        ...prevTables,
        [tableId]: updatedTableCart,
      };
    });
  };

  return (
    <div style={styles.container}>
      {/* Popup Box jika ada */}
      {showPopup && (
        <div style={styles.popupBox}>Item added to cart</div>
      )}
      <header style={styles.header}>
        <h1>Welcome to KodokKodok</h1>
        <h2>Customer Menu - Table {tableId}</h2>
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
          <option value="Hot Drinks">Hot Drinks</option>
          <option value="Cold Drinks">Cold Drinks</option>
          <option value="Main Course">Main Course</option>
          <option value="Dessert">Dessert</option>
          <option value="Side Dish">Side Dish</option>
        </select>
      </div>
      {/* Group menu by category and render */}
      <div style={styles.menuList}>
        {(category === '' || category === 'All'
          ? Array.from(new Set(menu.map((item) => item.category)))
          : [category]
        ).map((cat) => (
          <div key={cat} style={styles.categorySection}>
            <h3 style={styles.categoryTitle}>{cat}</h3>
            <div style={styles.menuGrid}>
              {filteredMenu.filter((item) => item.category === cat).map((item) => (
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
    backgroundColor: '#d3feea',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '20px',
  },
  categorySelector: {
    marginBottom: '20px',
    display: 'flex', // Tambahkan untuk membuat label dan dropdown sejajar
    alignItems: 'center',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginLeft: '10px', // Tambahkan margin kiri untuk menggeser dropdown
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
  categorySection: {
    marginBottom: '32px',
    background: '#f4fff9',
    borderRadius: '10px',
    padding: '10px 0 20px 0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  categoryTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '16px 0 16px 24px',
    color: '#000000',
    textAlign: 'left',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    padding: '0 16px',
  },
  popupBox: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
  },
};

export default CustomerMenu;