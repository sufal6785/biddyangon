from datetime import date
from decimal import Decimal
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Section, Course, CourseSession
from apps.enrollments.models import Enrollment
from .models import Attendance
from .services import AttendanceService

User = get_user_model()


class AttendanceTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_att", password="password123", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="teacher_att", password="password123", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="student_att", password="password123", role=User.Role.STUDENT
        )

        self.cls = Class.objects.create(name="Class 10", code="c10")
        self.sec = Section.objects.create(academic_class=self.cls, name="Sec-A")
        self.course = Course.objects.create(
            academic_class=self.cls,
            name="English",
            code="ENG-10",
            total_sessions_planned=10,
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            fee_total=Decimal("5000.00"),
        )
        self.session = CourseSession.objects.create(
            course=self.course,
            section=self.sec,
            date=date(2026, 11, 20),
            held=False,
        )

    def test_marking_attendance_sets_session_held(self):
        self.assertFalse(self.session.held)

        attendance_data = {self.enrollment.id: Attendance.Status.PRESENT}
        AttendanceService.mark_session_attendance(self.session, attendance_data, self.teacher)

        self.session.refresh_from_db()
        self.assertTrue(self.session.held)
        self.assertEqual(self.session.taught_by, self.teacher)

        att = Attendance.objects.get(session=self.session, enrollment=self.enrollment)
        self.assertEqual(att.status, Attendance.Status.PRESENT)

        # Check attendance progress
        summary = AttendanceService.get_student_course_attendance(self.student, self.course)
        self.assertEqual(summary["held_sessions"], 1)
        self.assertEqual(summary["present_count"], 1)
        self.assertEqual(summary["attendance_percentage"], 100.0)

    def test_negative_permission_attendance(self):
        # Student cannot mark attendance
        self.client.login(username="student_att", password="password123")
        response = self.client.get(reverse("attendance:mark_attendance"))
        self.assertEqual(response.status_code, 403)
