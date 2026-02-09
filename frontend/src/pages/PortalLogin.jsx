import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PortalLogin = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, error
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setErrorMsg('Geçersiz bağlantı. Token bulunamadı.');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/api/portal/verify/${token}`);

                if (response.data.valid) {
                    // Token valid, save to session storage and redirect to form
                    sessionStorage.setItem('portal_token', token);
                    sessionStorage.setItem('supplier_name', response.data.supplier_name);
                    sessionStorage.setItem('supplier_id', response.data.supplier_id);

                    navigate('/portal/form');
                } else {
                    setStatus('error');
                    setErrorMsg('Bağlantı geçersiz veya süresi dolmuş.');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                setErrorMsg('Bağlantı doğrulanamadı. Lütfen yönetici ile iletişime geçin.');
            }
        };

        verifyToken();
    }, [searchParams, navigate]);

    if (status === 'error') {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    ⚠️
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Erişim Hatası</h2>
                <p className="text-gray-600 mb-6">{errorMsg}</p>
                <div className="border-t pt-4 text-sm text-gray-500">
                    Lütfen size gönderilen linki kontrol edin veya yeni bir link talep edin.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
            <div className="w-16 h-16 border-4 border-green-100 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Doğrulanıyor...</h2>
            <p className="text-gray-600 text-sm">Güvenli giriş yapılıyor, lütfen bekleyin.</p>
        </div>
    );
};

export default PortalLogin;
