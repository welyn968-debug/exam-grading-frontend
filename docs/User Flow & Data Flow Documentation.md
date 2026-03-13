# User Flow & Data Flow Documentation

## User Flow Diagrams

### 1. Lecturer Onboarding Flow

```
START → Registration
  ↓
Enter credentials (name, email, password, institution)
  ↓
Email verification
  ↓
Login with credentials
  ↓
Dashboard (empty state)
  ↓
"Create First Exam" prompt
  ↓
END
```

---

### 2. Exam Creation & Setup Flow

```
Dashboard → Click "New Exam"
  ↓
Fill Exam Details Form
  ├─ Course name
  ├─ Exam title
  ├─ Total marks
  └─ Number of questions
  ↓
Upload Answer Script
  ├─ Option A: Upload PDF (typed) → Preview & Confirm
  └─ Option B: Upload scanned handwritten → OCR Processing
       ↓
       Review OCR Output → Edit if needed → Confirm
  ↓
Build Rubric for Each Question
  ├─ Question number (Q1, Q1a, etc)
  ├─ Total marks for question
  ├─ Scoring criteria (checkboxes):
  │   ├─ Criterion 1 (X marks)
  │   ├─ Criterion 2 (Y marks)
  │   └─ Criterion 3 (Z marks)
  └─ Save Question Rubric
  ↓
Repeat for all questions
  ↓
Review Complete Exam Setup
  ↓
Proceed to Testing Phase / Save as Draft
  ↓
END
```

---

### 3. Testing & Validation Flow

```
Exam Setup Complete → Testing Phase
  ↓
Upload Sample Student Papers (5-10 papers)
  ├─ ZIP file with naming: StudentID_Page1.jpg
  └─ Or individual uploads
  ↓
System Processing:
  ├─ Extract files
  ├─ Run OCR on all pages
  ├─ Segment questions
  └─ Grade using AI
  ↓
Progress Indicators:
  ├─ OCR: 3/10 complete
  ├─ Grading: 1/10 complete
  └─ Real-time WebSocket updates
  ↓
Test Results Dashboard
  ├─ List of sample students
  ├─ AI scores vs. Expected scores (if provided)
  └─ Confidence indicators
  ↓
Review Each Sample Answer:
  ├─ Original scan image
  ├─ OCR extracted text
  ├─ AI score + reasoning
  ├─ Confidence score
  └─ "Does this look correct?" Y/N
  ↓
Decision Point:
  ├─ Satisfied with accuracy?
  │   ├─ YES → Approve for Full Grading
  │   └─ NO → Refine Configuration
  │            ├─ Adjust rubric
  │            ├─ Clarify answer script
  │            ├─ Add examples to criteria
  │            └─ Re-run test
  ↓
Mark Exam as "Ready for Grading"
  ↓
END
```

---

### 4. Bulk Grading Flow

```
Exam Ready → Click "Grade Exam"
  ↓
Upload All Student Papers
  ├─ ZIP file (100+ students)
  ├─ Naming convention enforced
  └─ Upload progress bar
  ↓
System Validation:
  ├─ Check file naming
  ├─ Verify student IDs exist
  ├─ Validate file types/sizes
  └─ Alert if issues found
  ↓
Background Processing (Celery Tasks):
  ├─ Extract ZIP
  ├─ Organize by student
  ├─ For each student:
  │   ├─ OCR all pages
  │   ├─ Calculate OCR confidence
  │   ├─ Segment into questions
  │   └─ WebSocket: "OCR complete for Student X"
  │        OR "OCR failed for Student Y - manual review needed"
  ↓
Grading Phase (Async):
  ├─ For each question per student:
  │   ├─ Send to LLM: answer script + student answer + rubric
  │   ├─ Receive: score, reasoning, confidence
  │   ├─ Store in database
  │   └─ If confidence < 70% → Add to Review Queue
  ├─ WebSocket: Progress updates
  └─ WebSocket: "Grading complete - 85 auto-approved, 15 need review"
  ↓
Grading Complete Notification
  ↓
Redirect to Review Interface
  ↓
END
```

---

### 5. Review & Override Flow

```
Grading Complete → Review Dashboard
  ↓
View Options:
  ├─ All Students (table view)
  ├─ Review Queue Only (flagged answers)
  ├─ By Question (Q1 across all students)
  └─ By Student (all questions for one student)
  ↓
Select Answer to Review:
  ↓
Review Interface Layout:
  ├─ LEFT PANEL:
  │   ├─ Original scanned image (zoomable)
  │   └─ OCR extracted text (with edits allowed)
  ├─ CENTER PANEL:
  │   ├─ Answer script reference
  │   ├─ Rubric checklist
  │   └─ AI suggested score + reasoning
  ├─ RIGHT PANEL:
  │   ├─ Confidence indicator (color: red/yellow/green)
  │   ├─ Score override input
  │   ├─ Comment field (optional)
  │   └─ Action buttons: Approve / Override / Flag for Later
  ↓
Lecturer Decision:
  ├─ Approve AI Score → Mark as reviewed → Next answer
  ├─ Override Score → Enter new score → Save → Next answer
  └─ Flag for Later → Add to personal review list → Next answer
  ↓
Bulk Actions Available:
  ├─ "Approve all high-confidence (>85%) answers"
  ├─ "Approve all for Q1" (if confident in AI)
  └─ "Export current review state"
  ↓
Review Progress Tracker:
  ├─ 85 approved
  ├─ 10 overridden
  ├─ 5 pending review
  └─ 100% complete
  ↓
Finalize Grades → Lock exam
  ↓
END
```

---

### 6. Results & Export Flow

```
Exam Reviewed → Results Dashboard
  ↓
View Options:
  ├─ Per Student Results
  │   ├─ Student name/ID
  │   ├─ Total score
  │   ├─ Grade breakdown by question
  │   └─ Comments (if any)
  ├─ Per Question Analytics
  │   ├─ Average score
  │   ├─ Highest/Lowest
  │   ├─ Pass rate
  │   └─ Common wrong answers
  └─ Cohort Performance
      ├─ Grade distribution chart
      ├─ Difficulty index per question
      └─ Comparison to previous years
  ↓
Export Options:
  ├─ CSV (all grades) → Download
  ├─ PDF Report (formatted) → Download
  ├─ Individual PDFs (per student) → Bulk download
  └─ JSON (for LMS integration) → Copy/Download
  ↓
Optional: Integration
  ├─ Push to Canvas/Moodle (future)
  └─ Email results to students (future)
  ↓
Archive Exam
  ↓
END
```

---

## Data Flow Architecture

### High-Level Data Flow

```
┌──────────────┐
│   LECTURER   │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. Upload Answer Script + Rubric
       ↓
┌──────────────────┐
│   FLASK API      │
│   /api/exams     │
└──────┬───────────┘
       │
       │ 2. Store in Database
       ↓
┌──────────────────┐
│   PostgreSQL     │
│   exams table    │
└──────────────────┘

       │ 3. Upload Student Papers (ZIP)
       ↓
┌──────────────────┐
│   FLASK API      │
│  /api/submissions│
└──────┬───────────┘
       │
       │ 4. Trigger Inngest Event
       ↓
┌──────────────────┐
│  INNGEST         │
│  process_ocr     │
└──────┬───────────┘
       │
       │ 5. Process Images
       ↓
┌──────────────────┐
│  PaddleOCR       │
│  Engine          │
└──────┬───────────┘
       │
       │ 6. OCR Text + Confidence
       ↓
┌──────────────────┐
│  PostgreSQL      │
│  submissions     │
└──────────────────┘
       │
       │ 7. WebSocket notification
       ↓
┌──────────────────┐
│  FRONTEND        │
│  Real-time update│
└──────────────────┘

       │ 8. Trigger Inngest Event
       ↓
┌──────────────────┐
│  INNGEST         │
│  grade_submission│
└──────┬───────────┘
       │
       │ 9. Send to LLM
       ↓
┌──────────────────┐
│  DeepSeek API    │
│  GPT Evaluation  │
└──────┬───────────┘
       │
       │ 10. Score + Reasoning + Confidence
       ↓
┌──────────────────┐
│  PostgreSQL      │
│  grades table    │
└──────┬───────────┘
       │
       │ 11. If confidence < 70%
       ↓
┌──────────────────┐
│  PostgreSQL      │
│  review_queue    │
└──────┬───────────┘
       │
       │ 12. WebSocket: Grading complete
       ↓
┌──────────────────┐
│  FRONTEND        │
│  Review Interface│
└──────────────────┘

       │ 13. Lecturer reviews/overrides
       ↓
┌──────────────────┐
│  FLASK API       │
│  /api/grades/:id │
└──────┬───────────┘
       │
       │ 14. Update final_score
       ↓
┌──────────────────┐
│  PostgreSQL      │
│  grades table    │
└──────┬───────────┘

       │ 15. Generate analytics
       ↓
┌──────────────────┐
│  FLASK API       │
│  /api/analytics  │
└──────┬───────────┘
       │
       │ 16. Fetch results
       ↓
┌──────────────────┐
│  FRONTEND        │
│  Results Dashboard│
└──────────────────┘
```

---

## Detailed API Data Flow

### 1. Create Exam Endpoint

**Request:**
```http
POST /api/exams
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "course_name": "ECON 101",
  "exam_title": "Midterm 2024",
  "total_marks": 100,
  "questions": [
    {
      "number": "Q1",
      "marks": 20,
      "criteria": [
        {"description": "Defines supply", "marks": 5},
        {"description": "Defines demand", "marks": 5},
        {"description": "Explains equilibrium", "marks": 10}
      ]
    }
  ],
  "answer_script": <file>
}
```

**Response:**
```json
{
  "exam_id": "uuid-123",
  "status": "created",
  "ocr_needed": true,
  "ocr_job_id": "job-456"
}
```

**Backend Flow:**
1. Validate lecturer authentication
2. Parse exam data
3. Store exam metadata in `exams` table
4. Upload answer script to MinIO/filesystem
5. If handwritten: Trigger OCR Celery task
6. Return exam ID

---

### 2. Upload Submissions Endpoint

**Request:**
```http
POST /api/exams/{exam_id}/submissions
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "submissions_zip": <file>
}
```

**Response:**
```json
{
  "job_id": "job-789",
  "status": "processing",
  "total_files": 250,
  "websocket_channel": "exam-123-progress"
}
```

**Backend Flow:**
1. Validate exam exists and lecturer owns it
2. Save ZIP to temporary storage
3. Send Inngest event: `exam/submissions.uploaded`
4. Return job ID for tracking
5. Inngest function handles async processing:
   - Extract ZIP
   - Validate file naming
   - For each student:
     - Run OCR on all pages
     - Calculate OCR confidence
     - Store in `submissions` table
     - Emit WebSocket event: `{"student_id": "X", "status": "ocr_complete"}`
   - Send Inngest event: `exam/ocr.completed` which triggers grading

---

### 3. Grading Task Data Flow

**Inngest Function: `exam/grade.submission`**

```python
from inngest import Inngest

inngest = Inngest(app_id="ai-exam-grading")

@inngest.create_function(
    fn_id="grade-submission",
    trigger=inngest.event("exam/grade.submission")
)
async def grade_submission(ctx, step):
    event_data = ctx.event.data
    submission_id = event_data["submission_id"]
    exam_id = event_data["exam_id"]
    
    # Step 1: Fetch submission OCR text
    submission = await step.run(
        "fetch-submission",
        lambda: Submission.query.get(submission_id)
    )
    
    # Step 2: Fetch exam answer script + rubric
    exam = await step.run(
        "fetch-exam",
        lambda: Exam.query.get(exam_id)
    )
    
    # Step 3: Segment OCR text into questions
    segmented = await step.run(
        "segment-answers",
        lambda: segmentation_service.segment(submission.ocr_text)
    )
    
    # Step 4: Grade each question
    for question_num, answer_text in segmented.items():
        # Step 5: Prepare LLM prompt
        prompt = f"""
        QUESTION: {exam.rubric[question_num]['text']}
        ANSWER SCRIPT: {exam.answer_script[question_num]}
        RUBRIC: {exam.rubric[question_num]['criteria']}
        STUDENT ANSWER: {answer_text}
        
        Grade this answer and return JSON:
        {{"score": X, "reasoning": "...", "confidence": 0-100}}
        """
        
        # Step 6: Call DeepSeek API with retry
        response = await step.run(
            f"grade-question-{question_num}",
            lambda: llm_client.complete(prompt),
            retries=3
        )
        
        # Step 7: Parse response
        result = json.loads(response)
        
        # Step 8: Calculate combined confidence
        combined_confidence = await step.run(
            f"calculate-confidence-{question_num}",
            lambda: calculate_confidence(
                ocr_quality=submission.ocr_confidence,
                llm_confidence=result['confidence']
            )
        )
        
        # Step 9: Store grade
        grade = await step.run(
            f"save-grade-{question_num}",
            lambda: save_grade(
                submission_id=submission_id,
                question_num=question_num,
                ai_score=result['score'],
                ai_reasoning=result['reasoning'],
                confidence_score=combined_confidence,
                needs_review=(combined_confidence < 70)
            )
        )
        
        # Step 10: If needs review, send event
        if combined_confidence < 70:
            await step.send_event(
                "exam/review.required",
                {"grade_id": grade.id, "reason": "low_confidence"}
            )
    
    # Step 11: Emit WebSocket notification
    await step.run(
        "notify-completion",
        lambda: socketio.emit('grading_complete', {
            'submission_id': submission_id,
            'student_id': submission.student_id
        })
    )
    
    return {"status": "completed", "submission_id": submission_id}
```

---

### 4. Review & Override Data Flow

**Request:**
```http
PATCH /api/grades/{grade_id}
Authorization: Bearer <jwt_token>

{
  "final_score": 18,
  "override_reason": "Student showed work but minor calculation error",
  "reviewed_by": "lecturer-uuid"
}
```

**Response:**
```json
{
  "grade_id": "grade-uuid",
  "final_score": 18,
  "status": "reviewed"
}
```

**Backend Flow:**
1. Validate lecturer owns this exam
2. Update `grades` table:
   - Set `final_score = 18`
   - Set `reviewed_by = lecturer_id`
   - Set `reviewed_at = NOW()`
3. Remove from `review_queue` if present
4. Recalculate student total score
5. Return updated grade

---

### 5. Analytics Data Flow

**Request:**
```http
GET /api/exams/{exam_id}/analytics
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "per_question": [
    {
      "question_num": "Q1",
      "average_score": 16.5,
      "max_score": 20,
      "pass_rate": 0.85,
      "common_answers": [
        {"answer": "Supply and demand curves...", "frequency": 45},
        {"answer": "Equilibrium price...", "frequency": 32}
      ]
    }
  ],
  "grade_distribution": {
    "A": 15,
    "B": 35,
    "C": 30,
    "D": 15,
    "F": 5
  },
  "total_students": 100,
  "average_total": 72.3
}
```

**Backend Flow:**
1. Query all grades for exam
2. Group by question
3. Calculate statistics (average, min, max, std dev)
4. Identify common answer patterns using similarity clustering
5. Generate grade distribution
6. Cache results for 5 minutes
7. Return analytics object

---

## WebSocket Event Flow

### Real-Time Updates

**Events Emitted by Backend:**

1. **`ocr_started`**
   ```json
   {
     "exam_id": "uuid",
     "total_submissions": 100
   }
   ```

2. **`ocr_progress`**
   ```json
   {
     "exam_id": "uuid",
     "completed": 25,
     "total": 100,
     "current_student": "2021-CS-045"
   }
   ```

3. **`ocr_failed`**
   ```json
   {
     "exam_id": "uuid",
     "student_id": "2021-CS-012",
     "page": 3,
     "reason": "Low confidence (45%)",
     "requires_manual": true
   }
   ```

4. **`grading_progress`**
   ```json
   {
     "exam_id": "uuid",
     "completed": 50,
     "total": 100
   }
   ```

5. **`grading_complete`**
   ```json
   {
     "exam_id": "uuid",
     "auto_approved": 85,
     "needs_review": 15,
     "total": 100
   }
   ```

**Frontend Handling:**
```typescript
// In useWebSocket.ts hook
socket.on('ocr_progress', (data) => {
  updateProgressBar(data.completed, data.total);
  showToast(`OCR: ${data.current_student} complete`);
});

socket.on('ocr_failed', (data) => {
  showAlert(`Manual review needed for ${data.student_id}`, 'warning');
  addToReviewQueue(data);
});
```

---

## File Storage Flow

### Storage Structure

```
/uploads/
  ├── exams/
  │   └── {exam_id}/
  │       ├── answer_script.pdf
  │       ├── answer_script_ocr.json
  │       └── rubric.json
  ├── submissions/
  │   └── {exam_id}/
  │       └── {student_id}/
  │           ├── page_1.jpg
  │           ├── page_2.jpg
  │           └── ocr_output.json
  └── results/
      └── {exam_id}/
          ├── grades.csv
          ├── analytics.json
          └── report.pdf
```

### File Access Flow

1. **Upload**: Client → Flask → MinIO/Filesystem
2. **Processing**: Celery reads from storage
3. **Serving**: Flask generates presigned URLs (if MinIO) or streams files
4. **Cleanup**: Cron job deletes files older than retention period (90 days)