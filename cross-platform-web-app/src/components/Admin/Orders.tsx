import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus } from '../../utils/api';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const loadOrders = async () => {
            const fetchedOrders = await fetchOrders();
            setOrders(fetchedOrders);
        };
        loadOrders();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        await updateOrderStatus(orderId, newStatus);
        setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
        ));
    };

    return (
        <div className="orders-container">
            <h2>Manage Orders</h2>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.customerName}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => handleStatusChange(order.id, 'Completed')}>Complete</button>
                                <button onClick={() => handleStatusChange(order.id, 'Cancelled')}>Cancel</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Orders;