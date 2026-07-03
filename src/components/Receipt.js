import React from 'react';

const Receipt = React.forwardRef(({ sale, items, shopName }, ref) => {
    if (!sale || !items) return null;

    const discount = parseFloat(sale.actual_amount) - parseFloat(sale.total_amount);

    return (
        <div ref={ref} style={{ padding: '20px', fontFamily: 'monospace', color: '#000' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: '0' }}>{shopName}</h2>
                <p style={{ margin: '5px 0' }}>Sale Receipt</p>
                <p style={{ margin: '0', fontSize: '12px' }}>Date: {new Date(sale.date_created).toLocaleString()}</p>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '0' }}><strong>Ref #:</strong> {sale.ref_no}</p>
                <p style={{ margin: '0' }}><strong>Customer:</strong> {sale.customer_name || 'N/A'}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td style={{ padding: '8px' }}>{item.name}</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>${parseFloat(item.price).toFixed(2)}</td>
                            <td style={{ padding: '8px', textAlign: 'right' }}>${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '20px', borderTop: '1px dashed #000', paddingTop: '10px' }}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'right' }}>Subtotal:</td>
                            <td style={{ textAlign: 'right', width: '100px' }}>${parseFloat(sale.actual_amount).toFixed(2)}</td>
                        </tr>
                        {discount > 0 && (
                            <tr>
                                <td style={{ textAlign: 'right' }}>Discount:</td>
                                <td style={{ textAlign: 'right' }}>-${discount.toFixed(2)}</td>
                            </tr>
                        )}
                        <tr style={{ fontWeight: 'bold' }}>
                            <td style={{ textAlign: 'right' }}>Total:</td>
                            <td style={{ textAlign: 'right' }}>${parseFloat(sale.total_amount).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px' }}>
                <p>Thank you for your purchase!</p>
            </div>
        </div>
    );
});

export default Receipt;