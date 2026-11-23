from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Section, Course
from apps.people.models import StudentProfile
from .models import Enrollment
from .services import EnrollmentService

User = get_user_model()


class EnrollmentTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_enr", password="password123", role=User.Role.ADMIN
        )
        self.student = User.objects.create_user(
            username="student_enr", password="password123", role=User.Role.STUDENT
        )
        self.teacher = User.objects.create_user(
            username="teacher_enr", password="password123", role=User.Role.TEACHER
        )

        self.cls = Class.objects.create(name="Class 11", code="c11")
        self.sec = Section.objects.create(academic_class=self.cls, name="Sec-1")
        StudentProfile.objects.create(user=self.student, section=self.sec, roll_no=1)

        self.course = Course.objects.create(
            academic_class=self.cls,
            name="Physics 1st Paper",
            code="PHY-11",
            default_fee=Decimal("10000.00"),
        )

    def test_single_and_bulk_enrollment(self):
        # Single enrollment via service
        enr = EnrollmentService.enroll_student(self.student, self.course)
        self.assertEqual(enr.fee_total, Decimal("10000.00"))
        self.assertEqual(enr.due_amount, Decimal("10000.00"))
        self.assertFalse(enr.is_cleared)

        # Bulk enrollment
        student2 = User.objects.create_user(username="student_enr2", role=User.Role.STUDENT)
        StudentProfile.objects.create(user=student2, section=self.sec, roll_no=2)

        course2 = Course.objects.create(
            academic_class=self.cls,
            name="Math 1st Paper",
            code="MATH-11",
            default_fee=Decimal("11000.00"),
        )

        enrolled = EnrollmentService.bulk_enroll_section(self.sec, course2)
        self.assertEqual(len(enrolled), 2)
        self.assertEqual(Enrollment.objects.filter(course=course2).count(), 2)

    def test_negative_permission_enrollment(self):
        self.client.login(username="student_enr", password="password123")
        response = self.client.get(reverse("enrollments:enrollment_create"))
        self.assertEqual(response.status_code, 403)

        self.client.login(username="teacher_enr", password="password123")
        response = self.client.get(reverse("enrollments:enrollment_create"))
        self.assertEqual(response.status_code, 403)
