import { useState, useEffect } from 'react'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const PerformanceMonitor = () => {
    const [metrics, setMetrics] = useState(null)
    const [health, setHealth] = useState(null)
    const [errors, setErrors] = useState([])
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAllData()
        // Refresh every 30 seconds
        const interval = setInterval(fetchAllData, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchAllData = async () => {
        try {
            const [metricsRes, healthRes, errorsRes, historyRes] = await Promise.all([
                fetch('http://localhost:8000/api/performance/metrics'),
                fetch('http://localhost:8000/api/performance/health'),
                fetch('http://localhost:8000/api/performance/errors'),
                fetch('http://localhost:8000/api/performance/metrics/history?hours=24')
            ])

            const [metricsData, healthData, errorsData, historyData] = await Promise.all([
                metricsRes.json(), healthRes.json(), errorsRes.json(), historyRes.json()
            ])

            if (metricsData.success) setMetrics(metricsData.metrics)
            if (healthData.success) setHealth(healthData)
            if (errorsData.success) setErrors(errorsData.errors)
            if (historyData.success) setHistory(historyData.history.slice(-12)) // Last 12 hours
        } catch (error) {
            console.error('Error fetching performance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return '#00874A'
            case 'warning': return '#F39200'
            case 'critical': case 'degraded': return '#E53E3E'
            default: return '#718096'
        }
    }

    if (loading) {
        return <div className="loading-state"><div className="spinner"></div></div>
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>⚡ Performance Monitor</h1>
                    <p className="text-muted">Sistem performansı ve sağlık durumu</p>
                </div>
                <div className="header-actions">
                    <span
                        className="status-indicator"
                        style={{ color: getStatusColor(health?.status) }}
                    >
                        ● {health?.status === 'healthy' ? 'Sağlıklı' :
                            health?.status === 'warning' ? 'Uyarı' : 'Kritik'}
                    </span>
                    <button className="btn btn-outline" onClick={fetchAllData}>
                        🔄 Yenile
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid mb-4">
                <div className="stat-card">
                    <div className="stat-icon blue">⚡</div>
                    <div className="stat-content">
                        <h4>Ortalama Yanıt</h4>
                        <div className="value">{metrics?.api_response_times?.avg_ms}ms</div>
                        <div className="change">P95: {metrics?.api_response_times?.p95_ms}ms</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">📊</div>
                    <div className="stat-content">
                        <h4>İstek/Dakika</h4>
                        <div className="value">{metrics?.requests_per_minute}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className={`stat-icon ${metrics?.error_rate > 2 ? 'danger' : 'green'}`}>⚠️</div>
                    <div className="stat-content">
                        <h4>Hata Oranı</h4>
                        <div className="value">{metrics?.error_rate}%</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">💻</div>
                    <div className="stat-content">
                        <h4>CPU / RAM</h4>
                        <div className="value">{metrics?.cpu_usage_percent}% / {metrics?.memory_usage_mb}MB</div>
                    </div>
                </div>
            </div>

            <div className="performance-layout">
                {/* Response Time History */}
                <div className="card chart-card">
                    <div className="card-header">
                        <span>📈</span> Yanıt Süresi (Son 12 Saat)
                    </div>
                    <div className="card-body chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00874A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00874A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).getHours() + ':00'} />
                                <YAxis unit="ms" />
                                <Tooltip labelFormatter={(t) => new Date(t).toLocaleTimeString('tr-TR')} />
                                <Area type="monotone" dataKey="avg_response_ms" stroke="#00874A" fill="url(#colorResponse)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Component Health */}
                <div className="card">
                    <div className="card-header">
                        <span>🏥</span> Bileşen Durumu
                    </div>
                    <div className="card-body">
                        {health?.components && Object.entries(health.components).map(([name, data]) => (
                            <div key={name} className="component-status">
                                <div className="component-name">
                                    <span
                                        className="status-dot"
                                        style={{ backgroundColor: getStatusColor(data.status) }}
                                    ></span>
                                    {name.toUpperCase()}
                                </div>
                                <div className="component-info">
                                    {data.latency_ms && <span>{data.latency_ms}ms</span>}
                                    {data.connections && <span>{data.connections} conn</span>}
                                    {data.hit_rate && <span>{data.hit_rate}</span>}
                                    {data.model && <span>{data.model}</span>}
                                </div>
                            </div>
                        ))}
                        <div className="uptime-info">
                            <span>⏱️ Uptime:</span>
                            <strong>{health?.uptime}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Log */}
            <div className="card mt-4">
                <div className="card-header">
                    <span>🐛</span> Son Hatalar
                </div>
                <div className="card-body">
                    {errors.length === 0 ? (
                        <div className="empty-state">
                            <span>✅</span>
                            <p>Hata kaydı yok</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Tip</th>
                                    <th>Mesaj</th>
                                    <th>Endpoint</th>
                                    <th>Sayı</th>
                                    <th>Zaman</th>
                                </tr>
                            </thead>
                            <tbody>
                                {errors.map(error => (
                                    <tr key={error.id}>
                                        <td><span className="error-type">{error.type}</span></td>
                                        <td>{error.message}</td>
                                        <td><code>{error.endpoint}</code></td>
                                        <td><span className="badge badge-danger">{error.count}</span></td>
                                        <td>{new Date(error.timestamp).toLocaleString('tr-TR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Issues */}
            {health?.issues?.length > 0 && (
                <div className="card mt-4">
                    <div className="card-header">
                        <span>⚠️</span> Aktif Sorunlar
                    </div>
                    <div className="card-body">
                        <div className="issues-list">
                            {health.issues.map((issue, i) => (
                                <div key={i} className="issue-item">
                                    <span className="issue-icon">⚠️</span>
                                    <span>{issue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PerformanceMonitor
