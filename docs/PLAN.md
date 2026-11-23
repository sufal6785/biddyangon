# Coaching Management System: Build Plan & Feature Checklists

*Django + relational DB, built with Google Antigravity. Based on your full-scope proposal.*

---

## 0. How to drive Antigravity with this plan

- [x] Create the repo with `docs/PLAN.md` (this file), `docs/SCHEMA.md` (Section 3) and `docs/AUTHZ.md` (Section 4). Agents work much better when the spec lives in the repo.
- [x] Add a project rules file (`.agent/rules/rules.md`):
  - Every fact has one home table; totals are never stored, always derived (Section 1 principle).
  - Payments and Expenditures are append-only; no update or delete views.
  - Every view must go through the role mixins; no raw `Model.objects.all()` in teacher/student views.
  - Every feature ships with tests, including a negative permission test.
  - Use `transaction.atomic` for money and approval changes.
- [x] One phase = one conversation/agent task. Ask the agent for an **implementation plan first**, review it, then approve coding. Never ask for “the whole system”.
- [x] After each feature: run `python manage.py test`, review the diff, commit (`git commit -m "feat(fees): record payment"`).
- [x] Use a second agent as a reviewer: “Review the last commit for permission leaks and N+1 queries.”
- [x] Reusable workflow and clear separation across apps, services, views, and tests.

---

## 1. Decisions to lock before coding

- [x] **Database:** SQLite (default for development & tests with zero dependencies) + PostgreSQL support via environment variables (`DB_ENGINE`, `DB_NAME`, `DB_USER`, etc.).
- [x] **Auth model:** custom `User(AbstractUser)` with `role` field (ADMIN / TEACHER / STUDENT) + one-to-one profile tables (`TeacherProfile`, `StudentProfile`).
- [x] **Student username rule:** class + roll (e.g. `ssc26-014`). Unique and auto-generated or validated.
- [x] **Money type:** `DecimalField(max_digits=10, decimal_places=2)`. Never float.
- [x] **Core principle:** fees, salary, attendance %, balance, and course progress are computed from Enrollment, Payment, CourseSession, and Attendance, never typed in as totals.
- [x] **Approval states:** one shared choice set `DRAFT / PENDING / APPROVED / REJECTED`.
- [x] **Frontend:** Django templates with clean modern styling + Django REST Framework API for React frontend integration.
- [x] **Timeline target:** full scope built systematically feature by feature.

---

## 2. Project structure (Django apps)

- [x] `config/`: settings split/configurable via `.env`, root urls
- [x] `apps/core/`: shared mixins, base templates, utils, audit helpers, seed command
- [x] `apps/users/`: User, login, logout, role mixins, profile, password change
- [x] `apps/academics/`: Class, Section, Course, RoutineSlot, CourseSession, SyllabusTopic
- [x] `apps/people/`: TeacherProfile, StudentProfile, TeacherAssignment
- [x] `apps/enrollments/`: Enrollment, bulk enroll
- [x] `apps/finance/`: Payment, Expenditure, salary calculation, financial summary
- [x] `apps/attendance/`: Attendance, course progress
- [x] `apps/results/`: Exam, ExamResult, CourseResult, approval workflow
- [x] `apps/exams/`: Question, ExamQuestion, ExamAttempt, ExamAnswer, fee-gated assessments
- [x] `apps/complaints/`: Complaint lifecycle
- [x] `apps/dashboard/`: role dashboards for Admin, Teacher, Student

---

## 3. Schema checklist (docs/SCHEMA.md)

- [x] **User**: role, phone, email; Student `username` = class+roll
- [x] **TeacherProfile** (OneToOne to User)
- [x] **StudentProfile** (OneToOne to User): section FK, roll no., location, guardian phone
- [x] **Class**: name, code, is_active; unique name, unique code
- [x] **Section**: class FK, name; unique (class, name)
- [x] **Course**: name, class FK, total_sessions_planned, default_fee
- [x] **RoutineSlot**: section FK, course FK, weekday, start/end time, room; no overlap check per section and per teacher
- [x] **CourseSession**: course FK, section FK, date, topic, `held` (bool), taught_by teacher FK
- [x] **SyllabusTopic**: course FK, title, order, linked to Exam
- [x] **TeacherAssignment**: teacher FK, course FK, rate_per_session; unique (teacher, course)
- [x] **Enrollment**: student FK, course FK, fee_total; unique (student, course)
- [x] **Payment**: enrollment FK, amount > 0, paid_on, method, receipt_no (unique), received_by; append-only
- [x] **Expenditure**: category, purpose, amount > 0, spent_on, recorded_by; append-only
- [x] **Attendance**: enrollment FK, session FK, status (PRESENT/ABSENT/LATE), marked_by; unique (enrollment, session)
- [x] **Exam**: course FK, title, date, duration, total_marks, status (DRAFT/SCHEDULED/OPEN/CLOSED), syllabus topics M2M
- [x] **ExamResult**: enrollment FK, exam FK, marks, status (PENDING/APPROVED), submitted_by, approved_by, approved_at; unique (student, exam)
- [x] **CourseResult**: enrollment FK (one-to-one), grade/GPA, status (PENDING/APPROVED), approved_by
- [x] **Question**: course FK, text, type (MCQ), options, correct answer, marks, status (DRAFT/PENDING/APPROVED/REJECTED), submitted_by, approved_by
- [x] **ExamQuestion**: exam FK, question FK, order; only APPROVED questions allowed
- [x] **ExamAttempt**: exam FK, student FK, started_at, submitted_at, score; unique (exam, student)
- [x] **ExamAnswer**: attempt FK, question FK, selected option
- [x] **Complaint**: student FK, subject, body, status (OPEN/IN_PROGRESS/RESOLVED), admin_response, resolved_by, timestamps
- [x] DB-level `CheckConstraint`s and `UniqueConstraint`s in place

---

## 4. Authorization checklist (docs/AUTHZ.md)

- [x] Rule matrix: role × resource × action
- [x] Django implementation:
  - [x] `AdminRequiredMixin`, `TeacherRequiredMixin`, `StudentRequiredMixin`
  - [x] Scoped querysets
  - [x] Object-level check helpers (`can_take_exam`, etc.)
  - [x] Negative permission tests for every view

---

## 5. Phased feature checklists

### Phase 1: Foundation
- [x] F1.1 Project setup & database config
- [x] F1.2 Schema and ER documentation

### Phase 2: Auth and Admin CRUD
- [x] F2.1 Login / logout for 3 roles & dashboard redirect
- [x] F2.2 Profile view/edit (all roles)
- [x] F2.3 Admin: manage Class, Section, Course
- [x] F2.4 Admin: manage Teacher and Student (atomic create, roll username)
- [x] F2.5 Admin: Teacher assignment + salary rate
- [x] F2.6 Routine and class scheduling (conflict detection, session generator)

### Phase 3: Enrollment, Fees, Payroll
- [x] F3.1 Enrollment (fee_total override, bulk section enroll)
- [x] F3.2 Fee collection (append-only Payment, auto receipt no, due calculation)
- [x] F3.3 Expenditure ledger (append-only Expenditure, category filters)
- [x] F3.4 Revenue / expenditure / balance report
- [x] F3.5 Teacher salary calculation (rate_per_session × sessions held)
- [x] F3.6 Student fee view (due and payment history)

### Phase 4: Attendance and Results
- [x] F4.1 Teacher: view profile, assigned classes, student roster
- [x] F4.2 Take attendance (sets session held = True, feeds salary & progress)
- [x] F4.3 Student attendance % and course progress
- [x] F4.4 Exam dates and syllabus topics
- [x] F4.5 Results: entry and approval workflow (Teacher enters -> PENDING -> Admin APPROVED)
- [x] F4.6 Admin: track any student’s results & grades

### Phase 5: Student Dashboard and Complaints
- [x] F5.1 Student dashboard (fees due, attendance %, next exam, progress)
- [x] F5.2 Complaints (student submits -> admin responds -> resolved)
- [x] F5.3 Admin overview dashboard (metrics, pending approvals, open complaints)

### Phase 6: Question Bank and Online Exams
- [x] F6.1 Question bank (Teacher submits PENDING -> Admin approves)
- [x] F6.2 Exam creation from approved questions
- [x] F6.3 Taking the exam with server-side fee-gate (due == 0 required)

### Phase 7: Hardening
- [x] Comprehensive test suite covering happy paths and negative permission tests (27 passing tests)
- [x] Strict immutability checks on Payment and Expenditure
- [x] Security checks, input validation, CSRF, atomicity

### Phase 8: Documentation and Handoff
- [x] README setup guide & sample queries
- [x] Database Schema documentation in `docs/SCHEMA.md`
- [x] Authorization rules in `docs/AUTHZ.md`
- [x] Project build plan in `docs/PLAN.md`
