import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PortalForm = () => {
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [supplierName, setSupplierName] = useState('');

    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        period: 'Yıllık',
        scope1: '',
        scope2: '',
        scope3: '',
        notes: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const storedToken = sessionStorage.getItem('portal_token');
        const storedName = sessionStorage.getItem('supplier_name');

        if (!storedToken) {
            navigate('/portal/login'); // Redirect to login if no token
            return;
        }

        setToken(storedToken);
        setSupplierName(storedName || 'Tedarikçi');
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await axios.post('http://localhost:8000/api/portal/submit', {
                token,
                year: parseInt(formData.year),
                period: formData.period,
                scope1: parseFloat(formData.scope1),
                scope2: parseFloat(formData.scope2),
                scope3: parseFloat(formData.scope3),
                notes: formData.notes
            });

            setSuccess(true);
            sessionStorage.removeItem('portal_token'); // Clear session after success
        } catch (err) {
            console.error('Submission error:', err);
            setError('Veri gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    ✅
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
                <p className="text-gray-600 mb-6">
                    Emisyon verileriniz başarıyla kaydedildi. CBAM uyumluluk sürecimize katkınız için teşekkür ederiz.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                    Bu pencereyi artık kapatabilirsiniz.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-2xl w-full mx-auto">
            <div className="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
                <h2 className="text-xl font-bold">Hoş Geldiniz, {supplierName}</h2>
                <p className="text-green-100 text-sm mt-1">Lütfen yıllık emisyon verilerinizi aşağıya giriniz.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dönem</label>
                        <select
                            name="period"
                            value={formData.period}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="Yıllık">Yıllık</option>
                            <option value="Q1">Q1 (Ocak-Mart)</option>
                            <option value="Q2">Q2 (Nisan-Haziran)</option>
                            <option value="Q3">Q3 (Temmuz-Eylül)</option>
                            <option value="Q4">Q4 (Ekim-Aralık)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Emisyon Verileri (tCO2e)</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Scope 1 (Doğrudan Emisyonlar) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                name="scope1"
                                required
                                value={formData.scope1}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <span className="absolute right-3 top-3 text-gray-400 text-sm">tCO2e</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Üretim tesislerinizden kaynaklanan doğrudan emisyonlar.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Scope 2 (Dolaylı Enerji Emisyonları) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                name="scope2"
                                required
                                value={formData.scope2}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <span className="absolute right-3 top-3 text-gray-400 text-sm">tCO2e</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Satın alınan elektrik, ısı veya buhar kaynaklı emisyonlar.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Scope 3 (Diğer Dolaylı Emisyonlar) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                name="scope3"
                                required
                                value={formData.scope3}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <span className="absolute right-3 top-3 text-gray-400 text-sm">tCO2e</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hammadde taşıma, iş seyahatleri vb. kaynaklı dolaylı emisyonlar.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notlar (Opsiyonel)</label>
                    <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Varsa eklemek istediğiniz notlar..."
                    ></textarea>
                </div>

                <div className="pt-4 flex items-center justify-between border-t">
                    <p className="text-xs text-gray-500">
                        * işaretli alanlar zorunludur.
                    </p>
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {submitting ? 'Gönderiliyor...' : 'Verileri Gönder'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PortalForm;
