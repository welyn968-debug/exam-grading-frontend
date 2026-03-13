**✅ Here is a complete, detailed textual description of ALL UI screens** in the AI Exam Grading System (ExamGrader KE), clearly split into the two roles you requested.

### Design System (applies to all screens)
- Modern minimalist **shadcn/ui + Tailwind CSS**  
- Primary color: Kenyan green **#008751**  
- Accent color: University of Nairobi blue **#2A68AF**  
- Clean light mode, Inter font, rounded-xl corners, soft shadows  
- Fully responsive (desktop-first, excellent on tablets for review)  
- Consistent top navbar + left sidebar navigation

---

### 1. Lecturer Role (Primary User – Dr. Jane Mwangi, etc.)

**1.1 Login / Register Screen**  
Centered white card on a subtle blurred background of University of Nairobi tower.  
Top-left: Logo “ExamGrader KE” with green leaf icon.  
Card title: “Welcome back, Lecturer”  
Fields: Email (pre-filled example), Password (toggle visibility), “Remember me” checkbox.  
Large green “Sign In” button.  
Links: “Forgot Password?” + “New lecturer? Create account”.  
Footer: “Secure • KDPA Compliant”.  
Register screen is identical layout with extra fields (Name, Institution).

**1.2 Main Lecturer Dashboard**  
Left sidebar: Dashboard (active), My Exams, Analytics, Settings.  
Top navbar: Logo, search bar, green “New Exam” button, user avatar (Dr. Jane Mwangi).  
Hero greeting: “Good morning, Dr. Mwangi”.  
Four stat cards:  
- Active Exams: 3  
- Pending Reviews: 47 (red dot)  
- Students Graded: 1,284  
- Time Saved: 18.5 hrs  
Below: “Recent Exams” table (Course, Semester, Status with green/yellow pills, Submissions, Actions).  
Floating green “Create New Exam” button bottom-right.

**1.3 Exam Creation Wizard – Step 3: Rubric Builder** (most important screen)  
Top progress stepper: 1 Basic Info • 2 Answer Script • **3 Rubric** • 4 Question Rules.  
Header shows current course “BIT 114 – Fundamentals of Computer”.  
Main area: Dynamic rubric form  
- Question Q1 (20 marks)  
- Four criteria rows (Description + Marks allocation) with delete icons  
- Green “+ Add Criterion” button  
Right sidebar: Live “Total Marks 98/100” calculator with visual progress bar.  
Bottom: Back, Next, Save Draft buttons.

**1.4 Bulk Upload Screen**  
Header: “Upload Scanned Scripts – BIT 114 Exam” + small Kenyan flag.  
Large dashed drag-and-drop zone: “Drop ZIP file here (max 500 MB)” or “Select files”.  
Right panel (after selection):  
- File name & size  
- Progress bar  
- Validation summary: “Valid: 118 students • Invalid: 6 (naming issues)”  
Green “Start Processing” button (disabled until valid).

**1.5 Real-time Processing Dashboard**  
Big central circular progress ring: “68% complete • 84 of 124 students processed”.  
Live feed table on left:  
“2021-BIT-045 → OCR complete (92%)”  
Stage indicators across top with green checkmarks: Upload ✓ → OCR in progress → Grading queued.  
Estimated time left: “7 minutes”.  
WebSocket status: “Live” (green dot).  
Cancel button.

**1.6 Review Dashboard (Smart Queue)**  
Top summary cards:  
- Total students: 124  
- Auto-approved: 92  
- Needs review: 32  
- Average score: 74.3  
Prominent green banner: “Bulk Approve 89 high-confidence grades”.  
Main table (sortable):  
Reg No | Question | AI Score | Confidence (color-coded bar + %) | Status | Quick Approve button.  
Filters on right: All / Needs Review / High Confidence.  
Search by registration number.

**1.7 Grade Detail Modal** (opens when clicking any row)  
Three-column layout (modal size ~90% of screen):  
**Left panel**: Zoomable scanned handwritten exam image (actual student writing visible, zoom controls 50%-200%).  
**Middle panel**:  
- Editable OCR text box  
- AI Reasoning box (full explanation)  
- Rubric checklist with green checkmarks.  
**Right panel**:  
- AI Score: 17/20  
- Confidence gauge (82% green)  
- Final Score editable field  
- Override Reason textarea  
Buttons:  
- Green “Approve”  
- “Override”  
- “Apply to Similar Answers” (smart button using embeddings)  
- Next / Previous student arrows.

---

### 2. Department Head / Dept Lecturer Role (Oversight – e.g. Head of Computer Science)

Department Heads have **read-only + aggregated views** (no grading themselves, but full visibility across all lecturers in their department). They share the same login but see an expanded sidebar and different default dashboard.

**2.1 Department Head Dashboard**  
Same navbar + green accent.  
Sidebar: Dashboard (now “Department Overview”), All Lecturers, All Exams, Analytics, Reports, Settings.  
Hero: “Department Overview – Computer Science, University of Nairobi”.  
Stat cards (department-wide):  
- Total Lecturers: 18  
- Active Exams: 27  
- Students Processed: 4,892  
- Average Time Saved: 21.4 hrs  
- Overall Auto-Approval Rate: 78%  

Two main sections:  
**A. Lecturer Progress Grid** – Cards for each lecturer (Dr. Mwangi, Dr. Omondi, etc.) showing their current exams, pending reviews, completion %.  
**B. Department Analytics** – Large charts:  
- Grade distribution across all exams (histogram)  
- Per-course average scores  
- Top 5 low-confidence questions (needs attention)  

**2.2 All Exams (Department View)**  
Table showing every exam in the department with columns:  
Course | Lecturer | Semester | Students | Status | Auto-Approved % | Action: View Report.  
Filter by lecturer, semester, or status.

**2.3 Department Analytics Dashboard**  
Tabbed interface:  
- **Per-Question Performance** (all courses)  
- **Compulsory vs Elective Comparison** (department-wide)  
- **Common Misconceptions** (aggregated)  
- **Time Saved Leaderboard** (lecturers ranked)  
Export buttons: PDF Summary Report + CSV for CUE accreditation.

**2.4 Lecturer Performance Report** (drill-down)  
When clicking any lecturer from the grid:  
- Their personal stats  
- List of their exams  
- Side-by-side comparison with department average  
- One-click “Request Update” button (sends notification to that lecturer).

**2.5 System Health & Compliance View** (Admin-only within dept)  
- Total exams processed this semester  
- DPIA compliance status  
- Audit log summary  
- Data export controls (for university records)

---
