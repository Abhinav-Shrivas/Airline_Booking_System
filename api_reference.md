# Backend API Reference — getpyqjec

**Base URL**: `http://localhost:8000`  
**Auth**: JWT via `Authorization: Bearer <access_token>` header  
**Framework**: Django + DRF + SimpleJWT

---

## 1. `POST /auth/register/`

> **Auth**: None (public)

Registers a new user and returns JWT tokens.

### Request Body (JSON)

| Field      | Type   | Required | Validation                                                       |
|------------|--------|----------|------------------------------------------------------------------|
| `rno`      | string | ✅        | Must match `0201(CS|IT|AI|ME|CE|MT|IP|EE|EC)\d{6}` (e.g. `0201IT231046`) |
| `email`    | string | ✅        | Valid email, unique                                              |
| [name](file:///d:/PYQ/getpyqjec/core/models.py#44-46)     | string | ✅        | Max 100 chars                                                    |
| `password` | string | ✅        | Subject to Django password validators (min 8 chars, not too common, etc.) |

### Success Response — `201 Created`

```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>",
  "user": {
    "rno": "0201IT231046",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "contributor"
  }
}
```

---

## 2. `POST /auth/login/`

> **Auth**: None (public)  
> **View**: `TokenObtainPairView` (SimpleJWT built-in)

Authenticates a user and returns JWT tokens.

### Request Body (JSON)

| Field      | Type   | Required | Notes                          |
|------------|--------|----------|--------------------------------|
| `rno`      | string | ✅        | The `USERNAME_FIELD` is `rno`  |
| `password` | string | ✅        |                                |

### Success Response — `200 OK`

```json
{
  "refresh": "<refresh_token>",
  "access": "<access_token>"
}
```

---

## 3. `POST /auth/refresh/`

> **Auth**: None (public)  
> **View**: `TokenRefreshView` (SimpleJWT built-in)

Refreshes an expired access token.

### Request Body (JSON)

| Field     | Type   | Required | Notes              |
|-----------|--------|----------|--------------------|
| `refresh` | string | ✅        | A valid refresh token |

### Success Response — `200 OK`

```json
{
  "access": "<new_access_token>"
}
```

---

## 4. `POST /upload/`

> **Auth**: **Required** (`Bearer` token)

Uploads a PYQ PDF file.

### Request Body (`multipart/form-data`)

| Field          | Type   | Required | Validation / Notes                              |
|----------------|--------|----------|-------------------------------------------------|
| [branch](file:///d:/PYQ/getpyqjec/utils/storage.py#27-29)       | string | ✅        | Normalized to uppercase (e.g. `CS`, `IT`, `AI`) |
| `semester`     | string | ✅        | Must be parseable as an integer                 |
| `subject_code` | string | ✅        | e.g. `CS301`                                    |
| `year`         | string | ✅        | Must be parseable as an integer                 |
| `exam_session` | string | ✅        | Must be `"april"` or `"december"` (case-insensitive) |
| [file](file:///d:/PYQ/getpyqjec/utils/storage.py#44-48)         | file   | ✅        | PDF only, max **10 MB**                          |

### Success Response — `201 Created`

```json
{
  "success": true,
  "path": "data/files/CS/sem3/CS301/2024_April.pdf"
}
```

### Error Responses

| Status | Condition                                       |
|--------|-------------------------------------------------|
| `400`  | Missing fields, non-PDF file, size > 10 MB, invalid session/year |
| `401`  | Missing or invalid JWT token                    |
| `409`  | PYQ already exists for that subject/year/session |
| `500`  | File write failure                              |

---

## 5. `GET /download/`

> **Auth**: None (public)

Downloads a merged PDF of PYQs matching the given filters.

### Query Parameters

| Param          | Type   | Required | Notes                                             |
|----------------|--------|----------|---------------------------------------------------|
| [branch](file:///d:/PYQ/getpyqjec/utils/storage.py#27-29)       | string | ✅        | e.g. `CS` (auto-uppercased)                       |
| `semester`     | string | ✅        | Integer as string                                 |
| `subject_code` | string | ❌        | Defaults to `"all"` — fetches all subjects        |
| `from_year`    | string | ✅        | Integer as string                                 |
| `to_year`      | string | ✅        | Integer as string                                 |

### Success Response — `200 OK`

Returns a **PDF file download** (`application/pdf`) with filename:  
`{branch}_sem{semester}_{subject_code}_{from_year}-{to_year}.pdf`

### Error Responses

| Status | Condition                                          |
|--------|----------------------------------------------------|
| `400`  | Missing required params, or non-integer year/semester |
| `404`  | No PYQs found for the given filters               |

---

## 6. `GET /*` (Catch-all)

> **Auth**: None

Any route not matched by the above patterns serves the React frontend's `index.html` (for client-side routing).

---

## JWT Configuration

| Setting                  | Value       |
|--------------------------|-------------|
| Access token lifetime    | 60 minutes  |
| Refresh token lifetime   | 1 day       |
| Auth header type         | `Bearer`    |
