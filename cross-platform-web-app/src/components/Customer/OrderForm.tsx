import React, { useState } from 'react';

const OrderForm: React.FC = () => {
    const [customerName, setCustomerName] = useState('');
    const [orderDetails, setOrderDetails] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !orderDetails) {
            setError('Please fill in all fields.');
            return;
        }
        // Submit order logic here
        console.log('Order submitted:', { customerName, orderDetails });
        setCustomerName('');
        setOrderDetails('');
        setError('');
    };

    return (
        <div className="order-form">
            <h2>Place Your Order</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="customerName">Name:</label>
                    <input
                        type="text"
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="orderDetails">Order Details:</label>
                    <textarea
                        id="orderDetails"
                        value={orderDetails}
                        onChange={(e) => setOrderDetails(e.target.value)}
                    />
                </div>
                <button type="submit">Submit Order</button>
            </form>
        </div>
    );
};

export default OrderForm;