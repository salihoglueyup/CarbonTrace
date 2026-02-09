import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8001/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle token refresh on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refresh_token')
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh_token: refreshToken
                    })

                    const { access_token, refresh_token: newRefreshToken } = response.data
                    localStorage.setItem('access_token', access_token)
                    localStorage.setItem('refresh_token', newRefreshToken)

                    originalRequest.headers.Authorization = `Bearer ${access_token}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

// ============ Auth API ============

export const authAPI = {
    register: async (data) => {
        const response = await api.post('/auth/register', data)
        return response.data
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login/json', { email, password })
        return response.data
    },

    refresh: async (refreshToken) => {
        const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
        return response.data
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email })
        return response.data
    },

    resetPassword: async (token, newPassword) => {
        const response = await api.post('/auth/reset-password', { token, new_password: newPassword })
        return response.data
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me')
        return response.data
    }
}

// ============ Companies API ============

export const companiesAPI = {
    getAll: async () => {
        const response = await api.get('/companies')
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/companies/${id}`)
        return response.data
    },

    create: async (data) => {
        const response = await api.post('/companies', data)
        return response.data
    },

    update: async (id, data) => {
        const response = await api.put(`/companies/${id}`, data)
        return response.data
    },

    delete: async (id) => {
        const response = await api.delete(`/companies/${id}`)
        return response.data
    }
}

// ============ Dashboard API ============

export const dashboardAPI = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats')
        return response.data
    },

    getCompanySummary: async () => {
        const response = await api.get('/dashboard/companies-summary')
        return response.data
    },

    getEmissionTrend: async () => {
        const response = await api.get('/dashboard/emission-trend')
        return response.data
    },

    getSectorBreakdown: async () => {
        const response = await api.get('/dashboard/sector-breakdown')
        return response.data
    },

    getRecentActivities: async () => {
        const response = await api.get('/dashboard/recent-activities')
        return response.data
    },

    getCbamProjection: async () => {
        const response = await api.get('/dashboard/cbam-projection')
        return response.data
    }
}

// ============ Chat API ============

export const chatAPI = {
    send: async (message, companyId = null) => {
        const response = await api.post('/chat', { message, company_id: companyId })
        return response.data
    },

    getHistory: async () => {
        const response = await api.get('/chat/history')
        return response.data
    }
}

// Legacy support
export const chatWithAI = async (message, companyId = null) => {
    const response = await api.post('/chat', { message, company_id: companyId })
    return response.data
}

// ============ Emissions API ============

export const emissionsAPI = {
    getAll: async () => {
        const response = await api.get('/emissions')
        return response.data
    },

    getByCompany: async (companyId) => {
        const response = await api.get(`/emissions/${companyId}`)
        return response.data
    },

    getTrend: async (companyId = null) => {
        const params = companyId ? `?company_id=${companyId}` : ''
        const response = await api.get(`/emissions/trend${params}`)
        return response.data
    },

    getBreakdown: async (companyId, year = null) => {
        const params = year ? `?year=${year}` : ''
        const response = await api.get(`/emissions/breakdown/${companyId}${params}`)
        return response.data
    },

    getTopEmitters: async (limit = 10) => {
        const response = await api.get(`/emissions/comparison/top?limit=${limit}`)
        return response.data
    },

    create: async (data) => {
        const response = await api.post('/emissions', data)
        return response.data
    }
}

// ============ CBAM API ============

export const cbamAPI = {
    calculate: async (data) => {
        const response = await api.post('/cbam/calculate', data)
        return response.data
    },

    calculateSimple: async (emissions, carbonPrice = 90, phaseInRate = 0.025) => {
        const response = await api.post('/cbam/calculate-simple', {
            emissions,
            carbon_price: carbonPrice,
            phase_in_rate: phaseInRate
        })
        return response.data
    },

    getProducts: async (companyId = null, category = null) => {
        let params = []
        if (companyId) params.push(`company_id=${companyId}`)
        if (category) params.push(`category=${category}`)
        const queryString = params.length ? `?${params.join('&')}` : ''
        const response = await api.get(`/cbam/products${queryString}`)
        return response.data
    },

    getProduct: async (productId) => {
        const response = await api.get(`/cbam/products/${productId}`)
        return response.data
    },

    createProduct: async (data) => {
        const response = await api.post('/cbam/products', data)
        return response.data
    },

    getRates: async () => {
        const response = await api.get('/cbam/rates')
        return response.data
    },

    getCategories: async () => {
        const response = await api.get('/cbam/categories')
        return response.data
    },

    getCategoryBreakdown: async () => {
        const response = await api.get('/cbam/category-breakdown')
        return response.data
    },

    getCompanySummary: async (companyId) => {
        const response = await api.get(`/cbam/company-summary/${companyId}`)
        return response.data
    }
}

// ============ Reports API ============

export const reportsAPI = {
    getAll: async () => {
        const response = await api.get('/reports')
        return response.data
    },

    getTypes: async () => {
        const response = await api.get('/reports/types')
        return response.data
    },

    generate: async (reportType, companyId = null, year = null, format = 'pdf') => {
        const response = await api.post('/reports/generate', {
            report_type: reportType,
            company_id: companyId,
            year,
            format
        })
        return response.data
    },

    getSummary: async () => {
        const response = await api.get('/reports/summary')
        return response.data
    }
}

// ============ Suppliers API ============

export const suppliersAPI = {
    getAll: async () => {
        const response = await api.get('/suppliers')
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/suppliers/${id}`)
        return response.data
    },

    create: async (data) => {
        const response = await api.post('/suppliers', data)
        return response.data
    },

    update: async (id, data) => {
        const response = await api.put(`/suppliers/${id}`, data)
        return response.data
    },

    delete: async (id) => {
        const response = await api.delete(`/suppliers/${id}`)
        return response.data
    }
}

// ============ Recommendations API ============

export const recommendationsAPI = {
    getPersonalized: async (userId = 1) => {
        const response = await api.get(`/recommendations/personalized?user_id=${userId}`)
        return response.data
    },

    getInsights: async () => {
        const response = await api.get('/recommendations/insights')
        return response.data
    },

    getAnomalies: async () => {
        const response = await api.get('/recommendations/anomalies')
        return response.data
    },

    getActionItems: async () => {
        const response = await api.get('/recommendations/action-items')
        return response.data
    }
}

// ============ Notifications API ============

export const notificationsAPI = {
    getAll: async () => {
        const response = await api.get('/notifications')
        return response.data
    },

    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`)
        return response.data
    },

    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all')
        return response.data
    }
}

// ============ Projects API ============

export const projectsAPI = {
    getAll: async (companyId = null) => {
        const params = companyId ? `?company_id=${companyId}` : ''
        const response = await api.get(`/projects${params}`)
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/projects/${id}`)
        return response.data
    },

    create: async (data) => {
        const response = await api.post('/projects', data)
        return response.data
    },

    update: async (id, data) => {
        const response = await api.put(`/projects/${id}`, data)
        return response.data
    },

    delete: async (id) => {
        const response = await api.delete(`/projects/${id}`)
        return response.data
    }
}

// ============ Calendar API ============

export const calendarAPI = {
    getAll: async (companyId = null) => {
        const params = companyId ? `?company_id=${companyId}` : ''
        const response = await api.get(`/calendar${params}`)
        return response.data
    },

    getById: async (id) => {
        const response = await api.get(`/calendar/${id}`)
        return response.data
    },

    create: async (data) => {
        const response = await api.post('/calendar', data)
        return response.data
    },

    update: async (id, data) => {
        const response = await api.put(`/calendar/${id}`, data)
        return response.data
    },

    delete: async (id) => {
        const response = await api.delete(`/calendar/${id}`)
        return response.data
    }
}

// ============ Compliance API ============

export const complianceAPI = {
    getStatus: async (companyId) => {
        const response = await api.get(`/compliance/status?company_id=${companyId}`)
        return response.data
    },

    updateStatus: async (itemId, companyId, data) => {
        // data: { is_completed: boolean, notes: string }
        const response = await api.put(`/compliance/status/${itemId}?company_id=${companyId}`, data)
        return response.data
    }
}



// ============ Users API (Admin Only) ============

export const usersAPI = {
    getAll: async () => {
        const response = await api.get('/users')
        return response.data
    },

    updateRole: async (id, role) => {
        const response = await api.put(`/users/${id}/role`, { role })
        return response.data
    },

    updateStatus: async (id, isActive) => {
        const response = await api.put(`/users/${id}/status`, { is_active: isActive })
        return response.data
    }
}

// ============ Finance API ============

export const financeAPI = {
    calculateProjection: async (data) => {
        const response = await api.post('/finance/calculate/projection', data)
        return response.data
    },

    getScenarios: async (companyId) => {
        const response = await api.get(`/finance/scenarios?company_id=${companyId}`)
        return response.data
    },

    createScenario: async (data) => {
        const response = await api.post('/finance/scenarios', data)
        return response.data
    }
}

// ============ Market Data API ============

export const marketAPI = {
    getCarbonPrice: async () => {
        const response = await api.get('/market/carbon-price')
        return response.data
    },

    getExchangeRates: async () => {
        const response = await api.get('/market/exchange-rates')
        return response.data
    },

    getNews: async (limit = 10) => {
        const response = await api.get(`/market/news?limit=${limit}`)
        return response.data
    }
}

export default api
