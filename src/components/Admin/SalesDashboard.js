import React, { useState, useEffect } from 'react';
import { getFirestore, doc, onSnapshot, updateDoc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import app from '../../firebase';

const db = getFirestore(app);

export const updateSales = async (orderTotal) => {
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

      console.log('Before Updating Daily Sales:', updatedDailySales);
      console.log('Before Updating Monthly Sales:', updatedMonthlySales);

      // Perbarui dokumen di Firestore
      await updateDoc(salesDocRef, {
        dailySales: updatedDailySales,
        monthlySales: updatedMonthlySales,
      });

      console.log('Daily and Monthly Sales Updated:', updatedDailySales, updatedMonthlySales);
      console.log('Updated Daily Sales:', updatedDailySales);
      console.log('Updated Monthly Sales:', updatedMonthlySales);
    } else {
      // Jika dokumen tidak ada, buat dokumen baru
      await setDoc(salesDocRef, {
        dailySales: [{ day: currentDay, sales: orderTotal }],
        monthlySales: [{ month: currentMonth, sales: orderTotal }],
      });

      // Tambahkan dokumen baru untuk dailySales
      await setDoc(doc(db, 'sales', 'dailySales'), {
        day: currentDay,
        sales: 0,
      });

      console.log('Daily and Monthly Sales Initialized');
    }
  } catch (err) {
    console.error('Error updating sales:', err);
  }
};

export const resetSales = async () => {
  const salesDocRef = doc(db, 'sales', 'dashboard');

  try {
    const salesDoc = await getDoc(salesDocRef);

    if (salesDoc.exists()) {
      console.log('Resetting Daily Sales:', salesDoc.data()); // Debug log

      // Reset Daily Sales
      await updateDoc(salesDocRef, {
        dailySales: [], // Reset ke array kosong
      });

      console.log('Daily Sales Reset Successfully'); // Debug log
    } else {
      console.error('Sales document does not exist!');
    }
  } catch (err) {
    console.error('Error resetting sales:', err);
  }
};

const scheduleResetSales = () => {
  const now = new Date();
  const timeUntilMidnight =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;

  console.log(`Time until midnight: ${timeUntilMidnight}ms`); // Debug log

  setTimeout(() => {
    resetSales(); // Panggil fungsi resetSales untuk mengatur ulang dailySales
    scheduleResetSales(); // Jadwalkan ulang untuk hari berikutnya
  }, timeUntilMidnight);
};

// Panggil fungsi untuk menjadwalkan reset
scheduleResetSales();

function SalesDashboard() {
  const [salesData, setSalesData] = useState({
    dailySales: [], // Inisialisasi sebagai array kosong
    monthlySales: [], // Inisialisasi sebagai array kosong
  });
  const [dailySalesBox, setDailySalesBox] = useState(0); // State untuk Daily Sales Box
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    const db = getFirestore(app);
    const salesDocRef = doc(db, 'sales', 'dashboard');

    const unsubscribe = onSnapshot(salesDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const today = new Date();
        const currentDay = today.getDate().toString(); // Hari ini dalam bentuk string

        console.log('Fetched Sales Data:', data); // Debug log

        // Hitung total penjualan untuk hari ini
        const todaySales = Array.isArray(data.dailySales)
          ? data.dailySales
              .filter((day) => day.day === currentDay) // Hanya ambil data untuk hari ini
              .reduce((total, day) => total + (day.sales || 0), 0)
          : 0;

        setDailySalesBox(todaySales); // Perbarui Daily Sales Box

        // Tetapkan data untuk grafik
        const fillMissingDays = (dailySales) => {
          const today = new Date();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const filledSales = [];

          for (let i = 1; i <= daysInMonth; i++) {
            const existingDay = dailySales.find((day) => Number(day.day) === i);
            if (existingDay) {
              filledSales.push(existingDay);
            } else {
              filledSales.push({ day: i.toString(), sales: 0 }); // Tambahkan hari tanpa penjualan
            }
          }

          return filledSales;
        };

        setSalesData({
          dailySales: Array.isArray(data.dailySales)
            ? fillMissingDays(
                data.dailySales.map((day) => ({
                  day: day.day || '',
                  sales: typeof day.sales === 'number' ? day.sales : 0,
                }))
              ).sort((a, b) => Number(a.day) - Number(b.day)) // Urutkan berdasarkan hari
            : [],
          monthlySales: Array.isArray(data.monthlySales)
            ? data.monthlySales.map((month) => ({
                month: month.month || '',
                sales: typeof month.sales === 'number' ? month.sales : 0,
              }))
            : [],
        });
      } else {
        console.error('Sales document does not exist!');
        setDailySalesBox(0); // Reset Daily Sales Box jika dokumen tidak ada
        setSalesData({
          dailySales: [],
          monthlySales: [],
        });
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      const db = getFirestore(app);
      const ordersSnapshot = await getDocs(collection(db, 'orders'));

      // Hitung jumlah pesanan berdasarkan menuItemId
      const menuOrderCount = {};
      ordersSnapshot.docs.forEach((doc) => {
        const orderDetails = doc.data().orderDetails || [];
        orderDetails.forEach((item) => {
          if (menuOrderCount[item.menuItemId]) {
            menuOrderCount[item.menuItemId] += item.quantity;
          } else {
            menuOrderCount[item.menuItemId] = item.quantity;
          }
        });
      });

      // Gabungkan data menu dengan jumlah pesanan
      const menuSnapshot = await getDocs(collection(db, 'menu'));
      const menuItems = menuSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        orders: menuOrderCount[doc.id] || 0, // Ambil jumlah pesanan dari menuOrderCount
      }));

      setMenuData(menuItems);
    };

    fetchOrderData();
  }, []);

  console.log('Fetched Sales Data:', salesData);
  console.log('Menu Data for Pie Chart:', menuData);
  console.log('Daily Sales Data:', salesData.dailySales); // <-- Added line

  // Warna untuk grafik
  const COLORS = ['#43a047', '#6d4c41', '#1e88e5', '#f4511e', '#ffb300', '#8e24aa'];

  return (
    <div style={styles.container}>
      <h2>Sales Dashboard</h2>

      {/* Statistik Utama */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <p>Daily Sales</p>
          <h4>RM {Number(dailySalesBox).toFixed(2)}</h4>
        </div>
        <div style={styles.statBox}>
          <p>Monthly Sales</p>
          <h4>
            RM{' '}
            {Array.isArray(salesData.monthlySales)
              ? Number(
                  salesData.monthlySales.reduce((total, month) => total + (month.sales || 0), 0)
                ).toFixed(2)
              : '0.00'}
          </h4>
        </div>
      </div>

      {/* Grafik */}
      <div style={styles.graphContainer}>
        {/* Bar Graph (Monthly Sales) */}
        <div style={styles.graphBox}>
          <h3>Monthly Sales</h3>
          <BarChart width={300} height={300} data={salesData.monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#1e88e5" />
          </BarChart>
        </div>

        {/* Line Graph (Daily Sales) */}
        <div style={styles.graphBox}>
          <h3>Daily Sales</h3>
          <LineChart width={300} height={300} data={salesData.dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#43a047" />
          </LineChart>
        </div>

        {/* Pie Chart (Top Ordered Menu) */}
        <div style={styles.graphBox}>
          <h3>Top Ordered Menu</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={menuData}
              dataKey="orders"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {menuData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    backgroundColor: '#D3FEEA',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
    height: '100vh', // Pastikan kontainer memenuhi tinggi layar
    overflowY: 'auto', // Tambahkan scroll jika konten terlalu panjang
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
  graphContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)', // Tiga kolom di layar besar
    gap: '20px', // Jarak antar grafik
    marginBottom: '20px',
  },
  graphBox: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '90%', // Grafik memenuhi lebar knotainer

  },
  '@media (max-width: 768px)': {
    container: {
      padding: '10px',
      width: '100%',
    },
    sidebar: {
      position: 'relative', // Ubah sidebar menjadi relatif
      width: '100%', // Sidebar memenuhi lebar layar
      height: 'auto', // Tinggi menyesuaikan konten
      flexDirection: 'row', // Atur menu secara horizontal
      justifyContent: 'space-around', // Sebar menu secara merata
      padding: '10px',
    },
    mainContent: {
      marginLeft: '0', // Hilangkan margin kiri
      padding: '10px',
    },
    statsContainer: {
      flexDirection: 'column', // Atur statistik secara vertikal
      gap: '10px',
    },
    statBox: {
      margin: '0', // Hilangkan margin horizontal
      width: '100%', // Setiap box memenuhi lebar layar
    },
    chartContainer: {
      flexDirection: 'column', // Atur grafik secara vertikal
      gap: '20px',
    },
    graphContainer: {
      gridTemplateColumns: '1fr', // Satu kolom di layar kecil
      gap: '20px', // Jarak antar grafik
    },
  },
};

export default SalesDashboard;