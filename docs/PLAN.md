# ExamGrader KE v2 Backend Build Plan (Fairness Service + Full API Contract)

## Summary
Implement the backend to the provided API v2 spec with strict contract alignment, including full fairness/AI-health capability, automation jobs, and migration-backed schema changes.  
This plan includes required baseline fixes so the app can start and the new services can run.

## Locked Scope and Defaults
1. Scope is full API spec build (not fairness-only), delivered in phases with test gates.
2. API contract is strict `/api/v2` and existing implemented routes are migrated now.
3. Include baseline startup fixes required for runtime correctness.
4. Fairness metrics use `pandas + scipy` in MVP; `fairlearn` is deferred.
5. Fairness report computes on request and caches snapshots in DB.
6. Equal opportunity uses pass mark = `50%` of `exam.total_marks`.
7. Protected-attribute inference uses heuristics + config mapping file; unknown values are explicitly reported.
8. Language-mix fairness dimension is included now using OCR-text heuristics.
9. Adversarial suite uses curated 50-case fixtures with periodic regeneration.
10. Automation is full now: monthly fairness jobs, weekly prompt-update jobs, and 5% random real-exam adversarial runs.
11. Dashboard work is backend contracts only (APIs + websocket payloads).
12. All schema changes ship with explicit Flask-Migrate revisions.

## Phase Plan (Decision Complete)

## Phase 0: Baseline Runtime Stabilization
1. Fix app factory and blueprint wiring in [app/__init__.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/__init__.py) so startup/import succeeds.
2. Fix invalid/incomplete service stubs in [app/services/segmentation_service.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/services/segmentation_service.py) with a deterministic MVP segmenter.
3. Normalize package init files and route imports in [app/routes/__init__.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/__init__.py) and [app/models/__init__.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/models/__init__.py).
4. Add app entrypoint in [wsgi.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/wsgi.py) and local run bootstrap in [inngest_serve.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/inngest_serve.py).

## Phase 1: Schema and Migration Foundation
1. Initialize Alembic/Flask-Migrate artifacts in `migrations/` and baseline revision.
2. Refactor/extend models in:
   [app/models/user.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/models/user.py),
   [app/models/exam.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/models/exam.py),
   [app/models/submission.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/models/submission.py),
   [app/models/grade.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/models/grade.py).
3. Add new models/tables:
   `llm_feedback`, `fairness_reports`, `fairness_dimension_results`, `prompt_versions`, `adversarial_cases`, `adversarial_runs`, `adversarial_run_results`, `audit_logs`, `ocr_corrections`.
4. Add indexes and constraints:
   unique keys for prompt versions and review-queue uniqueness, foreign keys with cascade where appropriate, indexes on `exam_id`, `submission_id`, `approved`, `needs_review`, `created_at`.
5. Add migration revisions for each schema change set and one migration smoke test.

## Phase 2: Core `/api/v2` HTTP API Build
1. Implement auth endpoints with lockout and JWT flows in [app/routes/auth.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/auth.py): `/register`, `/login`, `/refresh`, `/logout`, `/me`.
2. Implement exams endpoints in [app/routes/exams.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/exams.py): list/create/get/update/delete with draft-only mutation rules.
3. Implement submissions + test upload endpoints in [app/routes/submissions.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/submissions.py) and OCR queue endpoints.
4. Implement grading/review endpoints in [app/routes/grading.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/grading.py): list/detail/approve-override/bulk-approve/review-summary.
5. Implement analytics/export/audit endpoints in [app/routes/analytics.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/analytics.py).
6. Enforce unified error envelope and status code mapping via shared API utility module in `app/utils/`.
7. Apply role checks (`lecturer`, `admin`, `ta`) and rate limiting (`100 req/min/user`) globally.

## Phase 3: Fairness Service (Core Request)
1. Add [app/services/fairness_service.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/services/fairness_service.py) with deterministic metric pipeline:
   demographic parity diff, equal opportunity diff, score correlation, per-dimension status.
2. Add attribute inference helper in `app/services/attribute_inference.py` with config file:
   [app/config/fairness_attribute_map.json](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/config/fairness_attribute_map.json).
3. Implement `/api/v2/exams/{exam_id}/fairness-report` response matching spec in [app/routes/analytics.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/routes/analytics.py).
4. Persist each run snapshot to `fairness_reports` + dimension table; return latest computed payload.
5. Emit websocket `fairness_alert` event when a threshold breaches.

## Phase 4: AI-Health and HITL
1. Add automatic override logging to `llm_feedback` on grade override in grading route/service.
2. Add prompt-learning service in `app/services/prompt_learning_service.py` to aggregate top 20 override patterns and create new prompt version records.
3. Implement `/api/v2/ai-health/overrides`, `/api/v2/ai-health/prompt-versions`, `/api/v2/ai-health/adversarial-results`.
4. Add admin-only guards for adversarial-results and prompt-versions endpoints.
5. Include computed fields in overrides endpoint: `prompt_version`, `overrides_in_current_prompt`, `accuracy_improvement_pct`.

## Phase 5: Adversarial Testing Pipeline
1. Add curated fixture repository:
   `tests/adversarial_cases/` with 50 synthetic cases and metadata.
2. Add `app/services/adversarial_service.py` to run suite through grading pipeline and compute pass-rate criterion (`>=95%` flagged/correct).
3. Store run metadata and failure case details in adversarial run tables.
4. Add periodic fixture regeneration utility script in `scripts/regenerate_adversarial_cases.py`.
5. Provide release-gate command in CI script to run adversarial suite pre-release and fail if threshold not met.

## Phase 6: Automation and Eventing
1. Extend [app/inngest/events.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/inngest/events.py) with fairness, prompt-update, and adversarial event names.
2. Add Inngest functions in `app/inngest/functions/`:
   exam completion fairness trigger, monthly fairness cron, weekly Sunday prompt-update cron, random 5% adversarial trigger on completed exams.
3. Implement deterministic 5% selection strategy using exam ID hash modulo.
4. Expand websocket events in [app/websocket/__init__.py](C:/Users/ALPHONCE/Documents/Github/University-grader/ai-exam-grading/ai-exam-grading-backend/app/websocket/__init__.py) to match spec payloads.
5. Record job execution results to audit logs.

## Phase 7: Department and Cross-Exam Views
1. Implement `/api/v2/department/overview`, `/department/ai-health`, `/department/lecturers`, `/department/fairness-summary`.
2. Add aggregation queries optimized with indexes and bounded pagination.
3. Restrict department endpoints to `admin` role.

## Phase 8: Dataset and Documentation Scaffolding
1. Scaffold fairness dataset path:
   `tests/fairness_dataset/` with schema template, README, and loader validation script.
2. Add machine-readable endpoint contract tests and JSON response fixtures.
3. Generate OpenAPI 3.1 docs endpoint `/api/docs` from implemented routes.
4. Update project runbook with env vars, cron semantics, and operational alerts.

## Public API / Interface Changes (Important)
1. Global versioned base path: `/api/v2`.
2. New fairness endpoint: `GET /exams/{exam_id}/fairness-report`.
3. New AI health endpoints: `/ai-health/overrides`, `/ai-health/adversarial-results`, `/ai-health/prompt-versions`.
4. New department endpoints for aggregated fairness/AI health.
5. Expanded websocket events including `fairness_alert`.
6. Override action now guarantees `llm_feedback` write.
7. New persistence types: fairness snapshots, prompt versions, adversarial runs/cases/results, audit events.

## Metric and Rule Definitions (Implemented Constants)
1. `demographic_parity_max = 5.0` percentage points.
2. `equal_opportunity_max = 8.0` percentage points.
3. `score_correlation_max = 0.1` absolute Pearson threshold.
4. `pass_mark_percent = 0.5`.
5. `min_group_size = 10`; dimensions with insufficient samples return `insufficient_data` and are excluded from pass/fail breach checks.
6. Language mix classification uses OCR text token heuristics with `unknown` fallback on low confidence/short text.

## Test Cases and Scenarios
1. Migration tests: up/down apply cleanly from empty DB and from existing scaffold schema.
2. Auth tests: login lockout at 5 failures, refresh flow, role access control.
3. Endpoint contract tests: all major endpoints match status codes and payload shapes in spec.
4. Fairness metric tests: pass scenario, alert scenario, insufficient-data scenario, correlation breach scenario.
5. Override/HITL tests: override creates `llm_feedback`; weekly job generates prompt version with expected top patterns.
6. Adversarial tests: run of 50 cases, threshold evaluation, failure-case persistence.
7. Automation tests: monthly/weekly scheduled handlers execute and persist outputs; 5% random exam trigger behavior deterministic.
8. Websocket tests: `fairness_alert`, `review_ready`, progress events payload compliance.
9. Performance checks: fairness report read under cached mode and bounded query behavior on large exam datasets.
10. Security checks: no raw student PII in logs; endpoint auth and admin-only gating validated.

## Acceptance Gates
1. Gate A: `python -m compileall app` and app startup are clean.
2. Gate B: all migrations apply in CI DB container and pass migration smoke tests.
3. Gate C: core `/api/v2` endpoint integration suite passes.
4. Gate D: fairness + AI-health + adversarial services pass unit/integration tests.
5. Gate E: automation jobs and websocket contracts validated in integration environment.
6. Gate F: OpenAPI docs and runbook updates complete.

## Assumptions
1. Existing uncommitted repo changes are user-owned and are not reverted.
2. Backend runtime target is Python 3.13+ with dependency set updated in `requirements.txt`.
3. `fairlearn` is intentionally excluded from MVP runtime due compatibility risk; metrics are implemented directly.
4. Frontend implementation is out of scope; backend contracts are authoritative for dashboard integration.
