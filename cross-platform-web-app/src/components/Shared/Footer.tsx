import React from 'react';
import './Shared.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                <p>Follow us on social media!</p>
            </div>
        </footer>
    );
};

export default Footer;