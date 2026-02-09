# 📖 Kullanıcı El Kitabı

**CBAM Guard Kullanıcı Kılavuzu**na hoş geldiniz. Bu rehber, platformu etkili bir şekilde kullanmanıza, emisyonları yönetmenize ve uyumluluk raporları oluşturmanıza yardımcı olacaktır.

## 🎛️ Dashboard (Kontrol Paneli)

Dashboard sizin komuta merkezinizdir. Giriş yaptığınızda, sürdürülebilirlik metriklerinizin gerçek zamanlı bir özetiyle karşılaşırsınız.

### Temel Metrikler (KPI'lar)

1. **Toplam Emisyon (tCO2e):** Mevcut yıl için toplanmış Kapsam 1, 2 ve 3 emisyonlarınız.
2. **Tahmini Vergi:** Güncel CBAM düzenlemeleri ve ETS fiyatlarına göre öngörülen mali yükümlülük.
3. **Aktif Uyarılar:** Acil dikkat gerektiren kritik bildirimler (örneğin: kota aşımı).

![Dashboard Ekran Görüntüsü](../images/screenshots/dashboard-placeholder.png)

---

## 🏭 Emisyon Yönetimi

Yeni veri eklemek veya güncellemek için:

1. Yan menüden **Emisyonlar** sekmesine gidin.
2. Sağ üstteki **"Veri Ekle"** butonuna tıklayın.
3. **Formu doldurun:**
    * **Kaynak Tipi:** Örn. Doğalgaz (Kapsam 1) veya Elektrik (Kapsam 2).
    * **Tesis:** Fabrika veya üretim birimini seçin.
    * **Miktar:** Tüketim değerini girin (örn. kWh veya m3).
4. Sistem, güncel emisyon faktörlerini kullanarak **Karbon Eşdeğerini (tCO2e)** otomatik olarak hesaplar.

> **İpucu:** CSV İçe Aktarma aracını kullanarak toplu veri yüklemesi de yapabilirsiniz.

---

## 📄 Rapor Oluşturma

Uyumluluk, doğru raporlamaya dayanır. CBAM Guard bunu birkaç tıklamaya indirger.

### Rapor Türleri

* **Çeyreklik CBAM Beyanı:** AB komisyonunun talep ettiği resmi format.
* **İç Denetim:** Paydaşlar için detaylı kırılım.
* **Tedarikçi Özeti:** Tedarik zincirinizden gelen verilerin toplu görünümü.

### Nasıl Dışa Aktarılır?

1. **Raporlar** sayfasına gidin.
2. **Tarih Aralığını** seçin (örn. 2024 1. Çeyrek).
3. **Formatı** seçin (Okuma için PDF, resmi gönderim için XML).
4. **Oluştur** butonuna tıklayın. Dosya otomatik olarak inecektir.

---

## 🧠 AI Asistanı

**CBAM AI Asistanı**, uygulamanın içinde yaşayan mevzuat uzmanınızdır.

**Neler sorabilirsiniz?**

* *"Türkiye'de çelik üretimi için varsayılan emisyon faktörü nedir?"*
* *"Ekim 2023'te çıkan yeni düzenleme alüminyum ihracatımı nasıl etkiler?"*
* *"Kapsam 1 trendimi analiz et ve azaltım önerileri sun."*

**Bağlam Farkındalığı (Context Awareness):**
Eğer belirli bir grafiği (örneğin Emisyon Trendi) inceliyorsanız, AI *o anki verinin* farkındadır ve bağlama uygun yorumlar yapar.

---

## 🌍 Tedarikçi Portalı

Kapsam 3 emisyonlarının doğruluğu için tedarikçilerinizi veri girmeleri adına davet edebilirsiniz.

1. **Tedarikçiler** sayfasına gidin.
2. **"Tedarikçi Davet Et"** butonuna tıklayın.
3. E-posta adresini girin. Tedarikçi güvenli bir **Sihirli Bağlantı (Magic Link)** alacaktır.
4. Veri girdiklerinde, dashboard'unuzda "Onay Bekliyor" statüsüyle görünürler.
