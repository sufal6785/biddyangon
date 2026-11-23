from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Section, Course
from .models import TeacherProfile, StudentProfile, TeacherAssignment

User = get_user_model()


class PeopleManagementTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_staff", password="password123", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="teacher_staff", password="password123", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="student_staff", password="password123", role=User.Role.STUDENT
        )

        self.cls = Class.objects.create(name="HSC 2026", code="hsc26")
        self.sec = Section.objects.create(academic_class=self.cls, name="Science-1")
        self.course = Course.objects.create(
            academic_class=self.cls,
            name="Biology",
            code="BIO-12",
            default_fee=Decimal("9000.00"),
        )

    def test_atomic_student_creation_with_formatted_username(self):
        self.client.login(username="admin_staff", password="password123")
        response = self.client.post(
            reverse("people:student_create"),
            {
                "first_name": "Arif",
                "last_name": "Hossain",
                "section": self.sec.pk,
                "roll_no": 15,
                "email": "arif@test.com",
                "phone": "01999888777",
                "location": "Mirpur, Dhaka",
                "guardian_name": "Belal Hossain",
                "guardian_phone": "01999888770",
                "password": "temp_password_123",
            },
        )
        self.assertRedirects(response, reverse("people:student_list"))

        # Check auto-generated username: hsc26-015
        student_user = User.objects.get(username="hsc26-015")
        self.assertEqual(student_user.role, User.Role.STUDENT)
        self.assertEqual(student_user.first_name, "Arif")
        self.assertTrue(hasattr(student_user, "student_profile"))
        self.assertEqual(student_user.student_profile.roll_no, 15)
        self.assertEqual(student_user.student_profile.section, self.sec)

    def test_teacher_assignment_creation(self):
        self.client.login(username="admin_staff", password="password123")
        response = self.client.post(
            reverse("people:assignment_list"),
            {
                "teacher": self.teacher.pk,
                "course": self.course.pk,
                "rate_per_session": "1200.00",
            },
        )
        self.assertRedirects(response, reverse("people:assignment_list"))
        self.assertTrue(
            TeacherAssignment.objects.filter(teacher=self.teacher, course=self.course, rate_per_session=Decimal("1200.00")).exists()
        )

    def test_negative_permission_people(self):
        self.client.login(username="student_staff", password="password123")
        response = self.client.get(reverse("people:teacher_list"))
        self.assertEqual(response.status_code, 403)

        response = self.client.get(reverse("people:student_list"))
        self.assertEqual(response.status_code, 403)
