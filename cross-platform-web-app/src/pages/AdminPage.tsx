import React from 'react';
import Dashboard from '../components/Admin/Dashboard';
import Orders from '../components/Admin/Orders';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import './Admin.css';

const AdminPage: React.FC = () => {
    return (
        <div className="admin-page">
            <Header />
            <main>
                <Dashboard />
                <Orders />
            </main>
            <Footer />
        </div>
    );
};

export default AdminPage;