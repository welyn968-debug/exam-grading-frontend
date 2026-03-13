**API Design Documentation**  
**ExamGrader KE – AI Exam Grading System**  

**Version:** 2.0 (Final for MVP)  
**Date:** 25 February 2026  
**Backend:** Flask 3.0 (Python) + PostgreSQL + Inngest  
**Frontend:** Next.js 16  
**Authentication:** JWT Bearer Token  
**API Base URL (Production):** `https://api.examgraderke.com/api/v2`  
**Development:** `http://localhost:5000/api/v2`  

---

### 1. Overview

This document defines the complete REST + WebSocket API for the frontend to interact with the backend. All endpoints follow RESTful conventions and are designed for a lecturer-first workflow with department oversight.

**Key Design Principles**
- JWT-based stateless authentication
- All protected routes require `Authorization: Bearer <token>`
- Consistent JSON responses
- Event-driven background processing via Inngest (frontend receives updates via WebSocket)
- Full support for Kenyan academic structures (course_code, semester, compulsory/elective)
- Built-in fairness & AI health endpoints

---

### 2. Authentication & Authorization

**JWT Tokens**
- Access token: 24 hours
- Refresh token: 30 days
- Algorithm: HS256
- Claims: `sub` (user_id), `role` (`lecturer` | `admin` | `ta`), `institution`

**Endpoints**

| Method | Endpoint                  | Description                     | Public |
|--------|---------------------------|---------------------------------|--------|
| POST   | `/auth/register`          | Create new lecturer account     | Yes    |
| POST   | `/auth/login`             | Login & receive tokens          | Yes    |
| POST   | `/auth/refresh`           | Refresh access token            | Yes    |
| POST   | `/auth/logout`            | Invalidate current session      | No     |
| GET    | `/auth/me`                | Current user profile            | No     |

**Request Example – Login**
```json
{
  "email": "dr.mwangi@uonbi.ac.ke",
  "password": "SecurePass123!"
}
```

**Response (200)**
```json
{
  "access_token": "eyJhbGciOi...",
  "refresh_token": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "name": "Dr. Jane Mwangi",
    "role": "lecturer",
    "institution": "University of Nairobi"
  }
}
```

---

### 3. Core Resources

#### 3.1 Exams

| Method | Endpoint                          | Description                              | Auth |
|--------|-----------------------------------|------------------------------------------|------|
| GET    | `/exams`                          | List all exams (paginated)               | Yes  |
| POST   | `/exams`                          | Create new exam                          | Yes  |
| GET    | `/exams/{exam_id}`                | Get exam details                         | Yes  |
| PATCH  | `/exams/{exam_id}`                | Update exam (only if draft)              | Yes  |
| DELETE | `/exams/{exam_id}`                | Delete draft exam                        | Yes  |

**Create Exam Request (multipart/form-data)**
- `course_code`, `semester`, `total_marks`
- `answer_script` (file)
- `rubric` (JSON string)
- `compulsory_questions` (JSON array)
- `elective_questions` (JSON array)
- `elective_count` (integer)

#### 3.2 Submissions & Upload

| Method | Endpoint                                   | Description                              | Auth |
|--------|--------------------------------------------|------------------------------------------|------|
| POST   | `/exams/{exam_id}/submissions/upload`      | Upload ZIP of scanned scripts            | Yes  |
| GET    | `/exams/{exam_id}/submissions`             | List submissions                         | Yes  |
| GET    | `/exams/{exam_id}/submissions/{sub_id}`    | Get single submission + OCR text         | Yes  |

#### 3.3 Grades & Review

| Method | Endpoint                                   | Description                              | Auth |
|--------|--------------------------------------------|------------------------------------------|------|
| GET    | `/exams/{exam_id}/grades`                  | All grades with filters                  | Yes  |
| GET    | `/grades/{grade_id}`                       | Detailed grade view (scan + reasoning)   | Yes  |
| PATCH  | `/grades/{grade_id}`                       | Approve or override grade                | Yes  |
| POST   | `/exams/{exam_id}/grades/bulk-approve`     | Bulk approve high-confidence             | Yes  |

**Filter examples:**
- `?needs_review=true`
- `?confidence_gt=85`

#### 3.4 Analytics & Exports

| Method | Endpoint                                   | Description                              | Auth |
|--------|--------------------------------------------|------------------------------------------|------|
| GET    | `/exams/{exam_id}/analytics`               | Full analytics (per-question, distribution) | Yes |
| GET    | `/exams/{exam_id}/export`                  | Export CSV or PDF                        | Yes  |

#### 3.5 AI Fairness & Health (NEW)

| Method | Endpoint                                   | Description                              | Auth |
|--------|--------------------------------------------|------------------------------------------|------|
| GET    | `/exams/{exam_id}/fairness-report`         | Bias & fairness metrics                  | Yes  |
| GET    | `/department/ai-health`                    | Department-wide AI Health Dashboard data | Yes (admin) |
| GET    | `/ai-health/overrides`                     | Recent overrides used for few-shot       | Yes  |

---

### 4. WebSocket Events (Real-time)

**Endpoint:** `wss://api.examgraderke.com/socket.io/` (namespace `/exams`)

**Authentication:** JWT in handshake

**Events (Server → Client)**

| Event                     | Payload Example                              | Purpose |
|---------------------------|----------------------------------------------|---------|
| `ocr_progress`            | `{exam_id, completed, total, current_reg}`   | OCR progress |
| `grading_progress`        | `{exam_id, completed, total}`                | Grading progress |
| `review_ready`            | `{exam_id, auto_approved, needs_review}`     | Processing complete |
| `notification`            | `{type: "success", message}`                 | General alerts |

---

### 5. Data Models (Key Schemas)

**Exam Object**
```json
{
  "id": "uuid",
  "course_code": "BIT 114",
  "semester": "1st Semester 2026",
  "total_marks": 100,
  "compulsory_questions": ["Q1","Q2","Q3"],
  "elective_questions": ["Q4","Q5","Q6"],
  "elective_count": 2,
  "status": "ready",
  "submission_count": 124
}
```

**Grade Object**
```json
{
  "id": "uuid",
  "registration_number": "2021-BIT-045",
  "question_num": "Q1",
  "question_type": "compulsory",
  "ai_score": 18,
  "final_score": 19,
  "confidence_score": 87,
  "needs_review": false,
  "ai_reasoning": "..."
}
```

---

### 6. Error Handling

All errors follow this structure:

```json
{
  "error": "ValidationError",
  "message": "Missing compulsory_questions",
  "details": { ... },
  "code": "MISSING_FIELD"
}
```

**Common Status Codes**
- 200/201/202 – Success
- 400 – Bad Request
- 401 – Unauthorized
- 403 – Forbidden
- 404 – Not Found
- 429 – Rate Limited
- 500 – Server Error

---

### 7. Rate Limiting & Security

- 100 requests/minute per user (configurable)
- All file uploads limited to 500 MB
- DeepSeek API calls are rate-limited internally via Inngest
- Full KDPA compliance: no raw student data in logs

---

### 8. Complete Endpoint Reference (Most Used)

**Lecturer Workflow (Typical Sequence)**

1. `POST /auth/login`
2. `POST /exams` → create exam
3. `POST /exams/{id}/submissions/upload`
4. WebSocket `review_ready`
5. `GET /exams/{id}/grades?needs_review=true`
6. `PATCH /grades/{grade_id}` (overrides)
7. `POST /exams/{id}/grades/bulk-approve`
8. `GET /exams/{id}/export?format=csv`

**Department Head**

9. `GET /department/ai-health`
10. `GET /exams/{id}/fairness-report`

---

### 9. OpenAPI / Swagger

The backend will expose full OpenAPI 3.1 spec at `/api/docs` (via Flask-OpenAPI or Spectacular).

---

**This API Design Document is complete and ready for frontend implementation.**

Frontend team can now start building all screens with exact request/response shapes.

Would you like me to:
1. Generate the **full OpenAPI YAML/JSON file**?
2. Create **Postman collection** (JSON export)?
3. Add **TypeScript types** for all responses?
4. Write **example Axios service layer** for Next.js?

Just tell me the next deliverable and I’ll generate it immediately.