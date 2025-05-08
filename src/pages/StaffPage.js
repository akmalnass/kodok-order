import React from 'react';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import StaffDashboard from '../components/Staff/StaffDashboard';

function StaffPage() {
  return (
    <div>
      <Header title="Staff Dashboard" />
      <main style={{ padding: '20px' }}>
        <StaffDashboard />
      </main>
      <Footer />
    </div>
  );
}

export default StaffPage;