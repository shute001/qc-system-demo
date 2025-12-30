# Audit Log System Design Document

**Version**: 1.0 (Refactored for Unified Structure)  
**Last Updated**: 2025-12-30

## 1. Overview

The Audit Log system provides a detailed trail of all sensitive business operations within the Quality Control (QC) System. It tracks who did what, when, and exactly what changed.

### Key Features
- **Asynchronous Logging**: Audit logs are saved using `@Async` to avoid impacting the performance of business operations.
- **Unified Diff Structure**: Regardless of whether an operation is a Create, Update, or Delete, the change data is stored in a consistent array format.
- **Metadata-Driven**: Utilizes `@LogField` annotations on Entity classes to define which fields are audited and how they should be labeled.
- **DTO Support**: The comparison engine is capable of mapping Entity metadata to DTO response objects.

---

## 2. Database Schema

### `sys_audit_log` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Unique log ID |
| `staff_id` | VARCHAR(50) | Performer's Staff ID |
| `staff_name` | VARCHAR(100) | Performer's name |
| `api_path` | VARCHAR(255) | Full REST API path including method |
| `method` | VARCHAR(10) | HTTP Method (POST, PUT, DELETE) |
| `module` | VARCHAR(50) | System module (e.g., USER, ROLE, PROCESS) |
| `operation` | VARCHAR(255) | Business description (e.g., "Create User") |
| `params` | TEXT | Raw JSON of request parameters |
| `old_value` | TEXT | Flat JSON snapshot of monitored fields before change |
| `changed_value` | TEXT | **Unified JSON Array** of field modifications |
| `status` | INTEGER | 1 = Success, 0 = Failure |
| `error_msg` | TEXT | Exception detail if status is 0 |
| `ip_address` | VARCHAR(50) | Client IP address |
| `created_at` | TIMESTAMP | Event timestamp |

---

## 3. Data Format for `changed_value`

To simplify frontend rendering and database analysis, all data modifications are stored as a JSON array of objects.

### 3.1 Format Specification
```json
[
  {
    "field": "Display Label",
    "old": "Original value or 'N/A'",
    "new": "New value or 'N/A'"
  }
]
```

### 3.2 Example: Create User (POST)
```json
[
  { "field": "Staff Id", "old": "N/A", "new": "103" },
  { "field": "Staff Name", "old": "N/A", "new": "test" },
  { "field": "Email", "old": "N/A", "new": "N/A" },
  { "field": "Status", "old": "N/A", "new": "1" },
  { "field": "Manager ID", "old": "N/A", "new": "115f3525-cfb6-406b-87af-2f0cd27b29e3" },
  { "field": "Roles", "old": "N/A", "new": "[Staff]" },
  { "field": "Processes", "old": "N/A", "new": "[THH Line]" }
]
```

### 3.3 Example: Update User (PUT)
```json
[
  { "new": "[Business Line for NHC]", "field": "Processes", "old": "[THH Line]" }
]
```

### 3.4 Example: Delete User (DELETE)
```json
[
  { "field": "Staff Id", "old": "103", "new": "N/A" },
  { "field": "Staff Name", "old": "test", "new": "N/A" },
  { "field": "Email", "old": "N/A", "new": "N/A" },
  { "field": "Status", "old": "1", "new": "N/A" },
  { "field": "Manager ID", "old": "115f3525-cfb6-406b-87af-2f0cd27b29e3", "new": "N/A" },
  { "field": "Roles", "old": "[Staff]", "new": "N/A" },
  { "field": "Processes", "old": "[THH Line]", "new": "N/A" }
]
```

---

## 4. API Specification

### 4.1 GET `/api/v1/audit/list`
Fetch paginated audit logs with advanced filtering.

**Parameters**:
- `staffId` (Optional): Performer ID.
- `module` (Optional): Dropdown selection of modules.
- `operation` (Optional): Dropdown selection of operation types.
- `startDate/endDate` (Optional): Date range.

### 4.2 GET `/api/v1/audit/options`
Returns unique lists of Modules and Operations currently present in the database to populate frontend search dropdowns.

**Response**:
```json
{
  "modules": ["USER", "ROLE", "PROCESS"],
  "operations": ["Create User", "Delete User", "Update Role"]
}
```

## 6. Technical Implementation Details

### 6.1 AOP-based Snapshotting (`LogAspect.java`)
The system uses Spring AOP to intercept controller methods annotated with `@Log`.

**Execution Flow**:
1. **`@Before`**: Capture a snapshot of the record *before* modification (Update/Delete).
    - The aspect automatically identifies the `id` parameter and locates the corresponding service to fetch the current record state from the database.
2. **`@AfterReturning`**: 
    - For **Update**, compare the pre-captured snapshot with the result returned by the controller.
    - For **Create**, extract monitored fields directly from the response object.
    - For **Delete**, convert the pre-captured snapshot into a "record of deletion".
3. **Asynchronous Persistence**: The log is saved via `SysAuditLogService.saveLog` using the `@Async` annotation to ensure zero impact on API latency.

### 6.2 Metadata-Driven Comparison (`AuditDiffUtil.java`)
To maintain separation of concerns, the audit logic uses **Entity classes** as metadata templates, even when auditing **DTO objects**.

- **`@LogField`**: Applied to Entity fields to define audit labels (e.g., `label = "Staff Name"`) and nested field extraction (e.g., `subField = "roleName"`).
- **Field Extraction**: The utility extracts data from DTOs by matching field names defined in the Entity.
- **Alias Handling**: Support for common naming patterns (e.g., `staffName` vs `name`) and auto-stripping "Id" suffix for reference lookups.
- **Complex Types**: Collections and nested objects are automatically formatted into readable strings (e.g., `[Admin, Staff]`).

### 6.3 Standardized Diff Resolution
The logic ensures consistent behavior across all operation types:

| Operation | `oldValue` (JSON) | `changedValue` (Diff Array) |
|-----------|------------------|-----------------------------|
| **Create** | `null` | All fields: `old: N/A, new: Value` |
| **Update** | Full snapshot | Only changed fields: `old: Val1, new: Val2` |
| **Delete** | Full snapshot | All fields: `old: Value, new: N/A` |
