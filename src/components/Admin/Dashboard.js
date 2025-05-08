import React from 'react';
import ManageStaff from './ManageStaff';

function Dashboard() {
  return (
    <div>
      <h2>Welcome, Admin!</h2>
      <p>Here you can manage orders, staff, and more.</p>
      <ul>
        <li><a href="#orders">Manage Orders</a></li>
        <li><a href="#staff">Manage Staff</a></li>
      </ul>
      <div id="staff">
        <ManageStaff />
      </div>
    </div>
  );
}

export default Dashboard;