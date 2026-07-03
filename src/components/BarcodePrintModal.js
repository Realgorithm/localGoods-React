import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

const BarcodePrintModal = ({ show, handleClose, product }) => {
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    if (!product) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Print Barcode</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div ref={componentRef} className="text-center p-4">
                    <h5 className="mb-2">{product.name}</h5>
                    <p className="fw-bold fs-4 mb-3">₹{parseFloat(product.price).toFixed(2)}</p>
                    {product.sku ? (
                        <Barcode value={product.sku} />
                    ) : (
                        <p className="text-danger">This product does not have an SKU.</p>
                    )}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" onClick={handlePrint} disabled={!product.sku}><i className="bi bi-printer-fill me-2"></i> Print</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BarcodePrintModal;