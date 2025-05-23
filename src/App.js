import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import StaffLogin from './pages/StaffLogin';
import AdminPage from './pages/AdminPage';
import SalesDashboard from './components/Admin/SalesDashboard';
import StaffManagement from './components/Admin/StaffManagement';
import OrderList from './components/Admin/OrderList';
import WaiterDashboard from './components/Staff/WaiterDashboard';
import KitchenDashboard from './components/Staff/KitchenDashboard';
import AddStaff from './components/Admin/AddStaff';
import EditStaff from './components/Admin/EditStaff';
import EditOrder from './components/Admin/EditOrder';
import CreateOrder from './components/Staff/CreateOrder';
import MenuList from './components/Admin/MenuList';
import CreateMenu from './components/Admin/CreateMenu';
import EditMenu from './components/Admin/EditMenu';
import CustomerMenu from './components/Customer/CustomerMenu';
import CartPage from './components/Customer/CartPage';

function App() {

  const [tables, setTables] = useState({
    1: [],
    2: [],
    3: [], 
    4: [], 
    5: [],
    6: [], 
    7: [], 
    8: [], 
    9: [],
    10: [], 
  });

  return (
    <HashRouter>
      <Routes>
        {/* Landing and Login Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/staff-login" element={<StaffLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminPage />}>
          <Route path="dashboard" element={<SalesDashboard />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="menu-list" element={<MenuList />} />
          <Route path="menu/create" element={<CreateMenu />} />
          <Route path="menu/edit/:id" element={<EditMenu />} />
          <Route path="order-list" element={<OrderList />} />
          <Route path="order/edit/:id" element={<EditOrder />} />
          <Route path="order/create" element={<CreateOrder role="admin" />} />
          <Route path="staff-management/add-staff" element={<AddStaff />} />
          <Route path="staff-management/edit-staff/:id" element={<EditStaff />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/waiter" element={<WaiterDashboard />} />
        <Route path="/waiter/order/create" element={<CreateOrder role="waiter" />} />
        <Route path="/kitchen" element={<KitchenDashboard />} />

        {/* Customer Menu Routes */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tableId) => (
          <Route
            key={tableId}
            path={`/customer-menu/table-${tableId}`}
            element={
              <CustomerMenu
                tableId={tableId}
                cart={tables} // Ambil cart untuk meja tertentu
                setCart={setTables}
              />
            }
          />
        ))}

        {/* Cart Page */}
        <Route
          path="/customer-menu/:tableId/cart"
          element={<CartPage cart={tables} setCart={setTables} />}
        />
      </Routes>
    </HashRouter>
  );
}

export default App;