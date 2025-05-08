import React, { useState } from 'react';
import QRCodeScanner from 'react-qr-code-scanner';

const QRScanner: React.FC = () => {
    const [data, setData] = useState<string | null>(null);

    const handleScan = (data: string | null) => {
        if (data) {
            setData(data);
            // Here you can handle the scanned data, e.g., place an order
        }
    };

    const handleError = (err: any) => {
        console.error(err);
    };

    return (
        <div>
            <h2>Scan QR Code to Place Order</h2>
            <QRCodeScanner
                onScan={handleScan}
                onError={handleError}
            />
            {data && <p>Scanned Data: {data}</p>}
        </div>
    );
};

export default QRScanner;