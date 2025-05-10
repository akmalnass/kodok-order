import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Import Firestore instance

function EditStaff() {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState({
    name: '',
    username: '',
    password: '',
    role: '',
    registeredDate: '',
  });
  const [showPassword, setShowPassword] = useState(false); // State untuk Hide/Unhide password

  // Ambil data staff berdasarkan ID
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffDoc = await getDoc(doc(db, 'users', id));
        if (staffDoc.exists()) {
          setStaffData(staffDoc.data());
        } else {
          alert('Staff not found!');
          navigate('/admin/Staff-Management');
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        alert('Failed to fetch staff data.');
      }
    };

    fetchStaff();
  }, [id, navigate]);

  // Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle submit untuk mengemas kini data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, 'users', id), staffData);
      alert('Staff updated successfully!');
      navigate('/admin/Staff-Management'); // Kembali ke halaman Staff Management
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update staff. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/admin/Staff-Management'); // Kembali ke halaman Staff Management
  };

  return (
    <div style={styles.container}>
      <h1>Edit Staff</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={staffData.name}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={staffData.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'} // Tukar jenis input berdasarkan state
            name="password"
            placeholder="Password"
            value={staffData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)} // Tukar state showPassword
            style={styles.toggleButton}
          >
            {showPassword ? 'Hide' : 'Show'} {/* Tukar teks butang */}
          </button>
        </div>
        <select
          name="role"
          value={staffData.role}
          onChange={handleChange}
          style={styles.select}
          required
        >
          <option value="waiter">Waiter</option>
          <option value="kitchen">Kitchen</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="date"
          name="registeredDate"
          value={staffData.registeredDate}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Save Changes
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
    width: '50%', // Atur lebar box menjadi lebih kecil
    margin: '50px auto', // Posisikan box di tengah secara horizontal dan tambahkan margin atas
    height: 'auto', // Sesuaikan tinggi dengan konten
    overflow: 'auto', // Tambahkan scroll jika konten terlalu panjang
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
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  toggleButton: {
    padding: '10px',
    fontSize: '14px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
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

export default EditStaff;