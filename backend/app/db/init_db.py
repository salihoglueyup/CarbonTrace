from app.db.database import SessionLocal
from app.models.models import Company, CBAMProduct, EmissionRecord


def init_db():
    """Veritabanını örnek verilerle doldur"""
    db = SessionLocal()

    # Eğer veri varsa çık
    if db.query(Company).first():
        db.close()
        return

    # Örnek şirketler
    companies = [
        {
            "name": "Anadolu Çelik A.Ş.",
            "tax_number": "1234567890",
            "sector": "Demir-Çelik",
            "sub_sector": "Çelik Profil",
            "city": "Kocaeli",
            "employee_count": 250,
            "annual_revenue": 150000000,
            "annual_eu_export": 8500000,
            "products": [
                {
                    "name": "Çelik Profil",
                    "hs_code": "7216",
                    "cn_code": "72163100",
                    "category": "Steel",
                    "annual_production_tons": 50000,
                    "eu_export_tons": 12000,
                    "embedded_emissions_per_ton": 1.85,
                },
            ],
            "emissions": [
                {
                    "year": 2024,
                    "scope1_emissions": 42000,
                    "scope2_emissions": 11500,
                    "scope3_emissions": 7500,
                    "emission_intensity": 407,
                    "data_source": "DirectMeasurement",
                    "is_verified": True,
                    "verified_by": "Bureau Veritas",
                }
            ],
        },
        {
            "name": "Ege Alüminyum San. Tic. Ltd. Şti.",
            "tax_number": "9876543210",
            "sector": "Alüminyum",
            "sub_sector": "Alüminyum Profil",
            "city": "İzmir",
            "employee_count": 180,
            "annual_revenue": 95000000,
            "annual_eu_export": 12000000,
            "products": [
                {
                    "name": "Alüminyum Profil",
                    "hs_code": "7604",
                    "cn_code": "76042100",
                    "category": "Aluminium",
                    "annual_production_tons": 15000,
                    "eu_export_tons": 6000,
                    "embedded_emissions_per_ton": 8.5,
                },
            ],
            "emissions": [
                {
                    "year": 2024,
                    "scope1_emissions": 8500,
                    "scope2_emissions": 42000,
                    "scope3_emissions": 5000,
                    "emission_intensity": 584,
                    "data_source": "CalculationBased",
                    "is_verified": False,
                }
            ],
        },
        {
            "name": "Marmara Çimento A.Ş.",
            "tax_number": "5555666677",
            "sector": "Çimento",
            "sub_sector": "Portland Çimento",
            "city": "Bursa",
            "employee_count": 320,
            "annual_revenue": 280000000,
            "annual_eu_export": 5000000,
            "products": [
                {
                    "name": "Portland Çimento",
                    "hs_code": "2523",
                    "cn_code": "25232100",
                    "category": "Cement",
                    "annual_production_tons": 500000,
                    "eu_export_tons": 25000,
                    "embedded_emissions_per_ton": 0.65,
                },
            ],
            "emissions": [
                {
                    "year": 2024,
                    "scope1_emissions": 310000,
                    "scope2_emissions": 15000,
                    "scope3_emissions": 12000,
                    "emission_intensity": 1204,
                    "data_source": "DirectMeasurement",
                    "is_verified": True,
                    "verified_by": "TÜV Türkiye",
                }
            ],
        },
        {
            "name": "Akdeniz Gübre Sanayi A.Ş.",
            "tax_number": "1112223334",
            "sector": "Gübre",
            "sub_sector": "Azotlu Gübre",
            "city": "Mersin",
            "employee_count": 420,
            "annual_revenue": 450000000,
            "annual_eu_export": 35000000,
            "products": [
                {
                    "name": "Üre Gübre",
                    "hs_code": "3102",
                    "cn_code": "31021010",
                    "category": "Fertilizers",
                    "annual_production_tons": 200000,
                    "eu_export_tons": 45000,
                    "embedded_emissions_per_ton": 2.8,
                },
            ],
            "emissions": [
                {
                    "year": 2024,
                    "scope1_emissions": 180000,
                    "scope2_emissions": 25000,
                    "scope3_emissions": 35000,
                    "emission_intensity": 533,
                    "data_source": "ThirdPartyAudit",
                    "is_verified": True,
                    "verified_by": "DNV GL",
                }
            ],
        },
        {
            "name": "Karadeniz Demir A.Ş.",
            "tax_number": "7778889990",
            "sector": "Demir-Çelik",
            "sub_sector": "Demir Döküm",
            "city": "Samsun",
            "employee_count": 85,
            "annual_revenue": 45000000,
            "annual_eu_export": 3200000,
            "products": [
                {
                    "name": "Dökme Demir",
                    "hs_code": "7201",
                    "cn_code": "72011000",
                    "category": "Iron",
                    "annual_production_tons": 8000,
                    "eu_export_tons": 2500,
                    "embedded_emissions_per_ton": 1.4,
                },
            ],
            "emissions": [
                {
                    "year": 2024,
                    "scope1_emissions": 9500,
                    "scope2_emissions": 2800,
                    "scope3_emissions": 1200,
                    "emission_intensity": 300,
                    "data_source": "IndustryAverage",
                    "is_verified": False,
                }
            ],
        },
    ]

    for company_data in companies:
        products_data = company_data.pop("products", [])
        emissions_data = company_data.pop("emissions", [])

        company = Company(**company_data)
        db.add(company)
        db.flush()

        for product_data in products_data:
            product = CBAMProduct(company_id=company.id, **product_data)
            db.add(product)

        for emission_data in emissions_data:
            emission = EmissionRecord(company_id=company.id, **emission_data)
            db.add(emission)

    db.commit()
    db.close()
    print("✅ Veritabanı örnek verilerle dolduruldu!")
