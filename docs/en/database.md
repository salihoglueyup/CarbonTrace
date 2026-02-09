# 🗄️ Database Schema

CBAM Guard uses a relational database model to manage the complexities of emissions, reporting, and organizational structures.

## 📐 ER Diagram (Entity-Relationship)

```mermaid
erDiagram
    User ||--o{ Report : created_by
    User ||--o{ Organization : belongs_to
    Organization ||--|{ Facility : has
    Facility ||--o{ Emission : generates
    Emission ||--|| EmissionFactor : uses_factor
    Report ||--|{ ReportItem : contains

    User {
        int id
        string email
        string hashed_password
        enum role "Admin, Manager, Viewer"
    }

    Organization {
        int id
        string name
        string tax_id
        string address
    }

    Facility {
        int id
        string name
        string type
        int org_id
    }

    Emission {
        int id
        date date
        float consumption
        float total_co2e
        string scope "Scope 1, 2, 3"
        int facility_id
    }

    EmissionFactor {
        int id
        string source_name
        float factor
        string unit "kgCO2e/unit"
        int year
    }
```

## 📋 Table Details

### `users`

System users.

* `role`: Defines RBAC permissions.
* `is_active`: Soft delete mechanism.

### `emissions`

The core ledger of carbon activities.

* `consumption`: The raw activity data (e.g., 1000 m3 Gas).
* `total_co2e`: The calculated impact (Consumption * Factor).
* `scope`: Scope 1 (Direct), Scope 2 (Energy), Scope 3 (Supply Chain).

### `reports`

Generated compliance documents.

* `period`: The time range covered (e.g., "Q1 2024").
* `status`: Draft, Pending Approval, Submitted.
* `data_snapshot`: JSON blob storing the state of emissions at time of report generation (for immutability).
