import React from 'react';

/**
 * The "<h5 title/count> ... <search box>" card header repeated verbatim
 * across Products, Sales, Receiving, Categories, Customers, Suppliers, and
 * both Payments pages. Centralizing it means the responsive/search behavior
 * only needs to be fixed in one place.
 */
const SearchCardHeader = ({ icon, title, count, searchTerm, onSearchChange, searchPlaceholder = 'Search...' }) => (
    <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
            {icon && <i className={`bi ${icon} me-2`}></i>}
            {title}{typeof count === 'number' ? ` (${count})` : ''}
        </h5>
        <div className="w-50">
            <input
                type="text"
                className="form-control form-control-sm"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={onSearchChange}
            />
        </div>
    </div>
);

export default SearchCardHeader;
