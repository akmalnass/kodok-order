import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../../firebase'; // Import Firebase config

function MenuList() {
  const [menus, setMenus] = useState([]); // State untuk menyimpan data menu
  const [selectedCategory, setSelectedCategory] = useState('All'); // Default: Semua kategori
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenus = async () => {
      const db = getFirestore(app);
      const menuCollection = collection(db, 'menu');
      const menuSnapshot = await getDocs(menuCollection);
      const menuList = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenus(menuList); // Simpan data menu ke dalam state
    };

    fetchMenus();
  }, []);

  const handleAddMenu = () => {
    navigate('/admin/menu/create'); // Navigasi ke halaman CreateMenu
  };

  const handleEditMenu = (id) => {
    navigate(`/admin/menu/edit/${id}`); // Navigasi ke halaman EditMenu
  };

  const filteredMenus = selectedCategory === 'All'
    ? menus
    : menus.filter((menu) => menu.category === selectedCategory);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Menu</h2>

      {/* Dropdown Sort by Category */}
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label htmlFor="categoryFilter" style={styles.filterLabel}>Sort by Category:</label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">All</option>
            <option value="Main Course">Main Course</option>
            <option value="Side Dish">Side Dish</option>
            <option value="Hot Drinks">Hot Drinks</option>
            <option value="Cold Drinks">Cold Drinks</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>
        <button style={styles.addButton} onClick={handleAddMenu}>
          Add New Menu
        </button>
      </div>

      {/* Grid Menu */}
      <div style={styles.menuGrid}>
        {filteredMenus.map((menu) => (
          <div key={menu.id} style={styles.menuCard}>
            <img
              src={menu.imageUrl || 'default-image-url.jpg'}
              alt={menu.name}
              style={styles.menuImage}
            />
            <h3 style={styles.menuName}>{menu.name}</h3>
            <p style={styles.menuDescription}>{menu.description}</p>
            <p style={styles.menuCategory}><strong>Category:</strong> {menu.category}</p>
            <p style={styles.menuPrice}>RM {parseFloat(menu.price).toFixed(2)}</p>
            <button
              style={styles.editButton}
              onClick={() => handleEditMenu(menu.id)}
            >
              Edit Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#D3FEEA',
    borderRadius: '8px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  filterContainer: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between', // Pisahkan dropdown dan tombol
    alignItems: 'center', // Selaraskan secara vertikal
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // Jarak antara label dan dropdown
  },
  filterLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  filterSelect: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  menuGrid: {
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
  menuCategory: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '10px',
  },
  menuPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default MenuList;