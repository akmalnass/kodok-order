import React, { useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from '../firebase'; // Import Firebase config
import { useNavigate } from 'react-router-dom';
import CoffeeImage from '../assets/Coffee.jpg';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    const db = getFirestore(app);

    try {
      // Query Firestore for the admin user
      const q = query(
        collection(db, 'users'),
        where('username', '==', username),
        where('password', '==', password),
        where('role', '==', 'admin')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Login successful
        alert('Login successful!');
        navigate('/admin/dashboard'); // Redirect to Admin Dashboard
      } else {
        // Login failed
        setError('Invalid username or password');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/'); // Redirect to Landing Page
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1 style={styles.title}>Admin Login</h1>
        <form style={styles.form} onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Login</button>
        </form>
        <button onClick={handleBack} style={styles.backButton}>Back</button>
        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: `url(${CoffeeImage})`, // Tambahkan gambar background
    backgroundSize: 'cover', // Pastikan gambar menutupi seluruh area
    backgroundPosition: 'center', // Posisikan gambar di tengah
    backgroundRepeat: 'no-repeat', // Jangan ulangi gambar
  },
  box: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Latar belakang semi-transparan
    padding: '30px',
    borderRadius: '10px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Tambahkan bayangan
    width: '300px',
  },
  title: {
    fontSize: '2rem',
    color: '#fff', // Sesuaikan warna teks
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '10px',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '5px',
    outline: 'none',
  },
  button: {
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  backButton: {
    marginTop: '10px',
    padding: '10px',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

export default AdminLogin;