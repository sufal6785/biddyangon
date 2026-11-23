# Coaching Management System: Database Schema Specification

*Standardized relational database design for Biddyangon Coaching Management System.*

---

## 1. Core Design Principles

1. **Single Source of Truth:** Totals (fees due, attendance percentage, salary owed, balance) are never stored as static fields; they are dynamically derived from ledger and transactional rows.
2. **Append-Only Ledgers:** `Payment` and `Expenditure` tables are immutable. Adjustments are handled via compensatory entries, never in-place row mutations.
3. **Strict Constraints:** Enforce business integrity at the database level via `CheckConstraint` (e.g. `amount > 0`, `marks <= total_marks`) and `UniqueConstraint` (e.g. `(student, course)`).
4. **Normalized Relationships:** Foreign keys with descriptive `related_name`s, proper indexing, and cascade rules (`PROTECT` on vital parent records like courses and sections).

---

## 2. Table Specifications

### 2.1 `users.User`
Custom user model extending `AbstractUser`.
- `id`: BigAutoField, Primary Key
- `username`: CharField(150), unique (For students: `{class_code}-{roll}`, e.g., `ssc26-014`)
- `role`: CharField(10), choices: `ADMIN`, `TEACHER`, `STUDENT`
- `phone`: CharField(15), unique, nullable
- `location`: CharField(255), nullable
- `email`: EmailField, blank
- `first_name`, `last_name`, standard auth fields

### 2.2 `people.TeacherProfile`
One-to-one extension for teachers.
- `id`: BigAutoField, Primary Key
- `user`: OneToOneField(`User`, on_delete=CASCADE, related_name='teacher_profile')
- `designation`: CharField(100), default='Instructor'
- `qualification`: CharField(255), blank
- `joining_date`: DateField, default=now

### 2.3 `people.StudentProfile`
One-to-one extension for students.
- `id`: BigAutoField, Primary Key
- `user`: OneToOneField(`User`, on_delete=CASCADE, related_name='student_profile')
- `section`: ForeignKey(`academics.Section`, on_delete=PROTECT, related_name='students')
- `roll_no`: PositiveIntegerField
- `guardian_name`: CharField(150), blank
- `guardian_phone`: CharField(15), blank
- **Constraint:** Unique together `(section, roll_no)`

### 2.4 `academics.Class`
Represents an academic grade/class.
- `id`: BigAutoField, Primary Key
- `name`: CharField(100), unique (e.g. "Class 10", "HSC 2026")
- `code`: CharField(20), unique (e.g. "ssc26")
- `is_active`: BooleanField, default=True

### 2.5 `academics.Section`
Division within a class.
- `id`: BigAutoField, Primary Key
- `academic_class`: ForeignKey(`Class`, on_delete=CASCADE, related_name='sections')
- `name`: CharField(50) (e.g. "Science-A", "Morning")
- **Constraint:** Unique together `(academic_class, name)`

### 2.6 `academics.Course`
Subject or module offered.
- `id`: BigAutoField, Primary Key
- `academic_class`: ForeignKey(`Class`, on_delete=PROTECT, related_name='courses')
- `name`: CharField(150) (e.g. "Higher Mathematics")
- `code`: CharField(30), unique
- `total_sessions_planned`: PositiveIntegerField, default=40
- `default_fee`: DecimalField(10, 2), default=0.00
- `is_active`: BooleanField, default=True

### 2.7 `people.TeacherAssignment`
Assigns a teacher to a course with a session rate.
- `id`: BigAutoField, Primary Key
- `teacher`: ForeignKey(`User`, on_delete=CASCADE, related_name='assignments')
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='teacher_assignments')
- `rate_per_session`: DecimalField(10, 2), CheckConstraint(rate_per_session >= 0)
- `assigned_at`: DateTimeField, auto_now_add=True
- **Constraint:** Unique together `(teacher, course)`

### 2.8 `academics.RoutineSlot`
Weekly timetable schedule.
- `id`: BigAutoField, Primary Key
- `section`: ForeignKey(`Section`, on_delete=CASCADE, related_name='routine_slots')
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='routine_slots')
- `teacher`: ForeignKey(`User`, on_delete=CASCADE, related_name='routine_slots')
- `weekday`: IntegerField (0=Monday ... 6=Sunday)
- `start_time`: TimeField
- `end_time`: TimeField
- `room`: CharField(50), blank
- **Constraint:** Validation ensuring start_time < end_time, and no overlapping slots for same section or same teacher on the same weekday.

### 2.9 `academics.CourseSession`
Individual class meeting instance (actual or planned).
- `id`: BigAutoField, Primary Key
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='sessions')
- `section`: ForeignKey(`Section`, on_delete=CASCADE, related_name='sessions')
- `taught_by`: ForeignKey(`User`, on_delete=SET_NULL, null=True, related_name='conducted_sessions')
- `date`: DateField
- `topic`: CharField(255), blank
- `held`: BooleanField, default=False (Feeds attendance, salary, and progress)

### 2.10 `academics.SyllabusTopic`
Topics planned for a course.
- `id`: BigAutoField, Primary Key
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='syllabus_topics')
- `title`: CharField(200)
- `order`: PositiveIntegerField, default=1
- `is_covered`: BooleanField, default=False

### 2.11 `enrollments.Enrollment`
Student enrollment into a course.
- `id`: BigAutoField, Primary Key
- `student`: ForeignKey(`User`, on_delete=CASCADE, related_name='enrollments')
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='enrollments')
- `fee_total`: DecimalField(10, 2), CheckConstraint(fee_total >= 0)
- `enrolled_at`: DateTimeField, auto_now_add=True
- `is_active`: BooleanField, default=True
- **Constraint:** Unique together `(student, course)`

### 2.12 `finance.Payment`
Append-only payment receipt ledger.
- `id`: BigAutoField, Primary Key
- `enrollment`: ForeignKey(`Enrollment`, on_delete=PROTECT, related_name='payments')
- `amount`: DecimalField(10, 2), CheckConstraint(amount > 0)
- `receipt_no`: CharField(64), unique
- `method`: CharField(20), choices: `CASH`, `BKASH`, `NAGAD`, `BANK`, `CARD`
- `paid_on`: DateField, default=today
- `received_by`: ForeignKey(`User`, on_delete=PROTECT, related_name='collected_payments')
- `created_at`: DateTimeField, auto_now_add=True
- `remarks`: TextField, blank

### 2.13 `finance.Expenditure`
Append-only expense ledger.
- `id`: BigAutoField, Primary Key
- `category`: CharField(30), choices: `SALARY`, `RENT`, `UTILITIES`, `STATIONERY`, `EQUIPMENT`, `MAINTENANCE`, `OTHER`
- `purpose`: CharField(255)
- `amount`: DecimalField(10, 2), CheckConstraint(amount > 0)
- `spent_on`: DateField, default=today
- `recorded_by`: ForeignKey(`User`, on_delete=PROTECT, related_name='recorded_expenses')
- `created_at`: DateTimeField, auto_now_add=True

### 2.14 `attendance.Attendance`
Student attendance per session.
- `id`: BigAutoField, Primary Key
- `enrollment`: ForeignKey(`Enrollment`, on_delete=CASCADE, related_name='attendances')
- `session`: ForeignKey(`CourseSession`, on_delete=CASCADE, related_name='attendances')
- `status`: CharField(10), choices: `PRESENT`, `ABSENT`, `LATE`
- `marked_by`: ForeignKey(`User`, on_delete=PROTECT, related_name='marked_attendances')
- `marked_at`: DateTimeField, auto_now=True
- **Constraint:** Unique together `(enrollment, session)`

### 2.15 `results.Exam`
Scheduled examinations.
- `id`: BigAutoField, Primary Key
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='exams')
- `title`: CharField(200)
- `date`: DateField
- `duration_minutes`: PositiveIntegerField, default=60
- `total_marks`: DecimalField(6, 2), default=100.00
- `status`: CharField(15), choices: `DRAFT`, `SCHEDULED`, `OPEN`, `CLOSED`
- `syllabus_topics`: ManyToManyField(`SyllabusTopic`, blank=True)

### 2.16 `results.ExamResult`
Student examination scores with approval workflow.
- `id`: BigAutoField, Primary Key
- `enrollment`: ForeignKey(`Enrollment`, on_delete=CASCADE, related_name='exam_results')
- `exam`: ForeignKey(`Exam`, on_delete=CASCADE, related_name='results')
- `marks_obtained`: DecimalField(6, 2), CheckConstraint(marks_obtained >= 0)
- `status`: CharField(10), choices: `PENDING`, `APPROVED`, `REJECTED`, default='PENDING'
- `submitted_by`: ForeignKey(`User`, on_delete=PROTECT, related_name='submitted_results')
- `approved_by`: ForeignKey(`User`, on_delete=SET_NULL, null=True, blank=True, related_name='approved_results')
- `approved_at`: DateTimeField, null=True, blank=True
- `rejection_reason`: TextField, blank
- **Constraint:** Unique together `(enrollment, exam)`

### 2.17 `results.CourseResult`
Final course grade/GPA.
- `id`: BigAutoField, Primary Key
- `enrollment`: OneToOneField(`Enrollment`, on_delete=CASCADE, related_name='course_result')
- `grade`: CharField(5) (e.g. "A+", "A", "B", "F")
- `gpa`: DecimalField(3, 2)
- `status`: CharField(10), choices: `PENDING`, `APPROVED`, `REJECTED`, default='PENDING'
- `approved_by`: ForeignKey(`User`, on_delete=SET_NULL, null=True, blank=True)

### 2.18 `exams.Question`
MCQ questions with approval queue.
- `id`: BigAutoField, Primary Key
- `course`: ForeignKey(`Course`, on_delete=CASCADE, related_name='questions')
- `text`: TextField
- `option_a`: CharField(255)
- `option_b`: CharField(255)
- `option_c`: CharField(255)
- `option_d`: CharField(255)
- `correct_option`: CharField(1), choices: `A`, `B`, `C`, `D`
- `marks`: DecimalField(4, 2), default=1.00
- `status`: CharField(10), choices: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, default='PENDING'
- `submitted_by`: ForeignKey(`User`, on_delete=PROTECT, related_name='submitted_questions')
- `approved_by`: ForeignKey(`User`, on_delete=SET_NULL, null=True, blank=True)
- `rejection_reason`: TextField, blank

### 2.19 `exams.ExamQuestion`
Join table connecting exams and questions.
- `id`: BigAutoField, Primary Key
- `exam`: ForeignKey(`Exam`, on_delete=CASCADE, related_name='exam_questions')
- `question`: ForeignKey(`Question`, on_delete=PROTECT, related_name='exam_questions')
- `order`: PositiveIntegerField, default=1
- **Constraint:** Unique together `(exam, question)`

### 2.20 `exams.ExamAttempt`
Student online exam sitting.
- `id`: BigAutoField, Primary Key
- `exam`: ForeignKey(`Exam`, on_delete=CASCADE, related_name='attempts')
- `student`: ForeignKey(`User`, on_delete=CASCADE, related_name='exam_attempts')
- `started_at`: DateTimeField, auto_now_add=True
- `submitted_at`: DateTimeField, null=True, blank=True
- `score`: DecimalField(6, 2), default=0.00
- **Constraint:** Unique together `(exam, student)`

### 2.21 `exams.ExamAnswer`
Individual answer choice recorded.
- `id`: BigAutoField, Primary Key
- `attempt`: ForeignKey(`ExamAttempt`, on_delete=CASCADE, related_name='answers')
- `question`: ForeignKey(`Question`, on_delete=CASCADE)
- `selected_option`: CharField(1), choices: `A`, `B`, `C`, `D`
- `is_correct`: BooleanField, default=False
- **Constraint:** Unique together `(attempt, question)`

### 2.22 `complaints.Complaint`
Student grievance management.
- `id`: BigAutoField, Primary Key
- `student`: ForeignKey(`User`, on_delete=CASCADE, related_name='complaints')
- `subject`: CharField(200)
- `body`: TextField
- `status`: CharField(15), choices: `OPEN`, `IN_PROGRESS`, `RESOLVED`, default='OPEN'
- `admin_response`: TextField, blank
- `resolved_by`: ForeignKey(`User`, on_delete=SET_NULL, null=True, blank=True)
- `created_at`: DateTimeField, auto_now_add=True
- `updated_at`: DateTimeField, auto_now=True
