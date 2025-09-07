# Implementation Document

## 1. Approach

- Extended the Prisma schema to include two new models: **`ProductTrend`** and **`VisitorLog`**.
- Implemented new API routes using the **Next.js App Router** under `app/api/dashboard/...`.
- Used **Prisma with raw SQL queries (`$queryRawUnsafe`)** to handle date-range filtering and bucket-based grouping (`day`, `week`, `month`).
- Ensured API responses always include `startDate`, `endDate`, `bucket`, and grouped `data`.
- Applied default values for `startDate`, `endDate`, and `bucket` when not provided.
- Added basic error handling (`try/catch`) to return proper error messages if a query fails.

## 2. Schema Changes

Two new models were added to `prisma/schema.prisma`:

### **ProductTrend**

Tracks product activity and trends over time.

- `id` → Primary key (UUID)
- `productId` → Foreign key reference to `Product`
- `trendDate` → Date when the trend was recorded
- `totalCount` → Number of times the product was counted in that bucket
- `createdAt` → Timestamp of record creation

### **VisitorLog**

Tracks site visitor activity for analytics.

- `id` → Primary key (UUID)
- `visitorIp` → IP address of the visitor
- `visitedAt` → Timestamp when the visitor accessed the site

## 3. API Details

### **1. `/api/dashboard/products`**

Provides analytics on product trends.

**Query Parameters:**

- `startDate` _(optional, format: YYYY-MM-DD)_ → Start of date range
- `endDate` _(optional, format: YYYY-MM-DD)_ → End of date range
- `bucket` _(optional)_ → Grouping option (`day`, `week`, `month`)

**Defaults:**

- `startDate = 2025-01-01`
- `endDate = current date`
- `bucket = day`

**Sample Request:**

```
GET /api/dashboard/products?startDate=2025-09-01&endDate=2025-09-07&bucket=day
```

**Sample Response:**

```json
{
  "startDate": "2025-09-01",
  "endDate": "2025-09-07",
  "bucket": "day",
  "data": [
    { "bucket": "2025-09-01", "total": 8 },
    { "bucket": "2025-09-02", "total": 2 }
  ]
}
```

### **2. `/api/dashboard/visitors`**

Provides analytics on visitors.

**Query Parameters:**

- `startDate` _(optional, format: YYYY-MM-DD)_ → Start of date range
- `endDate` _(optional, format: YYYY-MM-DD)_ → End of date range
- `bucket` _(optional)_ → Grouping option (`day`, `week`, `month`)

**Defaults:**

- `startDate = 2025-01-01`
- `endDate = current date`
- `bucket = day`

**Sample Request:**

```
GET /api/dashboard/visitors?startDate=2025-09-01&endDate=2025-09-07&bucket=week
```

**Sample Response:**

```json
{
  "startDate": "2025-09-01",
  "endDate": "2025-09-07",
  "bucket": "week",
  "data": [{ "bucket": "2025-W36", "visitors": 12 }]
}
```

## 4. Optional Features

- Default values applied when query parameters are missing.
- Basic error handling added using `try/catch` to return `500` status with error details.
- Potential improvement: stricter validation for `bucket` (only `day`, `week`, `month` should be allowed).
