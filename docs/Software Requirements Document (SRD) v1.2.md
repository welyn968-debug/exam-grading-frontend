**Software Requirements Document (SRD)**  
**AI-Powered Examination Grading System for Kenyan Universities**  
**Product Name:** ExamGrader KE  

**Document Version:** 2.0 (Final Updated)  
**Date:** 25 February 2026  
**Prepared By:** Development Team (with ChatGPT-assisted drafting)  
**Status:** Approved for 10-week MVP Development  

---

### 1. Introduction & Purpose

**1.1 Purpose**  
This SRD specifies the complete requirements for ExamGrader KE — a web-based AI system that automates grading of handwritten university examination scripts using OCR and LLM technology, while keeping lecturers fully in control through confidence-based review and human-in-the-loop improvement.

**1.2 Scope**  
**In Scope (MVP):**  
- Secure lecturer authentication & role-based access  
- Guided exam creation wizard with rubric builder  
- Batch ZIP upload of scanned scripts  
- Robust OCR + registration-number detection (PaddleOCR)  
- Answer segmentation & compulsory/elective validation  
- DeepSeek LLM grading with confidence scoring  
- Intelligent review dashboard with bulk approval  
- Manual OCR correction queue  
- Real-time WebSocket progress  
- CSV export + full audit trail  
- Bias/fairness monitoring, adversarial testing, and human-in-the-loop fine-tuning  

**Out of Scope (MVP):**  
- Two-way LMS integration, mobile-native app, full diagram/equation OCR, self-hosted LLM, PDF branded reports.

**Target Benefits**  
- 60–80% reduction in grading time  
- Results in 2–3 days instead of 2 weeks  
- Operating cost ≤ USD 5 per 100 students  
- Full lecturer final authority maintained  

---

### 2. Executive Summary & MVP Scope (MoSCoW)

**2.1 Success Metrics (End of 10-week MVP)**  
- ≥75% grades auto-approved  
- Average review time ≤30 seconds per low-confidence script  
- Lecturer NPS ≥7/10 after first real exam  
- OCR + segmentation success ≥80% on real Kenyan scripts  

**2.2 MoSCoW Prioritization**

| Category | Features |
|----------|----------|
| **Must** | Auth, Exam wizard, ZIP upload, OCR pipeline with manual correction, Segmentation, LLM grading + confidence, Review dashboard + bulk approve, WebSocket progress, CSV export, Audit log, Bias/fairness reporting, Few-shot auto-improvement from overrides |
| **Should** | Testing phase (5–10 samples), Compulsory/elective validation, Smart queue sorting, “Apply to similar” button |
| **Could** | Multimodal vision-LLM fallback, Advanced analytics clustering, PDF reports, Templates |
| **Won’t** | Mobile app, Self-hosted LLM, Real-time collaboration |

**2.3 Development Constraints**  
- 1–2 developers, 10 weeks  
- Deployable on DigitalOcean/Railway VPS (4 vCPU / 8 GB)  
- Total cost target: ≤ USD 0.05 per student per exam

---

### 3. User Stories & High-Level Features

**Primary Users**  
- Lecturers (core)  
- Department Heads (oversight only)  

**Lecturer High-Level Stories**  
- As a lecturer I want to create an exam in <15 min so I can start grading immediately.  
- As a lecturer I want to upload one ZIP and watch real-time progress.  
- As a lecturer I want to bulk-approve high-confidence grades and only review the rest.  
- As a lecturer I want the system to learn from my overrides automatically.

**Department Head Stories**  
- As a Head of Department I want a single dashboard showing all lecturers’ progress.  
- As a Head I want bias/fairness reports for CUE accreditation.

---

### 4. Functional Requirements (User-Story Format)

**4.1 Authentication**  
As a lecturer I want secure login/register so only authorised users access the system.  
AC: JWT (24h/30d), bcrypt, role-based (Lecturer/Admin/TA), lockout after 5 attempts.

**4.2 Exam Creation Wizard**  
As a lecturer I want a 4-step guided wizard.  
Steps: Basic Info → Answer Script → Rubric Builder → Question Rules → Validation.

**4.3 Submission Upload**  
As a lecturer I want to drag-and-drop one ZIP (≤500 MB).

**4.4 Processing Pipeline**  
As the system I must: Preprocess → PaddleOCR → RegNo detection → (Manual correction if <70%) → Segmentation → LLM grading → Confidence calculation → Smart review queue.

**4.5 Review Dashboard**  
As a lecturer I want: Summary cards, smart queue sorted by confidence + outliers, bulk approve ≥85, detail modal with zoomable scan + editable OCR + AI reasoning.

**4.6 Export**  
As a lecturer I want one-click CSV export with per-question and total scores.

**4.7 Department Head Views**  
As a Head I want aggregated analytics, lecturer progress grid, and fairness reports.

---

### 5. Non-Functional, Performance & Security Requirements

**5.1 Performance**  
- UI load ≤2 s  
- 100-student exam processed in ≤30 min  
- 50 concurrent lecturers supported  

**5.2 Security & Compliance**  
- Full KDPA 2019 compliance + DPIA completed before production  
- TLS 1.3, JWT HS256, files outside web root  
- All student data anonymised in logs  
- Lecturer retains final authority (legal disclaimer shown)

**5.3 Usability**  
- SUS target ≥75  
- First exam setup ≤30 min for new users  
- Tablet-first review modal

---

### 6. Data Model & System Architecture

**Core Entities**  
User → Exam → Submission → Grade → ReviewQueue → llm_feedback (new for HITL)

**Architecture**  
Next.js 16 Frontend ↔ Flask REST + Socket.IO ↔ Inngest workers (OCR → Grading) ↔ PostgreSQL + MinIO  

**Robust Pipeline (MVP)**  
Upload → Preprocess (OpenCV) → PaddleOCR → RegNo → Manual correction queue → Segmentation → DeepSeek grading → Confidence (0.4×OCR + 0.6×LLM) → Review queue

**Technology Stack**  
Frontend: Next.js 16 + Tailwind + Zustand + Recharts  
Backend: Flask 3 + SQLAlchemy + Inngest + PaddleOCR + DeepSeek API  
Future fallback: Qwen2-VL (post-MVP)

---

### 7. External Interfaces & APIs

**DeepSeek API** – Structured grading prompts  
**Inngest** – Background orchestration with retries  
**WebSocket** – Real-time progress (`ocr_progress`, `grading_complete`, etc.)

Full OpenAPI spec in Appendix B.

---

### 8. UI/UX Guidelines

All screens follow consistent shadcn/ui + Tailwind design (Kenyan green #008751, UoN blue #2A68AF).  
Key screens (described in detail earlier):  
- Login  
- Lecturer Dashboard  
- Exam Wizard (Rubric step)  
- Bulk Upload  
- Processing Dashboard  
- Review Dashboard  
- Grade Detail Modal (3-column: scan | OCR+reasoning | actions)  

Department Head variant: Department Overview + Lecturer Grid + Fairness Report.

---

### 9. Risks, Mitigations & Assumptions

**Top Risks**  
1. OCR accuracy on real Kenyan scripts → Heavy preprocessing + manual correction queue  
2. LLM bias/inconsistency → Fairness testing + HITL few-shot improvement  
3. Lecturers reject system → Mandatory testing phase + transparent “AI assistance only” messaging  

**Key Assumptions**  
- Scripts scanned ≥300 DPI  
- Lecturers willing to do 5–10 min testing phase

---

### 10. AI Fairness, Robustness & Continuous Improvement (NEW SECTION)

**10.1 Bias & Fairness Testing**  
Protected attributes: gender (from name), university/campus, program type, language mix.  
Metrics (run after every 10 exams): Demographic Parity ≤5%, Equal Opportunity ≤8%.  
Automated report + dashboard alert.

**10.2 Adversarial Testing**  
50 synthetic attack cases (copied answers, off-topic, prompt injection, poor handwriting).  
Target: ≥95% flagged or correctly scored.  
Run before every release + random 5% of real exams.

**10.3 Human-in-the-Loop Fine-Tuning (Core Feature)**  
1. Every override logged to `llm_feedback` table.  
2. **MVP (Week 8):** Top 20 overrides automatically added as few-shot examples in next grading prompt (versioned).  
3. **Post-MVP:** Weekly DPO fine-tuning on DeepSeek or Llama-3.1.  
4. Active learning: similar answers (sentence-transformers) prioritised for review.

**10.4 AI Health Dashboard Tab** (for lecturers & heads)  
- Bias metrics chart  
- Adversarial pass rate  
- “Overrides this week: 47 → prompt improved by 9%”  
- Top misconceptions learned

---

### 11. Testing & Acceptance Criteria

**Test Strategy**  
- Unit: >80% coverage on OCR, segmentation, grading  
- Integration: Full pipeline with Inngest mocks  
- E2E: Cypress (upload → review → export)  
- Fairness & Adversarial: Dedicated test suite  

**Definition of Done**  
All Must items implemented, fairness report passing, pilot success metrics achieved.

---

### 12. Appendices

**A.** Sample Grading Prompt Template (with few-shot auto-update)  
**B.** Full REST API OpenAPI Specification  
**C.** DPIA Template & KDPA Compliance Checklist  
**D.** UI Wireframe References (7 lecturer + 5 department head screens)  
**E.** Cost Model & DeepSeek Pricing Calculator  
**F.** Traceability Matrix (User Story → FR → Test Case)  
**G.** Mermaid User Flow Diagrams (from previous response)

---

**Approval Page**

**Prepared by:** Development Team  
**Reviewed & Updated with Fairness/HITL Section:** 25 Feb 2026  
**Approved for Development:** ________________________ (University Representative)

**Next Action:** Sprint 1 kick-off – 27 February 2026

---
