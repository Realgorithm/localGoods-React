import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { MobileSidebar } from '../components/Sidebar';

const MainLayout = () => {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    return (
        <div className="d-flex">
            <Sidebar />
            <MobileSidebar show={showMobileMenu} onHide={() => setShowMobileMenu(false)} />

            <div className="flex-grow-1 d-flex flex-column main-content-wrapper">
                {/* Mobile-only top bar with menu trigger, hidden at lg and up */}
                <div className="d-flex d-lg-none align-items-center justify-content-between px-3 py-2 mobile-topbar">
                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setShowMobileMenu(true)}
                        aria-label="Open navigation menu"
                    >
                        <i className="bi bi-list fs-4"></i>
                    </button>
                    <span className="fw-bold">LocalGoods</span>
                    <span style={{ width: '38px' }} aria-hidden="true"></span>
                </div>

                <main className="flex-grow-1 p-3 p-md-4 bg-body-tertiary">
                    <Outlet /> {/* This will render the matched child route component */}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
