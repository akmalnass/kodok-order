import React from 'react';
import QRScanner from '../components/Customer/QRScanner';
import OrderForm from '../components/Customer/OrderForm';
import Header from '../components/Shared/Header';
import Footer from '../components/Shared/Footer';
import './Customer.css';

const CustomerPage: React.FC = () => {
    return (
        <div className="customer-page">
            <Header />
            <h1>Customer Order Page</h1>
            <QRScanner />
            <OrderForm />
            <Footer />
        </div>
    );
};

export default CustomerPage;