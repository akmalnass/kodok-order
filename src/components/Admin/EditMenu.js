import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // Import Firebase Storage
import app from '../../firebase'; // Import Firebase config

const handleImageUpload = async (file) => {
  try {
    console.log('New image file:', file); // Log fail gambar
    const storageRef = ref(storage, `menu-images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`); // Log progres muat naik
        },
        (error) => {
          console.error('Upload error:', error); // Log ralat muat naik
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Image uploaded successfully:', downloadURL); // Log URL gambar
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error); // Log ralat URL
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error); // Log ralat umum
    throw error;
  }
};

function EditMenu() {
  const { id } = useParams(); // Ambil ID menu dari URL
  const navigate = useNavigate();
  const [menuName, setMenuName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState(''); // Untuk menyimpan URL gambar
  const [isSubmitting, setIsSubmitting] = useState(false); // Untuk mengelakkan klik berganda

  useEffect(() => {
    const fetchMenu = async () => {
      const db = getFirestore(app);
      const menuDoc = await getDoc(doc(db, 'menu', id));
      if (menuDoc.exists()) {
        const menuData = menuDoc.data();
        setMenuName(menuData.name);
        setPrice(menuData.price);
        setCategory(menuData.category);
        setDescription(menuData.description || '');
        setImageUrlInput(menuData.imageUrl || ''); // Set URL gambar sedia ada
      } else {
        alert('Menu not found!');
        navigate('/admin/menu-list'); // Kembali ke MenuList jika menu tidak wujud
      }
    };

    fetchMenu();
  }, [id, navigate]);

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Elakkan klik berganda
    setIsSubmitting(true);

    const db = getFirestore(app);

    try {
      let imageUrl = imageUrlInput; // Gunakan URL gambar jika diisi

      // Jika URL gambar tidak diisi, muat naik gambar baru jika ada
      if (!imageUrl && newImageFile) {
        console.log('Uploading new image...');
        imageUrl = await handleImageUpload(newImageFile); // Panggil fungsi muat naik
        console.log('Image URL:', imageUrl); // Log URL gambar
      }

      // Kemas kini menu dalam Firestore
      console.log('Updating Firestore document...');
      await updateDoc(doc(db, 'menu', id), {
        name: menuName,
        price: parseFloat(price),
        category: category,
        description: description,
        ...(imageUrl && { imageUrl }), // Hanya kemas kini URL gambar jika ada gambar baru atau URL
      });

      console.log('Firestore document updated successfully.');
      setSuccessMessage('Menu updated successfully!');
      setErrorMessage('');
      setTimeout(() => navigate('/admin/menu-list'), 2000); // Kembali ke MenuList selepas 2 saat
    } catch (error) {
      console.error('Error updating menu:', error); // Log ralat kemas kini
      setErrorMessage('Failed to update menu. Please try again.');
      setSuccessMessage('');
    } finally {
      setIsSubmitting(false); // Benarkan klik semula selepas selesai
    }
  };

  const handleDeleteMenu = async () => {
    if (!window.confirm('Are you sure you want to delete this menu?')) return;

    const db = getFirestore(app);

    try {
      await deleteDoc(doc(db, 'menu', id)); // Hapus dokumen menu berdasarkan ID
      alert('Menu deleted successfully!');
      navigate('/admin/menu-list'); // Kembali ke senarai menu selepas berjaya
    } catch (error) {
      console.error('Error deleting menu:', error); // Log ralat
      alert('Failed to delete menu. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Edit Menu</h2>
      <form style={styles.form} onSubmit={handleUpdateMenu}>
        <input
          type="text"
          placeholder="Menu Name"
          value={menuName}
          onChange={(e) => setMenuName(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            setNewImageFile(file);
            console.log('Selected image file:', file); // Log fail gambar
          }}
        />
        <div style={styles.buttonGroup}>
          <button
            type="button"
            style={styles.cancelButton}
            onClick={() => navigate('/admin/menu-list')}
          >
            Cancel
          </button>
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Menu'}
          </button>
          <button
            type="button"
            style={styles.deleteButton}
            onClick={handleDeleteMenu}
          >
            Delete Menu
          </button>
        </div>
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
    maxWidth: '400px',
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
  select: {
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
    resize: 'none',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
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
  cancelButton: {
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  deleteButton: {
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#dc3545', // Warna merah untuk butang delete
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
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

export default EditMenu;