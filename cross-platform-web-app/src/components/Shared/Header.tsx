import React from 'react';
import { Link } from 'react-router-dom';
import './Shared.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <h1>Order Management System</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/customer">Customer</Link>
                    </li>
                    <li>
                        <Link to="/admin">Admin</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;