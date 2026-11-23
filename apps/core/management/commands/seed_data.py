from datetime import date, time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Section, Course, RoutineSlot, CourseSession, SyllabusTopic
from apps.people.models import TeacherProfile, StudentProfile, TeacherAssignment
from apps.enrollments.models import Enrollment
from apps.finance.models import Payment, Expenditure
from apps.results.models import Exam, ExamResult, ApprovalStatus
from apps.exams.models import Question, ExamQuestion
from apps.complaints.models import Complaint

User = get_user_model()


class Command(BaseCommand):
    help = "Seed initial demonstration data for Biddyangon Coaching Management Platform"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        # 1. Create Administrator
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "first_name": "System",
                "last_name": "Administrator",
                "email": "admin@biddyangon.com",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password("admin123")
        admin_user.save()

        # 2. Create Teachers
        teacher_user, _ = User.objects.get_or_create(
            username="teacher1",
            defaults={
                "first_name": "Rafiqul",
                "last_name": "Islam",
                "email": "rafiq@biddyangon.com",
                "role": User.Role.TEACHER,
                "phone": "01711000001",
            },
        )
        teacher_user.set_password("teacher123")
        teacher_user.save()

        TeacherProfile.objects.get_or_create(
            user=teacher_user,
            defaults={
                "designation": "Senior Mathematics Lecturer",
                "qualification": "M.Sc. in Applied Mathematics (DU)",
            },
        )

        # 3. Create Classes & Sections
        cls_ssc, _ = Class.objects.get_or_create(
            code="ssc26",
            defaults={"name": "Class 10 (SSC 2026)", "is_active": True},
        )
        cls_hsc, _ = Class.objects.get_or_create(
            code="hsc26",
            defaults={"name": "Class 12 (HSC 2026)", "is_active": True},
        )

        sec_a, _ = Section.objects.get_or_create(
            academic_class=cls_ssc,
            name="Science-A",
        )
        sec_b, _ = Section.objects.get_or_create(
            academic_class=cls_ssc,
            name="Science-B",
        )

        # 4. Create Students
        student_user, _ = User.objects.get_or_create(
            username="ssc26-001",
            defaults={
                "first_name": "Tanvir",
                "last_name": "Hasan",
                "email": "tanvir@example.com",
                "role": User.Role.STUDENT,
                "phone": "01811000001",
                "location": "Dhanmondi, Dhaka",
            },
        )
        student_user.set_password("student123")
        student_user.save()

        StudentProfile.objects.get_or_create(
            user=student_user,
            defaults={
                "section": sec_a,
                "roll_no": 1,
                "guardian_name": "Kamal Hasan",
                "guardian_phone": "01811000009",
            },
        )

        # 5. Create Courses
        course_math, _ = Course.objects.get_or_create(
            code="H-MATH-10",
            defaults={
                "academic_class": cls_ssc,
                "name": "Higher Mathematics",
                "total_sessions_planned": 36,
                "default_fee": Decimal("12000.00"),
                "is_active": True,
            },
        )

        course_phy, _ = Course.objects.get_or_create(
            code="PHY-10",
            defaults={
                "academic_class": cls_ssc,
                "name": "Physics",
                "total_sessions_planned": 30,
                "default_fee": Decimal("10000.00"),
                "is_active": True,
            },
        )

        # 6. Teacher Assignment
        TeacherAssignment.objects.get_or_create(
            teacher=teacher_user,
            course=course_math,
            defaults={"rate_per_session": Decimal("1500.00")},
        )

        # 7. Syllabus Topics
        topic1, _ = SyllabusTopic.objects.get_or_create(
            course=course_math,
            order=1,
            defaults={"title": "Quadratic Equations and Functions", "is_covered": True},
        )
        topic2, _ = SyllabusTopic.objects.get_or_create(
            course=course_math,
            order=2,
            defaults={"title": "Trigonometric Ratios & Coordinate Geometry", "is_covered": False},
        )

        # 8. Routine Slots
        RoutineSlot.objects.get_or_create(
            section=sec_a,
            course=course_math,
            weekday=RoutineSlot.Weekday.MONDAY,
            defaults={
                "teacher": teacher_user,
                "start_time": time(10, 0),
                "end_time": time(11, 30),
                "room": "Room 201",
            },
        )

        # 9. Course Sessions
        session_held, _ = CourseSession.objects.get_or_create(
            course=course_math,
            section=sec_a,
            date=date(2026, 11, 10),
            defaults={
                "taught_by": teacher_user,
                "topic": "Quadratic Equations Intro",
                "held": True,
            },
        )
        CourseSession.objects.get_or_create(
            course=course_math,
            section=sec_a,
            date=date(2026, 11, 28),
            defaults={
                "taught_by": teacher_user,
                "topic": "Graphing Quadratic Functions",
                "held": False,
            },
        )

        # 10. Enrollment
        enrollment, _ = Enrollment.objects.get_or_create(
            student=student_user,
            course=course_math,
            defaults={"fee_total": Decimal("12000.00"), "is_active": True},
        )

        # 11. Payment
        if not enrollment.payments.exists():
            Payment.objects.create(
                enrollment=enrollment,
                amount=Decimal("5000.00"),
                method=Payment.PaymentMethod.BKASH,
                paid_on=date(2026, 11, 5),
                received_by=admin_user,
                remarks="First installment received via bKash",
            )

        # 12. Expenditure
        if not Expenditure.objects.exists():
            Expenditure.objects.create(
                category=Expenditure.Category.UTILITIES,
                purpose="Monthly High-Speed Internet Bill",
                amount=Decimal("2500.00"),
                spent_on=date(2026, 11, 1),
                recorded_by=admin_user,
            )

        # 13. Questions
        q1, _ = Question.objects.get_or_create(
            course=course_math,
            text="What is the discriminant of ax^2 + bx + c = 0?",
            defaults={
                "option_a": "b^2 - 4ac",
                "option_b": "b^2 + 4ac",
                "option_c": "-b ± √(b^2 - 4ac)",
                "option_d": "2a / b",
                "correct_option": "A",
                "marks": Decimal("1.00"),
                "status": ApprovalStatus.APPROVED,
                "submitted_by": teacher_user,
                "approved_by": admin_user,
            },
        )

        # 14. Exam
        exam, _ = Exam.objects.get_or_create(
            course=course_math,
            title="Class 10 Monthly Math Assessment",
            defaults={
                "date": date(2026, 12, 1),
                "duration_minutes": 45,
                "total_marks": Decimal("25.00"),
                "status": Exam.ExamStatus.SCHEDULED,
            },
        )
        exam.syllabus_topics.add(topic1)
        ExamQuestion.objects.get_or_create(exam=exam, question=q1, defaults={"order": 1})

        # 15. Complaint
        Complaint.objects.get_or_create(
            student=student_user,
            subject="Air conditioning issue in Room 201",
            defaults={
                "body": "The AC in Room 201 was making loud noises during Monday lecture.",
                "status": Complaint.Status.OPEN,
            },
        )

        self.stdout.write(self.style.SUCCESS("Database successfully seeded with demo accounts & records!"))
        self.stdout.write("Credentials:")
        self.stdout.write("  Admin:   admin     / admin123")
        self.stdout.write("  Teacher: teacher1  / teacher123")
        self.stdout.write("  Student: ssc26-001 / student123")
