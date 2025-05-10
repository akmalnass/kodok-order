import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Import Firestore instance

function AddStaff() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('waiter'); // Default role
  const [registrationDate, setRegistrationDate] = useState(''); // Default kosong

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Tambah data ke Firestore
      await addDoc(collection(db, 'users'), {
        name,
        username,
        password,
        role,
        registeredDate: registrationDate || new Date().toLocaleDateString(), // Gunakan tarikh semasa jika kosong
      });

      alert('Staff added successfully!');
      navigate('/admin/Staff-Management'); // Kembali ke halaman Staff Management
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/Staff-Management'); // Kembali ke halaman Staff Management
  };

  return (
    <div style={styles.container}>
      <h1>Add Staff</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
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
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.select}
          required
        >
          <option value="waiter">Waiter</option>
          <option value="kitchen">Kitchen</option>
        </select>
        <input
          type="date"
          value={registrationDate}
          onChange={(e) => setRegistrationDate(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Add Staff
        </button>
      </form>
      <button onClick={handleCancel} style={styles.cancelButton}>
        Cancel
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#D3FEEA',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: '50%', // Lebar box lebih kecil
    margin: '50px auto', // Posisikan di tengah secara horizontal dan tambahkan margin atas
    height: 'auto', // Tinggi menyesuaikan konten
    boxSizing: 'border-box', // Pastikan padding dimasukkan dalam lebar dan tinggi
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#FF4D4D',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
  },
};

export default AddStaff;