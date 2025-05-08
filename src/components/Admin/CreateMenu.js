import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Compressor from 'compressorjs';
import app from '../../firebase'; // Import Firebase config

function CreateMenu() {
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState(''); // Untuk menyimpan URL gambar
  const navigate = useNavigate();

  const handleImageUpload = (file) => {
    new Compressor(file, {
      quality: 0.6, // Kurangkan kualiti gambar untuk saiz lebih kecil
      success(result) {
        setImageFile(result); // Simpan gambar yang telah dimampatkan
      },
      error(err) {
        console.error('Compression error:', err);
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore(app);
    const storage = getStorage(app);

    try {
      setUploading(true);

      let imageUrl = imageUrlInput; // Gunakan URL gambar jika diisi

      // Jika URL gambar tidak diisi, muat naik gambar baru jika ada
      if (!imageUrl && imageFile) {
        console.log('Uploading image...');
        const storageRef = ref(storage, `menu-images/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log(`Upload is ${progress}% done`);
              setProgress(progress); // Kemaskini progres
            },
            (error) => {
              console.error('Upload error:', error); // Log ralat muat naik
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Image uploaded successfully:', url); // Log URL gambar
                imageUrl = url; // Simpan URL gambar
                resolve();
              } catch (error) {
                console.error('Error getting download URL:', error); // Log ralat URL
                reject(error);
              }
            }
          );
        });
      } else if (!imageUrl) {
        console.log('No image file or URL provided.');
      } else if (imageUrlInput && imageFile) {
        alert('Please provide either an image URL or upload a file, not both.');
        setUploading(false);
        return;
      }

      // Simpan data menu ke Firestore
      console.log('Saving menu to Firestore...');
      await addDoc(collection(db, 'menu'), {
        name: menuName,
        description,
        price: parseFloat(price),
        category,
        imageUrl, // Simpan URL gambar
        createdAt: new Date(),
      });

      alert('Menu created successfully!');
      navigate('/admin/menu-list');
    } catch (error) {
      console.error('Error creating menu:', error); // Log ralat
      alert('Failed to create menu. Please try again.');
    } finally {
      setUploading(false);
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={styles.button} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Create Menu'}
          </button>
          <button
            type="button"
            style={styles.cancelButton}
            onClick={() => navigate('/admin/menu-list')}
          >
            Cancel
          </button>
        </div>
        {uploading && <p>Uploading: {progress.toFixed(2)}%</p>}
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