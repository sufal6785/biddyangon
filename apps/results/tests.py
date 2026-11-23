from decimal import Decimal
from datetime import date
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Course
from apps.enrollments.models import Enrollment
from .models import Exam, ExamResult, ApprovalStatus
from .services import ResultService

User = get_user_model()


class ResultsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_res", password="password123", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="teacher_res", password="password123", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="student_res", password="password123", role=User.Role.STUDENT
        )

        self.cls = Class.objects.create(name="Class 10", code="c10")
        self.course = Course.objects.create(academic_class=self.cls, name="ICT", code="ICT-10")
        self.enrollment = Enrollment.objects.create(
            student=self.student, course=self.course, fee_total=Decimal("6000.00")
        )
        self.exam = Exam.objects.create(
            course=self.course,
            title="ICT First Term",
            date=date(2026, 11, 25),
            total_marks=Decimal("50.00"),
        )

    def test_results_approval_workflow(self):
        # Teacher submits marks -> status PENDING
        res = ResultService.submit_exam_result(
            enrollment=self.enrollment,
            exam=self.exam,
            marks_obtained=Decimal("45.00"),
            submitted_by=self.teacher,
        )
        self.assertEqual(res.status, ApprovalStatus.PENDING)

        # Student views own results -> NOT visible yet (only APPROVED visible)
        self.client.login(username="student_res", password="password123")
        response = self.client.get(reverse("results:my_results"))
        self.assertNotContains(response, "ICT First Term")

        # Admin approves result
        ResultService.approve_result(res, self.admin)
        res.refresh_from_db()
        self.assertEqual(res.status, ApprovalStatus.APPROVED)
        self.assertEqual(res.approved_by, self.admin)

        # Student views own results now -> Visible!
        response = self.client.get(reverse("results:my_results"))
        self.assertContains(response, "ICT First Term")

    def test_negative_permission_results(self):
        # Student cannot access admin approvals queue
        self.client.login(username="student_res", password="password123")
        response = self.client.get(reverse("results:approval_queue"))
        self.assertEqual(response.status_code, 403)

        # Teacher cannot access admin approvals queue
        self.client.login(username="teacher_res", password="password123")
        response = self.client.get(reverse("results:approval_queue"))
        self.assertEqual(response.status_code, 403)
