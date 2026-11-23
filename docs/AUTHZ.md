# Coaching Management System: Authorization Matrix & Rules (docs/AUTHZ.md)

*RBAC & Object-Level Permission Specifications for Biddyangon.*

---

## 1. Role Definitions

1. **ADMIN (`User.Role.ADMIN` or `is_superuser`):** Full control over institution configuration, users, assignments, fee collections, expenditures, salary approvals, results approval, and question approval.
2. **TEACHER (`User.Role.TEACHER`):** Scoped access to courses they are assigned to. Can view assigned classes/rosters, conduct sessions, take attendance, enter exam marks (PENDING), submit questions (PENDING), view their own salary earnings.
3. **STUDENT (`User.Role.STUDENT`):** Scoped strictly to their own records. Can view enrolled courses, own attendance %, own fees due and receipts, upcoming exams and approved results, submit complaints, and take online exams (only when course fees are fully cleared).

---

## 2. Resource Permission Matrix

| Resource | Action | Admin | Teacher | Student | Enforcement Mechanism |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **User/Profile** | Create / Deactivate | ✅ | ❌ | ❌ | AdminRequiredMixin |
| **Profile** | View / Edit Own | ✅ | ✅ | ✅ | Own object check |
| **Class/Section/Course** | Manage CRUD | ✅ | ❌ | ❌ | AdminRequiredMixin |
| **Course** | View | ✅ | Assigned Only | Enrolled Only | `Course.objects.for_user(user)` |
| **Routine & Sessions** | View Routine | ✅ | Assigned | Enrolled | Scoped querysets |
| **Attendance** | Mark / Update | ✅ | Assigned Course | ❌ | `AttendanceService.mark(...)` |
| **Attendance** | View Summary | ✅ | Assigned Course | Own only | `Attendance.objects.for_user(user)` |
| **Enrollment** | Create / Update | ✅ | ❌ | ❌ | AdminRequiredMixin |
| **Payment Ledger** | Record payment | ✅ | ❌ | ❌ | Append-only service |
| **Payment / Due** | View dues & receipts | ✅ | ❌ | Own only | `Payment.objects.for_user(user)` |
| **Expenditure** | Record & View Ledger | ✅ | ❌ | ❌ | AdminRequiredMixin |
| **Teacher Salary** | View Payroll | ✅ | Own only | ❌ | `SalaryService.calculate(...)` |
| **Exam Schedule** | Create / Edit | ✅ | ❌ | ❌ | AdminRequiredMixin |
| **Exam Marks Entry** | Enter marks | ✅ | Assigned Course | ❌ | Status set to `PENDING` |
| **Exam Marks Approval**| Approve / Reject | ✅ | ❌ | ❌ | `approve_result(user, result)` |
| **Exam Result View** | View published | ✅ | Assigned Course | Own APPROVED only | Status filter + user scope |
| **Question Bank** | Submit question | ✅ | Assigned Course | ❌ | Status set to `PENDING` |
| **Question Bank** | Approve / Reject | ✅ | ❌ | ❌ | `approve_question(user, question)` |
| **Online Exam** | Take Exam | ❌ | ❌ | Fee-Cleared Enrolled | `can_take_exam(student, exam)` |
| **Complaints** | Create / View Own | ❌ | ❌ | ✅ | `Complaint.objects.for_user(user)` |
| **Complaints** | Respond & Resolve | ✅ | ❌ | ❌ | AdminRequiredMixin |

---

## 3. Mandatory Django Mixins & Helpers

- `AdminRequiredMixin`: Checks `request.user.is_authenticated and (request.user.role == User.Role.ADMIN or request.user.is_superuser)`
- `TeacherRequiredMixin`: Checks `request.user.is_authenticated and request.user.role == User.Role.TEACHER`
- `StudentRequiredMixin`: Checks `request.user.is_authenticated and request.user.role == User.Role.STUDENT`
- `FeeClearedRequiredMixin` / `can_take_exam(student, exam)`: Validates that for the exam's course, student has `due_amount == 0.00`.
- Scoped querysets: Every list view must use filtered managers or service methods (e.g. `Enrollment.objects.filter(student=user)`).
- Direct ID manipulation in URL parameters must strictly verify ownership before rendering data (returning 403 or 404).
