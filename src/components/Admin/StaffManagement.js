import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, } from 'firebase/firestore';
import { db } from '../../firebase'; // Import Firestore

function StaffManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffList, setStaffList] = useState([]);

  // Ambil data staff dari Firestore
  useEffect(() => {
    const fetchStaff = async () => {
      const staffCollection = collection(db, 'users');
      const staffSnapshot = await getDocs(staffCollection);
      const staffData = staffSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          position: doc.data().role || 'N/A',
          registeredDate: doc.data().registeredDate || 'N/A',
        }))
        .filter((users) => users.role !== 'admin');
      console.log('Staff Data:', staffData);
      setStaffList(staffData);
    };
    fetchStaff();

    fetchStaff();
  }, []);

  // Padam staff
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this staff?');
    if (confirmDelete) {
      await deleteDoc(doc(db, 'users', id)); // Tukar 'staff' ke 'users'
      setStaffList(staffList.filter((staff) => staff.id !== id)); // Kemas kini senarai staff
      alert('Staff deleted successfully!');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Staff Management</h1>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Nama</th> {/* Tukar Username kepada Nama */}
            <th style={styles.tableHeader}>Position</th>
            <th style={styles.tableHeader}>Registered Date</th>
            <th style={styles.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <tr key={staff.id}>
              <td style={styles.tableCell}>{staff.name || 'N/A'}</td> {/* Paparkan Nama */}
              <td style={styles.tableCell}>{staff.position}</td> {/* Paparkan Position */}
              <td style={styles.tableCell}>{staff.registeredDate}</td> {/* Paparkan Registered Date */}
              <td style={styles.tableCell}>
                <button style={styles.deleteButton} onClick={() => handleDelete(staff.id)}>
                  Delete
                </button>
                <button
                  onClick={() => navigate(`/admin/Staff-Management/Edit-Staff/${staff.id}`)}
                  style={styles.editButton}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        style={{
          ...styles.addButton,
          ...(location.pathname === '/admin/Staff-Management/add-staff' ? styles.menuItemActive : {}),
        }}
        onClick={() => navigate('/admin/Staff-Management/add-staff')}
      >
        Add Staff
      </button>
      <Outlet />
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#D3FEEA',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    height: '100%', // Pastikan ia memenuhi ruang
    overflow: 'auto', // Tambahkan scroll jika kandungan melebihi ruang
    boxSizing: 'border-box', // Pastikan padding dimasukkan dalam ketinggian
    maxWidth: '900px', // Tetapkan lebar maksimum
    margin: '0 auto', // Pusatkan dalam halaman
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#00D16A',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '5px',
  },
  editButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  addButton: {
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'block',
    marginLeft: 'auto',
  },
};

export default StaffManagement;