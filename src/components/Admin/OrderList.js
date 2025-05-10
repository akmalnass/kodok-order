import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getFirestore, collection, getDocs, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import app from '../../firebase';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // Untuk menyimpan pesanan yang dipilih
  const [filterStatus, setFilterStatus] = useState(''); // Untuk Paid/Not Paid Yet
  const [filterTable, setFilterTable] = useState(''); // Untuk Table Number

  const statsReducer = (state, action) => {
    switch (action.type) {
      case 'RESET_DAILY_STATS':
        return {
          ...state,
          totalOrdersToday: 0,
          ongoingOrdersToday: 0,
          completedOrdersToday: 0,
        };
      case 'UPDATE_STATS':
        return {
          ...state,
          ...action.payload, // Perbarui statistik dengan payload
        };
      default:
        return state;
    }
  };

  const [stats, dispatch] = useReducer(statsReducer, {
    totalOrdersToday: 0,
    ongoingOrdersToday: 0,
    completedOrdersToday: 0,
    totalMonthlyOrders: 0,
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // Untuk mengawal popup calendar

  const navigate = useNavigate(); // Inisialisasi useNavigate

  useEffect(() => {
    const fetchOrders = async () => {
      const db = getFirestore(app);

      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const fetchedOrders = [];
        let todayOrdersCount = 0;
        let ongoingOrdersCount = 0;
        let completedOrdersCount = 0;

        const today = new Date();

        querySnapshot.forEach((doc) => {
          const order = { id: doc.id, ...doc.data() };
          const createdAt = order.createdAt?.toDate();

          // Tapis pesanan untuk tarikh semasa
          if (
            createdAt &&
            createdAt.getDate() === today.getDate() &&
            createdAt.getMonth() === today.getMonth() &&
            createdAt.getFullYear() === today.getFullYear()
          ) {
            fetchedOrders.push(order);

            // Kira statistik
            todayOrdersCount++;
            if (order.status === 'Pending' || order.status === 'Preparing') {
              ongoingOrdersCount++;
            }
            if (order.status === 'Completed') {
              completedOrdersCount++;
            }
          }
        });

        // Ambil Monthly Order dari Firestore
        const salesDocRef = doc(db, 'sales', 'dashboard');
        const salesDoc = await getDoc(salesDocRef);
        const monthlyTotalOrders = salesDoc.exists() ? salesDoc.data().monthlyTotalOrders : 0;

        setOrders(fetchedOrders);
        dispatch({
          type: 'UPDATE_STATS',
          payload: {
            totalOrdersToday: todayOrdersCount,
            ongoingOrdersToday: ongoingOrdersCount,
            completedOrdersToday: completedOrdersCount,
            totalMonthlyOrders: monthlyTotalOrders, // Tetapkan nilai dari Firestore
          },
        });
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const resetStatsAtMidnight = () => {
      const now = new Date();
      const timeUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

      setTimeout(() => {
        dispatch({ type: 'RESET_DAILY_STATS' });
        resetStatsAtMidnight();
      }, timeUntilMidnight);
    };

    resetStatsAtMidnight();
  }, []);

  const handleSelectOrder = async (order) => {
    const db = getFirestore(app);

    try {
      const orderDetails = await Promise.all(
        order.orderDetails.map(async (detail) => {
          const menuDoc = await getDoc(doc(db, 'menu', detail.menuItemId));
          if (menuDoc.exists()) {
            return {
              ...menuDoc.data(), // Ambil data item dari koleksi `menu`
              quantity: detail.quantity, // Tambahkan kuantiti dari `orderDetails`
            };
          } else {
            return { name: 'Unknown Item', quantity: detail.quantity, category: 'Unknown' };
          }
        })
      );

      // Pisahkan Dish dan Drink berdasarkan kategori
      const dishes = orderDetails.filter((item) =>
        ['Main Course', 'Side Dish', 'Dessert'].includes(item.category)
      );
      const drinks = orderDetails.filter((item) =>
        ['Cold Drinks', 'Hot Drinks'].includes(item.category)
      );

      setSelectedOrder({ ...order, dishes, drinks }); // Tetapkan `dishes` dan `drinks`
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const handleEditOrder = () => {
    if (selectedOrder) {
      navigate(`/admin/order/edit/${selectedOrder.id}`); // Navigasi ke halaman EditOrder
    } else {
      alert('Please select an order to edit.');
    }
  };

  const handleAddOrder = () => {
    navigate('/admin/order/create'); // Navigasi ke halaman CreateOrder
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setIsCalendarOpen(false); // Tutup popup kalender

    const db = getFirestore(app);

    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const filteredOrders = [];

      querySnapshot.forEach((doc) => {
        const order = { id: doc.id, ...doc.data() };
        const createdAt = order.createdAt?.toDate();

        // Filter pesanan berdasarkan tanggal yang dipilih
        if (
          createdAt &&
          createdAt.getDate() === date.getDate() &&
          createdAt.getMonth() === date.getMonth() &&
          createdAt.getFullYear() === date.getFullYear()
        ) {
          filteredOrders.push(order);
        }
      });

      setOrders(filteredOrders); // Tetapkan pesanan yang difilter

      // Perbarui statistik berdasarkan pesanan yang difilter
      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          totalOrdersToday: filteredOrders.length,
          ongoingOrdersToday: filteredOrders.filter(
            (order) => order.status === 'Pending' || order.status === 'Preparing'
          ).length,
          completedOrdersToday: filteredOrders.filter(
            (order) => order.status === 'Completed'
          ).length,
          totalMonthlyOrders: stats.totalMonthlyOrders, // Monthly orders tetap tidak di-reset
        },
      });
    } catch (err) {
      console.error('Error fetching orders for selected date:', err);
    }
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) {
      alert('Please select an order to confirm payment.');
      return;
    }

    const db = getFirestore(app);

    try {
      // Update status pesanan ke 'Completed'
      await updateDoc(doc(db, 'orders', selectedOrder.id), {
        status: 'Completed',
      });

      // Update Sales Dashboard
      const salesDocRef = doc(db, 'sales', 'dashboard');
      const salesDoc = await getDoc(salesDocRef);

      const today = new Date();
      const currentDay = today.getDate().toString(); // Hari dalam bentuk string
      const currentMonth = today.toLocaleString('default', { month: 'long' }); // Nama bulan

      if (salesDoc.exists()) {
        const salesData = salesDoc.data();

        // Update dailySales
        let updatedDailySales = salesData.dailySales || [];
        const existingDay = updatedDailySales.find((day) => day.day === currentDay);

        if (existingDay) {
          // Jika hari sudah ada, tambahkan total penjualan
          updatedDailySales = updatedDailySales.map((day) =>
            day.day === currentDay
              ? { ...day, sales: day.sales + selectedOrder.totalPrice }
              : day
          );
        } else {
          // Jika hari baru, tambahkan ke array
          updatedDailySales.push({ day: currentDay, sales: selectedOrder.totalPrice });
        }

        // Update monthlySales
        let updatedMonthlySales = salesData.monthlySales || [];
        const existingMonth = updatedMonthlySales.find((month) => month.month === currentMonth);

        if (existingMonth) {
          // Jika bulan sudah ada, tambahkan total penjualan
          updatedMonthlySales = updatedMonthlySales.map((month) =>
            month.month === currentMonth
              ? { ...month, sales: month.sales + selectedOrder.totalPrice }
              : month
          );
        } else {
          // Jika bulan baru, tambahkan ke array
          updatedMonthlySales.push({ month: currentMonth, sales: selectedOrder.totalPrice });
        }

        // Update totalMonthlyOrders
        const updatedMonthlyTotalOrders = (salesData.monthlyTotalOrders || 0) + 1;

        // Perbarui dokumen di Firestore
        await updateDoc(salesDocRef, {
          dailySales: updatedDailySales,
          monthlySales: updatedMonthlySales,
          monthlyTotalOrders: updatedMonthlyTotalOrders, // Tambahkan pembaruan ini
        });

        console.log('Daily and Monthly Sales Updated:', updatedDailySales, updatedMonthlySales);
      } else {
        // Jika dokumen sales belum ada, buat dokumen baru
        await setDoc(salesDocRef, {
          dailySales: [{ day: currentDay, sales: selectedOrder.totalPrice }],
          monthlySales: [{ month: currentMonth, sales: selectedOrder.totalPrice }],
          monthlyTotalOrders: 1, // Inisialisasi dengan 1
        });

        console.log('Daily and Monthly Sales Initialized');
      }

      alert('Payment confirmed and order marked as completed!');
      setSelectedOrder(null); // Reset selected order
    } catch (err) {
      console.error('Error confirming payment:', err);
      alert('Failed to confirm payment. Please try again.');
    }
  };

  // Filter dan urutkan pesanan berdasarkan status pembayaran dan nombor meja
  const filteredOrders = orders
    .filter((order) => {
      const matchesStatus =
        filterStatus === ''
          ? true
          : filterStatus === 'Paid'
          ? order.status === 'Completed'
          : order.status !== 'Completed';

      const matchesTable = filterTable === '' ? true : order.tableNumber === filterTable;

      return matchesStatus && matchesTable;
    })
    .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()); // Susun berdasarkan waktu terbaru

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Order</h3>
        <div style={styles.actionButtons}>
          <button style={styles.calendarButton} onClick={toggleCalendar}>
            Select Date
          </button>
          <button style={styles.addButton} onClick={handleAddOrder}>
            Add Order
          </button>
        </div>
      </div>
      {isCalendarOpen && (
        <div style={styles.popupCalendar}>
          <Calendar onChange={handleDateChange} value={selectedDate} />
        </div>
      )}

      {/* Statistik Pesanan */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <p>Today Order</p>
          <h4>{stats.totalOrdersToday}</h4>
        </div>
        <div style={styles.statBox}>
          <p>On Going Order</p>
          <h4>{stats.ongoingOrdersToday}</h4>
        </div>
        <div style={styles.statBox}>
          <p>Complete Order</p>
          <h4>{stats.completedOrdersToday}</h4>
        </div>
        <div style={styles.statBox}>
          <p>Total Monthly Order</p>
          <h4>{stats.totalMonthlyOrders}</h4>
        </div>
      </div>

      {/* Filter Pesanan */}
      <div style={styles.filterContainer}>
        <div style={styles.filterItem}>
          <label htmlFor="filterStatus" style={styles.label}>Filter by Payment Status:</label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Not Paid Yet">Not Paid Yet</option>
          </select>
        </div>
        <div style={styles.filterItem}>
          <label htmlFor="filterTable" style={styles.label}>Filter by Table Number:</label>
          <select
            id="filterTable"
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            style={styles.select}
          >
            <option value="">All Tables</option>
            {[...new Set(orders.map((order) => order.tableNumber))].map((table) => (
              <option key={table} value={table}>
                Table {table}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Senarai Pesanan */}
      <div style={styles.orderListContainer}>
        <div style={styles.orderList}>
          {filteredOrders.map((order, index) => (
            <button
              key={order.id}
              style={styles.orderButton}
              onClick={() => handleSelectOrder(order)}
            >
              #{index + 1} - Table {order.tableNumber || 'N/A'}
            </button>
          ))}
        </div>

        {/* Butiran Pesanan */}
        <div style={styles.orderDetails}>
          {selectedOrder ? (
            <>
              <div style={styles.paymentStatus}>
                {selectedOrder.status === 'Completed' ? (
                  <div style={styles.paidStatus}>Paid</div>
                ) : (
                  <div style={styles.notPaidStatus}>Not Paid Yet</div>
                )}
              </div>
              <h4>Invoice: #{selectedOrder.id}</h4>

              {/* Tampilkan Dish jika ada */}
              {selectedOrder.dishes && selectedOrder.dishes.length > 0 && (
                <div>
                  <p><strong>Dish:</strong></p>
                  {selectedOrder.dishes.map((item, index) => (
                    <p key={index}>
                      {item.name} x {item.quantity} = RM {(item.price * item.quantity).toFixed(2)}
                    </p>
                  ))}
                </div>
              )}

              {/* Tampilkan Drink jika ada */}
              {selectedOrder.drinks && selectedOrder.drinks.length > 0 && (
                <div>
                  <p><strong>Drink:</strong></p>
                  {selectedOrder.drinks.map((item, index) => (
                    <p key={index}>
                      {item.name} x {item.quantity} = RM {(item.price * item.quantity).toFixed(2)}
                    </p>
                  ))}
                </div>
              )}

              {/* Pesan jika tidak ada Dish atau Drink */}
              {(!selectedOrder.dishes || selectedOrder.dishes.length === 0) &&
                (!selectedOrder.drinks || selectedOrder.drinks.length === 0) && (
                  <p>No items found for this order.</p>
              )}

              <h4>Total: RM {selectedOrder.totalPrice || '0.00'}</h4>
              <button style={styles.editButton} onClick={handleEditOrder}>
                Edit Order
              </button>
              <button style={styles.paidButton} onClick={handleConfirmPayment}>
                Pay
              </button>
            </>
          ) : (
            <p>Select an order to view details</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#D3FEEA',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // Jarak antara butang
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  statBox: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    textAlign: 'center',
    margin: '0 10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  calendarContainer: {
    marginTop: '20px',
    textAlign: 'center',
    position: 'relative',
  },
  calendarButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  popupCalendar: {
    position: 'absolute',
    top: '50px', // Jarak dari butang
    center: '10px', // Selaraskan ke kiri
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  orderListContainer: {
    display: 'flex',
    gap: '20px',
  },
  orderList: {
    flex:1,
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  orderButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    backgroundColor: '#00D16A',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  orderDetails: {
    flex: 2,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  editButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    float: 'right',
  },
  paidButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '20px',
    float: 'right',
  },
  paymentStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  paidStatus: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '5px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  notPaidStatus: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '5px 10px',
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between', // Atur jarak antar filter
    gap: '20px', // Jarak antar filter
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  filterItem: {
    flex: 1, // Setiap filter mengambil ruang yang sama
    display: 'flex',
    flexDirection: 'column', // Atur label dan select secara vertikal
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '100%',
  },
};

export default OrderList;

export const updateSales = async (orderTotal) => {
  const db = getFirestore(app); // Tambahkan deklarasi db
  const salesDocRef = doc(db, 'sales', 'dashboard');
  const today = new Date();
  const currentDay = today.getDate().toString(); // Hari dalam bentuk string
  const currentMonth = today.toLocaleString('default', { month: 'long' }); // Nama bulan

  try {
    const salesDoc = await getDoc(salesDocRef);

    if (salesDoc.exists()) {
      const salesData = salesDoc.data();

      // Update Daily Sales
      let updatedDailySales = salesData.dailySales || [];
      const existingDay = updatedDailySales.find((day) => day.day === currentDay);

      if (existingDay) {
        // Jika hari sudah ada, tambahkan total penjualan
        updatedDailySales = updatedDailySales.map((day) =>
          day.day === currentDay
            ? { ...day, sales: day.sales + orderTotal }
            : day
        );
      } else {
        // Jika hari baru, tambahkan ke array
        updatedDailySales.push({ day: currentDay, sales: orderTotal });
      }

      // Update Monthly Sales
      let updatedMonthlySales = salesData.monthlySales || [];
      const existingMonth = updatedMonthlySales.find((month) => month.month === currentMonth);

      if (existingMonth) {
        // Jika bulan sudah ada, tambahkan total penjualan
        updatedMonthlySales = updatedMonthlySales.map((month) =>
          month.month === currentMonth
            ? { ...month, sales: month.sales + orderTotal }
            : month
        );
      } else {
        // Jika bulan baru, tambahkan ke array
        updatedMonthlySales.push({ month: currentMonth, sales: orderTotal });
      }

      // Perbarui dokumen di Firestore
      await updateDoc(salesDocRef, {
        dailySales: updatedDailySales,
        monthlySales: updatedMonthlySales,
      });

      console.log('Daily and Monthly Sales Updated:', updatedDailySales, updatedMonthlySales);
    } else {
      // Jika dokumen tidak ada, buat dokumen baru
      await setDoc(salesDocRef, {
        dailySales: [{ day: currentDay, sales: orderTotal }],
        monthlySales: [{ month: currentMonth, sales: orderTotal }],
      });

      console.log('Daily and Monthly Sales Initialized');
    }
  } catch (err) {
    console.error('Error updating sales:', err);
  }
};

export const resetDailySales = async () => {
  const db = getFirestore(app); // Tambahkan deklarasi db
  const salesDocRef = doc(db, 'sales', 'dashboard');

  try {
    const salesDoc = await getDoc(salesDocRef);

    if (salesDoc.exists()) {
      await updateDoc(salesDocRef, {
        dailySales: [], // Reset dailySales ke array kosong
      });

      console.log('Daily Sales Reset');
    }
  } catch (err) {
    console.error('Error resetting daily sales:', err);
  }
};

// Panggil fungsi ini pada tengah malam
setInterval(() => {
  const now = new Date();
  const timeUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

  setTimeout(() => {
    resetDailySales();
  }, timeUntilMidnight);
}, 86400000); // Jalankan setiap 24 jam