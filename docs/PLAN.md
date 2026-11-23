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
- [ ] One phase = one conversation/agent task. Ask the agent for an **implementation plan first**, review it, then approve coding. Never ask for “the whole system”.
- [ ] After each feature: run `python manage.py test`, review the diff, commit (`git commit -m "feat(fees): record payment"`).
- [ ] Use a second agent as a reviewer: “Review the last commit for permission leaks and N+1 queries.”
- [ ] Optional: save a reusable workflow (slash command) such as `/new-feature` that asks the agent to do: model → migration → service → view → template → tests → permission test.

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

- [ ] `config/`: settings split/configurable via `.env`, root urls
- [ ] `core/`: shared mixins, base templates, utils, audit helpers
- [ ] `apps/users/` (or `accounts/`): User, login, logout, role mixins, profile
- [ ] `apps/academics/`: Class, Section, Course, RoutineSlot, CourseSession, SyllabusTopic
- [ ] `apps/people/`: TeacherProfile, StudentProfile, TeacherAssignment
- [ ] `apps/enrollments/`: Enrollment
- [ ] `apps/finance/`: Payment, Expenditure, salary calculation
- [ ] `apps/attendance/`: Attendance
- [ ] `apps/results/`: ExamResult, CourseResult, approval workflow
- [ ] `apps/exams/`: Question, Exam, ExamQuestion, ExamAttempt, ExamAnswer
- [ ] `apps/complaints/`: Complaint
- [ ] `apps/dashboard/`: role dashboards

---

## 3. Schema checklist (docs/SCHEMA.md)

- [ ] **User**: role, phone, email; Student `username` = class+roll
- [ ] **TeacherProfile** (OneToOne to User)
- [ ] **StudentProfile** (OneToOne to User): section FK, roll no., location, guardian phone (optional)
- [ ] **Class**: name, year/batch; unique name
- [ ] **Section**: class FK, name; unique (class, name)
- [ ] **Course**: name, class FK, total_sessions_planned, default_fee
- [ ] **RoutineSlot**: section FK, course FK, weekday, start/end time, room; no overlap check per section and per teacher
- [ ] **CourseSession**: course FK, section FK, date, topic, `held` (bool), taught_by teacher FK
- [ ] **SyllabusTopic**: course FK, title, order, linked to Exam
- [ ] **TeacherAssignment**: teacher FK, course FK, rate_per_session; unique (teacher, course)
- [ ] **Enrollment**: student FK, course FK, fee_total; unique (student, course)
- [ ] **Payment**: enrollment FK, amount > 0, paid_on, method, receipt_no (unique), received_by; append-only
- [ ] **Expenditure**: category, purpose, amount > 0, spent_on, recorded_by; append-only
- [ ] **Attendance**: enrollment FK, session FK, status (PRESENT/ABSENT/LATE), marked_by; unique (enrollment, session)
- [ ] **Exam**: course FK, title, date, duration, total_marks, status (DRAFT/SCHEDULED/OPEN/CLOSED), syllabus topics M2M
- [ ] **ExamResult**: enrollment FK, exam FK, marks, status (PENDING/APPROVED), submitted_by, approved_by, approved_at; unique (student, exam)
- [ ] **CourseResult**: enrollment FK (one-to-one), grade/GPA, status (PENDING/APPROVED), approved_by
- [ ] **Question**: course FK, text, type (MCQ), options, correct answer, marks, status (DRAFT/PENDING/APPROVED/REJECTED), submitted_by, approved_by
- [ ] **ExamQuestion**: exam FK, question FK, order; only APPROVED questions allowed
- [ ] **ExamAttempt**: exam FK, student FK, started_at, submitted_at, score; unique (exam, student)
- [ ] **ExamAnswer**: attempt FK, question FK, selected option
- [ ] **Complaint**: student FK, subject, body, status (OPEN/IN_PROGRESS/RESOLVED), admin_response, resolved_by, timestamps
- [ ] DB-level `CheckConstraint`s and `UniqueConstraint`s in place

---

## 4. Authorization checklist (docs/AUTHZ.md)

- [ ] Rule matrix: role × resource × action
- [ ] Django implementation:
  - [ ] `AdminRequiredMixin`, `TeacherRequiredMixin`, `StudentRequiredMixin`
  - [ ] Scoped querysets
  - [ ] Object-level check helpers
  - [ ] Negative permission tests for every view

---

## 5. Phased feature checklists

### Phase 1: Foundation
- [x] F1.1 Project setup & database config
- [x] F1.2 Schema and ER documentation

### Phase 2: Auth and Admin CRUD
- [ ] F2.1 Login / logout for 3 roles & dashboard redirect
- [ ] F2.2 Profile view/edit (all roles)
- [ ] F2.3 Admin: manage Class, Section, Course
- [ ] F2.4 Admin: manage Teacher and Student (atomic create, roll username)
- [ ] F2.5 Admin: Teacher assignment + salary rate
- [ ] F2.6 Routine and class scheduling (conflict detection, session generator)

### Phase 3: Enrollment, Fees, Payroll
- [ ] F3.1 Enrollment (fee_total override, bulk section enroll)
- [ ] F3.2 Fee collection (append-only Payment, auto receipt no, due calculation)
- [ ] F3.3 Expenditure ledger (append-only Expenditure, category filters)
- [ ] F3.4 Revenue / expenditure / balance report
- [ ] F3.5 Teacher salary calculation (rate_per_session × sessions held)
- [ ] F3.6 Student fee view (due and payment history)

### Phase 4: Attendance and Results
- [ ] F4.1 Teacher: view profile, assigned classes, student roster
- [ ] F4.2 Take attendance (sets session held = True, feeds salary & progress)
- [ ] F4.3 Student attendance % and course progress
- [ ] F4.4 Exam dates and syllabus topics
- [ ] F4.5 Results: entry and approval workflow (Teacher enters -> PENDING -> Admin APPROVED)
- [ ] F4.6 Admin: track any student’s results & grades

### Phase 5: Student Dashboard and Complaints
- [ ] F5.1 Student dashboard (fees due, attendance %, next exam, progress)
- [ ] F5.2 Complaints (student submits -> admin responds -> resolved)
- [ ] F5.3 Admin overview dashboard (metrics, pending approvals, open complaints)

### Phase 6: Question Bank and Online Exams
- [ ] F6.1 Question bank (Teacher submits PENDING -> Admin approves)
- [ ] F6.2 Exam creation from approved questions
- [ ] F6.3 Taking the exam with server-side fee-gate (due == 0 required)

### Phase 7: Hardening
- [ ] Comprehensive test suite covering happy paths and negative permission tests
- [ ] N+1 queries optimization & indexes
- [ ] Security checks, input validation, CSRF

### Phase 8: Documentation and Handoff
- [ ] README setup guide & sample queries
