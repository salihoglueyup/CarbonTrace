import React from 'react';
import { Outlet } from 'react-router-dom';

const PortalLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
                        <img src="/src/assets/logo.svg" alt="CarbonTrace Logo" className="h-10 w-10" />
                        CarbonTrace
                    </h1>
                    <p className="text-gray-500 mt-2">Tedarikçi Veri Giriş Portalı</p>
                </div>

                <Outlet />

                <div className="mt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} CarbonTrace. Powered by Garanti BBVA Teknoloji.
                </div>
            </div>
        </div>
    );
};

export default PortalLayout;
