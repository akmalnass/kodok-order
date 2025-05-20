import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from '../../firebase'; // Import Firebase config

function CreateMenu() {
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState(''); // Untuk menyimpan URL gambar
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore(app);

    try {
      // Simpan data menu ke Firestore
      console.log('Saving menu to Firestore...');
      await addDoc(collection(db, 'menu'), {
        name: menuName,
        description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrlInput, // Simpan URL gambar
        createdAt: new Date(),
      });

      alert('Menu created successfully!');
      navigate('/admin/menu-list');
    } catch (error) {
      console.error('Error creating menu:', error); // Log ralat
      alert('Failed to create menu. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create New Menu</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Menu Name"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          style={styles.input}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.textarea}
          required
        />
        <input
          type="number"
          placeholder="Price (RM)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={styles.input}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          <option value="Main Course">Main Course</option>
          <option value="Side Dish">Side Dish</option>
          <option value="Hot Drinks">Hot Drinks</option>
          <option value="Cold Drinks">Cold Drinks</option>
          <option value="Dessert">Dessert</option>
        </select>
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
          style={styles.input}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={styles.button}>
            Create Menu
          </button>
          <button
            type="button"
            style={styles.cancelButton}
            onClick={() => navigate('/admin/menu-list')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
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
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    height: '100px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#dc3545', // Warna merah untuk butang cancel
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CreateMenu;