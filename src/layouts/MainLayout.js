import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div className="d-flex">
            <Sidebar />
            <main className="flex-grow-1 p-4 bg-body-tertiary">
                <Outlet /> {/* This will render the matched child route component */}
            </main>
        </div>
    );
};

export default MainLayout;