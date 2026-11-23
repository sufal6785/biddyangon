# Biddyangon: Coaching Management Platform

A robust, relational-database-backed **Coaching Management System** built with **Django 6**, designed with strict separation of concerns, derived facts architecture, immutable financial ledgers, role-based authorization, and online fee-gated assessments.

---

## 🚀 Key Features by Role

### 1. 🛡️ Administrator
- **Academic Hierarchy:** Full CRUD for Classes, Sections, Courses, and Timetable Routine Slots with real-time conflict detection.
- **Automated Lecture Scheduling:** Generates `CourseSession` records from weekly routine slots over a custom date window.
- **People Management:** Atomic registration of teachers and students (auto-generating standardized student usernames `{class_code}-{roll_no:03d}`).
- **Teacher Course Allocation & Rates:** Assign instructors to courses with session remuneration rates.
- **Fee Collection Ledger:** Append-only fee payment records with auto-generated receipt IDs (`RCP-YYYYMMDD-XXXXXX`), printable receipts, and dynamic balance calculation.
- **Operational Expense Ledger:** Append-only ledger for categorizing rent, utilities, maintenance, and supplies.
- **Dynamic Teacher Payroll:** Aggregates conducted sessions (`held=True`) multiplied by contracted session rates.
- **Approval Queues:** Two-stage moderation for teacher-submitted exam marks and question bank items.
- **Grievance Resolution:** Review student complaints, reply with official resolutions, and manage statuses (`OPEN` → `IN_PROGRESS` → `RESOLVED`).

### 2. 👨‍🏫 Teacher
- **Assigned Course Portal:** Scoped view limited strictly to allocated courses and classes.
- **Student Roster:** Instant access to student contacts and parent details for assigned courses.
- **Attendance Register:** Interactive attendance taking (`PRESENT`, `ABSENT`, `LATE`); saving marks session `held=True`, feeding student progress and payroll.
- **Exam Results Entry:** Input assessment scores submitted directly into the Admin approval queue (`PENDING`).
- **Question Authoring:** Submit multiple-choice questions into the central Question Bank.
- **Personal Salary Statement:** Transparent calculation of monthly earnings based on conducted lectures.

### 3. 🎓 Student
- **Integrated Dashboard:** Real-time visibility into overall attendance percentage, tuition balance due, upcoming assessments, and published results.
- **Payment History & Receipts:** Direct access to verifiable payment receipts.
- **Course Progress:** View planned, conducted, and remaining lectures along with instructor contact details.
- **Online Exam Portal (Strict Server-Side Fee Gate):** Students with outstanding course dues (`due > 0`) are blocked from sitting for or submitting exams. Once dues are cleared (`due == 0`), access is granted with automated scoring and instant review.
- **Complaint Submission:** Privately submit feedback or issues directly to administration.

---

## 🔒 Architectural & Security Principles

1. **Derived Facts Only:** Totals (fees due, attendance %, salary owed, balance, course progress) are never stored statically; they are dynamically computed from foundational transactional rows.
2. **Immutable Ledgers:** `Payment` and `Expenditure` tables override `save` and `delete` to enforce append-only integrity. Adjustments require compensating entries.
3. **Strict Authorization & Scoped Querysets:** All views enforce role mixins (`AdminRequiredMixin`, `TeacherRequiredMixin`, `StudentRequiredMixin`). Teachers and students never receive raw `objects.all()`.
4. **Server-Side Fee Gate:** Validated on both start attempt and final answer submission.

---

## 🛠️ Quick Setup & Installation

### 1. Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Virtual environment (`venv`)

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/sufal6785/biddyangon.git
cd biddyangon

# Activate virtual environment
source .venv/bin/activate  # Or create one: python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample demonstration data
python manage.py seed_data

# Run comprehensive test suite
python manage.py test apps

# Start development server
python manage.py runserver
```

---

## 🔑 Demo Account Credentials

Seeded automatically via `python manage.py seed_data`:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Full access to management, finances, approvals |
| **Teacher** | `teacher1` | `teacher123` | Assigned to Higher Mathematics |
| **Student** | `ssc26-001` | `student123` | Enrolled in Higher Math with ৳5,000 paid (৳7,000 due) |

---

## 📚 Documentation
- [Build Plan & Feature Checklists](docs/PLAN.md)
- [Database Schema Specification](docs/SCHEMA.md)
- [Authorization Matrix & Rules](docs/AUTHZ.md)
- [Project Behavioral Rules](.agent/rules/rules.md)
