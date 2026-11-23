from decimal import Decimal
from django.test import TestCase
from django.core.management import call_command
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Course
from apps.enrollments.models import Enrollment
from apps.finance.models import Payment

User = get_user_model()


class FoundationTests(TestCase):
    def test_seed_data_command(self):
        call_command("seed_data")

        # Check users created
        admin = User.objects.get(username="admin")
        self.assertEqual(admin.role, User.Role.ADMIN)
        self.assertTrue(admin.is_superuser)

        teacher = User.objects.get(username="teacher1")
        self.assertEqual(teacher.role, User.Role.TEACHER)
        self.assertTrue(hasattr(teacher, "teacher_profile"))

        student = User.objects.get(username="ssc26-001")
        self.assertEqual(student.role, User.Role.STUDENT)
        self.assertTrue(hasattr(student, "student_profile"))

        # Check academics
        cls = Class.objects.get(code="ssc26")
        self.assertEqual(cls.name, "Class 10 (SSC 2026)")

        course = Course.objects.get(code="H-MATH-10")
        self.assertEqual(course.default_fee, Decimal("12000.00"))

        # Check financial ledger
        enrollment = Enrollment.objects.get(student=student, course=course)
        self.assertEqual(enrollment.fee_total, Decimal("12000.00"))
        self.assertEqual(enrollment.total_paid, Decimal("5000.00"))
        self.assertEqual(enrollment.due_amount, Decimal("7000.00"))
        self.assertFalse(enrollment.is_cleared)
