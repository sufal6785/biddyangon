from datetime import date, time
from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from .models import Class, Section, Course, RoutineSlot, CourseSession
from .services import AcademicService

User = get_user_model()


class AcademicsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_user", password="password123", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="teacher_user", password="password123", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="student_user", password="password123", role=User.Role.STUDENT
        )

        self.cls = Class.objects.create(name="Class 9", code="c9")
        self.sec = Section.objects.create(academic_class=self.cls, name="Section-A")
        self.course = Course.objects.create(
            academic_class=self.cls,
            name="General Science",
            code="GS-9",
            default_fee=Decimal("8000.00"),
            total_sessions_planned=20,
        )

    def test_class_and_course_crud(self):
        self.client.login(username="admin_user", password="password123")
        # Create course
        response = self.client.post(
            reverse("academics:course_create"),
            {
                "academic_class": self.cls.pk,
                "name": "Chemistry",
                "code": "CHEM-9",
                "default_fee": "8500.00",
                "total_sessions_planned": 24,
                "is_active": True,
            },
        )
        self.assertRedirects(response, reverse("academics:course_list"))
        self.assertTrue(Course.objects.filter(code="CHEM-9").exists())

    def test_routine_slot_conflict_detection(self):
        # Create first slot
        slot1 = RoutineSlot(
            section=self.sec,
            course=self.course,
            teacher=self.teacher,
            weekday=RoutineSlot.Weekday.MONDAY,
            start_time=time(9, 0),
            end_time=time(10, 30),
            room="Room 101",
        )
        slot1.full_clean()
        slot1.save()

        # Slot with overlapping section time
        slot_conflict_section = RoutineSlot(
            section=self.sec,
            course=self.course,
            teacher=self.teacher,
            weekday=RoutineSlot.Weekday.MONDAY,
            start_time=time(10, 0),
            end_time=time(11, 0),
            room="Room 102",
        )
        with self.assertRaises(ValidationError):
            slot_conflict_section.full_clean()

    def test_session_generation_from_routine(self):
        RoutineSlot.objects.create(
            section=self.sec,
            course=self.course,
            teacher=self.teacher,
            weekday=0,  # Monday
            start_time=time(9, 0),
            end_time=time(10, 30),
        )
        # Generate for 2 weeks (2026-11-02 Monday to 2026-11-15 Sunday)
        start_date = date(2026, 11, 2)
        end_date = date(2026, 11, 15)
        created_sessions = AcademicService.generate_sessions_from_routine(self.course, start_date, end_date)
        # Should generate 2 sessions (one per Monday)
        self.assertEqual(len(created_sessions), 2)
        self.assertEqual(CourseSession.objects.filter(course=self.course).count(), 2)

    def test_negative_permission_academics(self):
        # Student cannot access course creation view
        self.client.login(username="student_user", password="password123")
        response = self.client.get(reverse("academics:course_create"))
        self.assertEqual(response.status_code, 403)

        # Teacher cannot access course creation view
        self.client.login(username="teacher_user", password="password123")
        response = self.client.get(reverse("academics:course_create"))
        self.assertEqual(response.status_code, 403)
