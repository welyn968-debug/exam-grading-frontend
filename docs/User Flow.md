```mermaid
flowchart TD
    A[Start: User Opens ExamGrader KE] --> B[Login / Register]
    B --> C{User Role?}
    C -->|Lecturer| D[Lecturer Dashboard]
    C -->|Department Head| E[Department Overview Dashboard]
    
    D --> F{Choose Action?}
    F -->|Create New Exam| G[Exam Creation Wizard]
    F -->|View My Exams| H[My Exams List]
    F -->|Analytics| I[Lecturer Analytics]
    
    E --> J{Department Actions}
    J -->|View All Exams| K[Department Exams Table]
    J -->|View Lecturers| L[Lecturer Progress Grid]
    J -->|Analytics & Reports| M[Department Analytics]
    
    G --> N[Upload Scanned Scripts ZIP]
    N --> O[Background Processing Pipeline]
    O --> P[Review Dashboard]
    P --> Q[Export Results CSV/PDF]
    Q --> R[End: Grades Submitted]
    
    style A fill:#008751,stroke:#fff,color:#fff
    style R fill:#008751,stroke:#fff,color:#fff
```

### 1. High-Level System User Flow (Overview)

The diagram above shows the complete entry points and main paths for both primary users.

---

```mermaid
flowchart TD
    A[Lecturer Login] --> B[Dashboard]
    B --> C[Create New Exam]
    C --> D[4-Step Wizard]
    D --> E[Upload Answer Script & Rubric]
    E --> F[Save as Ready]
    F --> G[Upload Student ZIP Scripts]
    G --> H[Processing Pipeline]
    H --> I[Review Dashboard]
    I --> J{Bulk Approve?}
    J -->|Yes| K[Export Final Grades]
    J -->|No| L[Open Detail Modal]
    L --> M[Approve / Override]
    M --> I
    K --> N[Logout / Return to Dashboard]
```

### 2. Lecturer End-to-End Workflow (Most Common Path)

This is the **core daily flow** a lecturer follows during exam season.

**Step-by-step narrative:**
1. Logs in → sees Dashboard with pending reviews highlighted.
2. Clicks **New Exam** → completes 4-step wizard (Basic Info → Answer Script → Rubric → Question Rules).
3. Uploads batch of scanned student papers (ZIP).
4. Watches real-time Processing Dashboard (OCR → Segmentation → LLM Grading).
5. Goes to **Review Dashboard** → uses smart queue + bulk approve high-confidence grades.
6. Reviews only low-confidence items in modal (side-by-side scan + OCR + AI reasoning).
7. Exports CSV (or PDF) → submits to university system.

---

```mermaid
flowchart LR
    A[Step 1: Basic Info] --> B[Step 2: Upload Answer Script]
    B --> C[Step 3: Rubric Builder]
    C --> D[Step 4: Compulsory / Elective Rules]
    D --> E[Validation Check]
    E -->|Pass| F[Save & Mark as Ready]
    E -->|Fail| C
```

### 3. Exam Creation Wizard Flow (Detailed)

**4-Step Guided Wizard** (takes ~10–15 minutes for first-time users):

- **Step 1**: Course code, semester, total marks.
- **Step 2**: Upload model answer script (PDF/image).
- **Step 3**: Dynamic rubric builder (add criteria + marks per question).
- **Step 4**: Mark compulsory questions + elective rules.
- Final validation before the exam becomes “Ready for Upload”.

---

```mermaid
sequenceDiagram
    participant L as Lecturer
    participant S as System
    participant I as Inngest Workers
    participant AI as DeepSeek LLM

    L->>S: Upload ZIP (max 500MB)
    S->>S: Extract & Validate filenames
    S->>I: Queue OCR Jobs
    I->>S: OCR Complete + RegNo Detected
    S->>S: Manual Correction Queue (if low conf)
    S->>I: Queue Segmentation & Grading
    I->>AI: Send Rubric + Student Answer
    AI->>I: Return Score + Reasoning + Confidence
    I->>S: Store Grade + Flag for Review
    S->>L: WebSocket Progress Update
    S->>L: Review Dashboard Ready
```

### 4. Core Processing & Review Flow (Technical + User View)

This is the **heart of the system** — fully automated until review.

**Key Automatic Steps:**
1. ZIP upload → file extraction
2. Image preprocessing + PaddleOCR
3. Registration number detection
4. Question segmentation & validation
5. LLM grading with confidence scoring
6. Smart review queue generation
7. Real-time WebSocket notifications

---

```mermaid
flowchart TD
    A[Department Head Login] --> B[Department Dashboard]
    B --> C[Overview Cards]
    C --> D[Lecturer Progress Grid]
    D --> E[Click Lecturer Card]
    E --> F[Lecturer's Exams List]
    F --> G[View Detailed Report]
    G --> H[Department Analytics]
    H --> I[Export CUE Report PDF]
    B --> J[All Exams Table]
    J --> K[Filter by Semester/Lecturer]
```

### 5. Department Head Oversight Flow

Department Heads have **read-only elevated visibility** across their entire department.

**Typical flow:**
1. Login → Department Overview Dashboard.
2. See real-time stats: total students processed, auto-approval rate, time saved.
3. Browse Lecturer Progress Grid (cards showing each lecturer’s completion % and pending reviews).
4. Drill into any lecturer’s exams.
5. View aggregated Analytics & generate accreditation reports.
6. Send notifications to lecturers (“Please review low-confidence items”).

---

### Summary of All User Flows

| Flow | Primary User | Time to Complete | Key Screens |
|------|--------------|------------------|-------------|
| **Create & Grade Exam** | Lecturer | 20–40 min + processing time | Dashboard → Wizard → Upload → Processing → Review |
| **Quick Review Existing Exam** | Lecturer | 5–15 min | Dashboard → My Exams → Review |
| **Department Monitoring** | Dept Head | 5–10 min daily | Department Dashboard → Lecturer Grid |
| **Export & Submit** | Lecturer | 30 seconds | Review → Export CSV |

All flows are **mobile-responsive** (tablet-first for review modal) and designed for lecturers with varying technical skill levels.

