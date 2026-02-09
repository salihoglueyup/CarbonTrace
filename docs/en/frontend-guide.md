# 🎨 Frontend Guide & Design System

Our frontend is built to be not just functional, but **beautiful and intuitive**. We adhere to a "Premium Corporate" aesthetic utilizing the Garanti BBVA color palette.

## 🌈 Color Palette

We use CSS variables for consistent theming. These are defined in `index.css`.

| Color Name | Hex Code | Utility Class | Verification |
| :--- | :--- | :--- | :--- |
| **BBVA Green** | `#00874A` | `bg-bbva-green` | Primary Brand Color |
| **Dark Green** | `#006837` | `bg-bbva-dark-green` | Hover & Active States |
| **Navy Blue** | `#004481` | `bg-bbva-blue` | Data Visualization / Accents |
| **Warm Orange** | `#F39200` | `bg-bbva-orange` | Calls to Action (Secondary) |
| **Signal Red** | `#E53E3E` | `bg-bbva-red` | Alerts & Errors |

---

## 🧩 Key Components

### 1. KPI Card (`KPICard.jsx`)

Used to display high-level metrics on the dashboard.

**Usage:**

```jsx
<KPICard 
  title="Total Emissions" 
  value="12,500 t" 
  trend="+2.5%" 
  trendUp={false} // false = bad trend (red)
  icon={<CloudIcon />} 
/>
```

**Features:**

* Glassmorphism effect
* Hover lift animation
* Conditional trend coloring

---

### 2. Charts (`/components/charts`)

We use **Recharts** wrapped in responsive containers.

**Example: Emission Area Chart**

```jsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#00874A" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#00874A" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <Area type="monotone" dataKey="scope1" stroke="#00874A" fill="url(#colorScope1)" />
  </AreaChart>
</ResponsiveContainer>
```

---

## 📐 Layout System

We use a standard layout wrapper `Layout.jsx` that includes:

1. **Sidebar:** Collapsible navigation.
2. **TopBar:** User profile, notifications, and search.
3. **Main Content:** The dynamic page content.

```jsx
// App.jsx
<Router>
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/viz" element={<DataVisualization />} />
    </Routes>
  </Layout>
</Router>
```
