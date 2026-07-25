import React from 'react';

/**
 * Renders a "has an outstanding balance" vs "clear" badge. Customers and
 * Suppliers pages each had their own copy of this with only the labels and
 * colors differing.
 */
const BalanceStatusBadge = ({ balance, dueLabel = 'Has Dues', clearLabel = 'Clear', dueVariant = 'warning text-dark' }) => {
    const hasDues = parseFloat(balance) > 0;
    if (hasDues) {
        return <span className={`badge bg-${dueVariant}`}>{dueLabel}</span>;
    }
    return <span className="badge bg-success">{clearLabel}</span>;
};

export default BalanceStatusBadge;
