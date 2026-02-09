# 🎨 Frontend Rehberi & Tasarım Sistemi

Arayüzümüz sadece işlevsel değil, aynı zamanda **estetik ve sezgisel** olacak şekilde tasarlanmıştır. Garanti BBVA renk paletini kullanan bir "Premium Kurumsal" estetiğe sadık kalıyoruz.

## 🌈 Renk Paleti

Tutarlı tema yönetimi için CSS değişkenlerini kullanıyoruz. `index.css` içinde tanımlanmıştır.

| Renk Adı | Hex Kodu | Utility Class | Kullanım Amacı |
| :--- | :--- | :--- | :--- |
| **BBVA Yeşili** | `#00874A` | `bg-bbva-green` | Ana Marka Rengi |
| **Koyu Yeşil** | `#006837` | `bg-bbva-dark-green` | Hover & Aktif Durumlar |
| **Lacivert** | `#004481` | `bg-bbva-blue` | Veri Görselleştirme / Vurgular |
| **Sıcak Turuncu** | `#F39200` | `bg-bbva-orange` | Çağrı Butonları (İkincil) |
| **Uyarı Kırmızısı** | `#E53E3E` | `bg-bbva-red` | Uyarılar & Hatalar |

---

## 🧩 Temel Bileşenler

### 1. KPI Kartı (`KPICard.jsx`)

Dashboard'da özet metrikleri göstermek için kullanılır.

**Kullanım:**

```jsx
<KPICard 
  title="Toplam Emisyon" 
  value="12,500 t" 
  trend="+2.5%" 
  trendUp={false} // false = kötü trend (kırmızı)
  icon={<CloudIcon />} 
/>
```

**Özellikler:**

* Glassmorphism (Cam Efekti)
* Hover yükselme animasyonu
* Koşullu trend renklendirmesi

---

### 2. Grafikler (`/components/charts`)

Duyarlı kapsayıcılar (Container) içine sarılmış **Recharts** bileşenlerini kullanıyoruz.

**Örnek: Emisyon Alan Grafiği**

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

## 📐 Yerleşim (Layout) Sistemi

Standart bir `Layout.jsx` sarmalayıcısı kullanıyoruz:

1. **Sidebar:** Katlanabilir navigasyon menüsü.
2. **TopBar:** Kullanıcı profili, bildirimler ve arama.
3. **Main Content:** Dinamik sayfa içeriği.

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
