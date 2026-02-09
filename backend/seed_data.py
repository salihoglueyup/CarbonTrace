"""
CBAM Guard - Seed Data Script
Veritabanına örnek veriler ekler.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.models import Company, CBAMProduct, EmissionRecord
from app.models.supplier import Supplier
from app.models.user import User
from app.core.security import get_password_hash

# Tabloları oluştur
Base.metadata.create_all(bind=engine)


def clear_existing_data(db: Session):
    """Mevcut verileri temizle"""
    db.query(EmissionRecord).delete()
    db.query(CBAMProduct).delete()
    db.query(Supplier).delete()
    db.query(Company).delete()
    db.commit()
    print("✓ Mevcut veriler temizlendi")


def seed_companies(db: Session):
    """Örnek şirketler ekle"""
    companies = [
        # Çelik Sektörü
        Company(
            name="Kardemir Karabük Demir Çelik",
            tax_number="1234567890",
            sector="Çelik",
            sub_sector="Demir-Çelik Üretimi",
            city="Karabük",
            employee_count=4500,
            annual_revenue=12500000000,
            annual_eu_export=450000000,
            is_active=True,
        ),
        Company(
            name="İsdemir İskenderun Demir Çelik",
            tax_number="2345678901",
            sector="Çelik",
            sub_sector="Demir-Çelik Üretimi",
            city="İskenderun",
            employee_count=5200,
            annual_revenue=15800000000,
            annual_eu_export=680000000,
            is_active=True,
        ),
        Company(
            name="Erdemir Ereğli Demir Çelik",
            tax_number="3456789012",
            sector="Çelik",
            sub_sector="Yassı Çelik",
            city="Ereğli",
            employee_count=8500,
            annual_revenue=28900000000,
            annual_eu_export=920000000,
            is_active=True,
        ),
        # Alüminyum Sektörü
        Company(
            name="ETİ Alüminyum",
            tax_number="4567890123",
            sector="Alüminyum",
            sub_sector="Primer Alüminyum",
            city="Konya",
            employee_count=2800,
            annual_revenue=8500000000,
            annual_eu_export=320000000,
            is_active=True,
        ),
        Company(
            name="ASSAN Alüminyum",
            tax_number="5678901234",
            sector="Alüminyum",
            sub_sector="Alüminyum Levha",
            city="Kocaeli",
            employee_count=1200,
            annual_revenue=4200000000,
            annual_eu_export=185000000,
            is_active=True,
        ),
        # Çimento Sektörü
        Company(
            name="Akçansa Çimento",
            tax_number="6789012345",
            sector="Çimento",
            sub_sector="Portland Çimento",
            city="İstanbul",
            employee_count=1800,
            annual_revenue=6800000000,
            annual_eu_export=95000000,
            is_active=True,
        ),
        Company(
            name="Oyak Çimento",
            tax_number="7890123456",
            sector="Çimento",
            sub_sector="Beyaz Çimento",
            city="Adana",
            employee_count=3200,
            annual_revenue=5400000000,
            annual_eu_export=78000000,
            is_active=True,
        ),
        # Gübre Sektörü
        Company(
            name="Toros Tarım",
            tax_number="8901234567",
            sector="Gübre",
            sub_sector="Azotlu Gübre",
            city="Mersin",
            employee_count=1500,
            annual_revenue=7200000000,
            annual_eu_export=145000000,
            is_active=True,
        ),
        Company(
            name="İGSAŞ Gübre",
            tax_number="9012345678",
            sector="Gübre",
            sub_sector="Kompoze Gübre",
            city="Kocaeli",
            employee_count=800,
            annual_revenue=3100000000,
            annual_eu_export=62000000,
            is_active=True,
        ),
        # Elektrik
        Company(
            name="İşkur Enerji",
            tax_number="0123456789",
            sector="Enerji",
            sub_sector="Elektrik Üretimi",
            city="Ankara",
            employee_count=450,
            annual_revenue=2800000000,
            annual_eu_export=0,
            is_active=True,
        ),
        # Ek şirketler
        Company(
            name="Çolakoğlu Metalurji",
            tax_number="1122334455",
            sector="Çelik",
            sub_sector="Uzun Ürünler",
            city="Gebze",
            employee_count=2100,
            annual_revenue=9800000000,
            annual_eu_export=520000000,
            is_active=True,
        ),
        Company(
            name="Kroman Çelik",
            tax_number="2233445566",
            sector="Çelik",
            sub_sector="Nervürlü Çelik",
            city="Gebze",
            employee_count=1100,
            annual_revenue=4500000000,
            annual_eu_export=280000000,
            is_active=True,
        ),
    ]

    db.add_all(companies)
    db.commit()
    print(f"✓ {len(companies)} şirket eklendi")
    return companies


def seed_emissions(db: Session, companies: list):
    """Yıllık emisyon kayıtları ekle (2020-2024)"""
    emissions = []

    # Sektöre göre emisyon seviyeleri (tCO2e)
    sector_base_emissions = {
        "Çelik": {"scope1": 80000, "scope2": 25000, "scope3": 15000},
        "Alüminyum": {"scope1": 45000, "scope2": 35000, "scope3": 12000},
        "Çimento": {"scope1": 120000, "scope2": 8000, "scope3": 5000},
        "Gübre": {"scope1": 35000, "scope2": 15000, "scope3": 8000},
        "Enerji": {"scope1": 150000, "scope2": 2000, "scope3": 1000},
    }

    for company in companies:
        sector = company.sector
        base = sector_base_emissions.get(
            sector, {"scope1": 50000, "scope2": 15000, "scope3": 8000}
        )

        for year in range(2020, 2025):
            # Yıldan yıla %2-5 değişim
            import random

            variation = random.uniform(0.95, 1.08)
            year_factor = 1 - (2024 - year) * 0.03  # Geçmiş yıllar daha düşük

            # Şirket büyüklüğüne göre çarpan
            size_factor = company.employee_count / 3000

            emission = EmissionRecord(
                company_id=company.id,
                year=year,
                period="Yıllık",
                scope1_emissions=round(
                    base["scope1"] * variation * year_factor * size_factor
                ),
                scope2_emissions=round(
                    base["scope2"] * variation * year_factor * size_factor
                ),
                scope3_emissions=round(
                    base["scope3"] * variation * year_factor * size_factor
                ),
                emission_intensity=round(random.uniform(80, 150), 2),
                data_source="Şirket Beyanı" if year < 2024 else "Tahmini",
                is_verified=year < 2024,
                verified_by="TÜRKAK" if year < 2024 else None,
            )
            emissions.append(emission)

    db.add_all(emissions)
    db.commit()
    print(f"✓ {len(emissions)} emisyon kaydı eklendi")


def seed_products(db: Session, companies: list):
    """CBAM ürünleri ekle"""
    products = []

    product_templates = {
        "Çelik": [
            {
                "name": "Yassı Çelik Levha",
                "hs_code": "7208",
                "category": "Steel",
                "co2_per_ton": 1.8,
            },
            {
                "name": "Nervürlü Çelik",
                "hs_code": "7214",
                "category": "Steel",
                "co2_per_ton": 1.6,
            },
            {
                "name": "Çelik Boru",
                "hs_code": "7304",
                "category": "Steel",
                "co2_per_ton": 2.1,
            },
        ],
        "Alüminyum": [
            {
                "name": "Alüminyum Levha",
                "hs_code": "7606",
                "category": "Aluminium",
                "co2_per_ton": 8.5,
            },
            {
                "name": "Alüminyum Profil",
                "hs_code": "7604",
                "category": "Aluminium",
                "co2_per_ton": 9.2,
            },
        ],
        "Çimento": [
            {
                "name": "Portland Çimento",
                "hs_code": "2523",
                "category": "Cement",
                "co2_per_ton": 0.85,
            },
            {
                "name": "Klinker",
                "hs_code": "2523",
                "category": "Cement",
                "co2_per_ton": 0.95,
            },
        ],
        "Gübre": [
            {
                "name": "Üre",
                "hs_code": "3102",
                "category": "Fertilizers",
                "co2_per_ton": 3.2,
            },
            {
                "name": "Amonyum Nitrat",
                "hs_code": "3102",
                "category": "Fertilizers",
                "co2_per_ton": 4.8,
            },
        ],
    }

    import random

    for company in companies:
        templates = product_templates.get(company.sector, [])
        for template in templates:
            product = CBAMProduct(
                company_id=company.id,
                name=template["name"],
                hs_code=template["hs_code"],
                cn_code=template["hs_code"] + "00",
                category=template["category"],
                annual_production_tons=random.randint(50000, 500000),
                eu_export_tons=random.randint(10000, 100000),
                embedded_emissions_per_ton=template["co2_per_ton"],
            )
            products.append(product)

    db.add_all(products)
    db.commit()
    print(f"✓ {len(products)} CBAM ürün kaydı eklendi")


def seed_suppliers(db: Session):
    """Tedarikçiler ekle"""
    suppliers = [
        # AB Tedarikçileri
        Supplier(
            name="ArcelorMittal Germany",
            country="Almanya",
            contact_email="supply@arcelormittal.de",
            sector="Çelik",
            annual_emissions=120000,
            emission_intensity=1.2,
            verified=True,
            cbam_ready=True,
            risk_level="low",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="ThyssenKrupp Steel",
            country="Almanya",
            contact_email="cbam@thyssenkrupp.de",
            sector="Çelik",
            annual_emissions=95000,
            emission_intensity=1.3,
            verified=True,
            cbam_ready=True,
            risk_level="low",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="Salzgitter AG",
            country="Almanya",
            contact_email="export@salzgitter.de",
            sector="Çelik",
            annual_emissions=85000,
            emission_intensity=1.4,
            verified=True,
            cbam_ready=True,
            risk_level="low",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="SSAB Sweden",
            country="İsveç",
            contact_email="supply@ssab.se",
            sector="Çelik",
            annual_emissions=45000,
            emission_intensity=0.9,
            verified=True,
            cbam_ready=True,
            risk_level="low",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="Tata Steel Netherlands",
            country="Hollanda",
            contact_email="cbam@tatasteel.nl",
            sector="Çelik",
            annual_emissions=110000,
            emission_intensity=1.5,
            verified=True,
            cbam_ready=True,
            risk_level="medium",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="Heidelberg Materials",
            country="Almanya",
            contact_email="cement@heidelberg.de",
            sector="Çimento",
            annual_emissions=180000,
            emission_intensity=0.75,
            verified=True,
            cbam_ready=True,
            risk_level="low",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="Hydro Aluminium",
            country="Norveç",
            contact_email="sales@hydro.com",
            sector="Alüminyum",
            annual_emissions=65000,
            emission_intensity=4.5,
            verified=True,
            cbam_ready=True,
            risk_level="low",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        Supplier(
            name="Rio Tinto Alcan",
            country="Fransa",
            contact_email="eu@riotinto.com",
            sector="Alüminyum",
            annual_emissions=88000,
            emission_intensity=6.2,
            verified=True,
            cbam_ready=True,
            risk_level="medium",
            has_emission_report=True,
            has_cbam_certificate=True,
        ),
        # TR Tedarikçileri
        Supplier(
            name="Borçelik",
            country="Türkiye",
            contact_email="satis@borcelik.com.tr",
            sector="Çelik",
            annual_emissions=75000,
            emission_intensity=1.7,
            verified=True,
            cbam_ready=False,
            risk_level="medium",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Tosyalı Holding",
            country="Türkiye",
            contact_email="export@tosyali.com.tr",
            sector="Çelik",
            annual_emissions=92000,
            emission_intensity=1.9,
            verified=True,
            cbam_ready=False,
            risk_level="high",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Diler Demir Çelik",
            country="Türkiye",
            contact_email="info@diler.com.tr",
            sector="Çelik",
            annual_emissions=68000,
            emission_intensity=1.8,
            verified=False,
            cbam_ready=False,
            risk_level="high",
            has_emission_report=False,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Kaptan Demir Çelik",
            country="Türkiye",
            contact_email="satis@kaptancelik.com",
            sector="Çelik",
            annual_emissions=54000,
            emission_intensity=2.0,
            verified=False,
            cbam_ready=False,
            risk_level="high",
            has_emission_report=False,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Çemtaş Çelik",
            country="Türkiye",
            contact_email="export@cemtas.com.tr",
            sector="Çelik",
            annual_emissions=42000,
            emission_intensity=1.6,
            verified=True,
            cbam_ready=False,
            risk_level="medium",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Nuh Çimento",
            country="Türkiye",
            contact_email="satis@nuhcimento.com.tr",
            sector="Çimento",
            annual_emissions=156000,
            emission_intensity=0.88,
            verified=True,
            cbam_ready=False,
            risk_level="medium",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Limak Çimento",
            country="Türkiye",
            contact_email="info@limak.com.tr",
            sector="Çimento",
            annual_emissions=142000,
            emission_intensity=0.82,
            verified=True,
            cbam_ready=False,
            risk_level="medium",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        # Diğer Ülkeler
        Supplier(
            name="POSCO",
            country="Güney Kore",
            contact_email="global@posco.com",
            sector="Çelik",
            annual_emissions=210000,
            emission_intensity=2.1,
            verified=True,
            cbam_ready=False,
            risk_level="high",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Nippon Steel",
            country="Japonya",
            contact_email="export@nipponsteel.com",
            sector="Çelik",
            annual_emissions=195000,
            emission_intensity=2.0,
            verified=True,
            cbam_ready=False,
            risk_level="high",
            has_emission_report=True,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Baosteel",
            country="Çin",
            contact_email="intl@baosteel.com",
            sector="Çelik",
            annual_emissions=320000,
            emission_intensity=2.5,
            verified=False,
            cbam_ready=False,
            risk_level="critical",
            has_emission_report=False,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="JSW Steel",
            country="Hindistan",
            contact_email="exports@jsw.in",
            sector="Çelik",
            annual_emissions=280000,
            emission_intensity=2.3,
            verified=False,
            cbam_ready=False,
            risk_level="critical",
            has_emission_report=False,
            has_cbam_certificate=False,
        ),
        Supplier(
            name="Severstal",
            country="Rusya",
            contact_email="sales@severstal.com",
            sector="Çelik",
            annual_emissions=245000,
            emission_intensity=2.4,
            verified=False,
            cbam_ready=False,
            risk_level="critical",
            has_emission_report=False,
            has_cbam_certificate=False,
        ),
    ]

    db.add_all(suppliers)
    db.commit()
    print(f"✓ {len(suppliers)} tedarikçi eklendi")


def seed_admin_user(db: Session):
    """Admin kullanıcı oluştur (yoksa)"""
    existing = db.query(User).filter(User.email == "admin@cbamguard.com").first()
    if not existing:
        admin = User(
            email="admin@cbamguard.com",
            hashed_password=get_password_hash("admin123"),
            full_name="CBAM Admin",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("✓ Admin kullanıcı oluşturuldu")
    else:
        print("✓ Admin kullanıcı zaten mevcut")


def main():
    print("\n" + "=" * 50)
    print("CBAM Guard - Seed Data Script")
    print("=" * 50 + "\n")

    db = SessionLocal()

    try:
        # Mevcut verileri temizle
        clear_existing_data(db)

        # Yeni veriler ekle
        companies = seed_companies(db)
        seed_emissions(db, companies)
        seed_products(db, companies)
        seed_suppliers(db)
        seed_admin_user(db)

        print("\n" + "=" * 50)
        print("✅ Seed data başarıyla oluşturuldu!")
        print("=" * 50 + "\n")

        # Özet
        print("📊 Özet:")
        print(f"   • Şirketler: {db.query(Company).count()}")
        print(f"   • Emisyon Kayıtları: {db.query(EmissionRecord).count()}")
        print(f"   • CBAM Ürünleri: {db.query(CBAMProduct).count()}")
        print(f"   • Tedarikçiler: {db.query(Supplier).count()}")
        print(f"   • Kullanıcılar: {db.query(User).count()}")
        print()

    except Exception as e:
        print(f"❌ Hata: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
