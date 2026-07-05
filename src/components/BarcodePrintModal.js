import React, { useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

const BarcodePrintModal = ({ show, handleClose, product }) => {
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
    });

    if (!product) return null;

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Print Barcode</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div
                    ref={componentRef}
                    className="barcode-label"
                >
                    <h6 className="fw-bold mb-1">{product.name}</h6>
                    <p className="fw-bold mb-2">₹{parseFloat(product.price).toFixed(2)}</p>
                    {product.sku ? (
                        <Barcode
                            value={product.sku}
                            format="CODE128"
                            width={1.5}
                            height={45}
                            fontSize={12}
                            margin={0}
                            displayValue={true}
                        />
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