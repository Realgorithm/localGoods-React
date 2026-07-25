import { useEffect, useState, useCallback } from 'react';

const useBarcodeScanner = (onScan) => {
    const [barcode, setBarcode] = useState('');

    const handleKeyDown = useCallback((e) => {
        // Ignore modifier keys and inputs in form fields
        if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key) || e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA') {
            return;
        }

        if (e.key === 'Enter') {
            if (barcode.length > 3) { // Barcodes are usually longer than 3 chars
                onScan(barcode);
            }
            setBarcode(''); // Reset after Enter
        } else {
            // Append character to barcode string
            setBarcode(prev => prev + e.key);
        }
    }, [barcode, onScan]);

    useEffect(() => {
        // A timer to clear the barcode string if input stops, to prevent accidental manual typing from being treated as a scan.
        const timer = setTimeout(() => {
            if (barcode.length > 0) {
                setBarcode('');
            }
        }, 100); // If no key is pressed for 100ms, reset.

        return () => clearTimeout(timer);
    }, [barcode]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

export default useBarcodeScanner;