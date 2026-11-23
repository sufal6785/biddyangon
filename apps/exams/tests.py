from decimal import Decimal
from datetime import date
from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Course
from apps.enrollments.models import Enrollment
from apps.finance.models import Payment
from apps.results.models import Exam, ExamResult
from .models import Question, ExamQuestion, ExamAttempt
from .services import ExamService

User = get_user_model()


class OnlineExamsAndFeeGateTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_exam", password="password123", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="teacher_exam", password="password123", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="student_exam", password="password123", role=User.Role.STUDENT
        )

        self.cls = Class.objects.create(name="Class 10", code="c10")
        self.course = Course.objects.create(academic_class=self.cls, name="Biology", code="BIO-10")

        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            fee_total=Decimal("8000.00"),
        )

        self.exam = Exam.objects.create(
            course=self.course,
            title="Cell Biology MCQ Assessment",
            date=date(2026, 12, 5),
            duration_minutes=30,
            total_marks=Decimal("2.00"),
            status=Exam.ExamStatus.OPEN,
        )

        self.q1 = Question.objects.create(
            course=self.course,
            text="Which organelle is the powerhouse of the cell?",
            option_a="Ribosome",
            option_b="Mitochondria",
            option_c="Nucleus",
            option_d="Chloroplast",
            correct_option="B",
            marks=Decimal("1.00"),
            submitted_by=self.teacher,
        )
        self.q2 = Question.objects.create(
            course=self.course,
            text="Which molecule carries genetic information?",
            option_a="DNA",
            option_b="Lipid",
            option_c="Glucose",
            option_d="ATP",
            correct_option="A",
            marks=Decimal("1.00"),
            submitted_by=self.teacher,
        )

        ExamQuestion.objects.create(exam=self.exam, question=self.q1, order=1)
        ExamQuestion.objects.create(exam=self.exam, question=self.q2, order=2)

    def test_fee_gate_blocks_unpaid_student(self):
        # Student has 8000.00 due
        self.assertEqual(self.enrollment.due_amount, Decimal("8000.00"))
        self.assertFalse(self.enrollment.is_cleared)

        self.client.login(username="student_exam", password="password123")
        # Attempting to start the exam must return 403 Forbidden!
        response = self.client.get(reverse("exams:take_exam", kwargs={"pk": self.exam.pk}))
        self.assertEqual(response.status_code, 403)

        # Attempting to post answers directly must also return 403 Forbidden!
        response = self.client.post(
            reverse("exams:take_exam", kwargs={"pk": self.exam.pk}),
            {f"q_{self.q1.id}": "B", f"q_{self.q2.id}": "A"},
        )
        self.assertEqual(response.status_code, 403)

    def test_fee_cleared_student_takes_exam_and_auto_grades(self):
        # Pay the 8000.00 fee in full
        Payment.objects.create(
            enrollment=self.enrollment,
            amount=Decimal("8000.00"),
            received_by=self.admin,
        )
        self.assertEqual(self.enrollment.due_amount, Decimal("0.00"))
        self.assertTrue(self.enrollment.is_cleared)

        self.client.login(username="student_exam", password="password123")
        # Can now access exam page
        response = self.client.get(reverse("exams:take_exam", kwargs={"pk": self.exam.pk}))
        self.assertEqual(response.status_code, 200)

        # Submit answers: q1 correct ('B'), q2 incorrect ('C')
        response = self.client.post(
            reverse("exams:take_exam", kwargs={"pk": self.exam.pk}),
            {f"q_{self.q1.id}": "B", f"q_{self.q2.id}": "C"},
        )
        attempt = ExamAttempt.objects.get(exam=self.exam, student=self.student)
        self.assertRedirects(response, reverse("exams:attempt_result", kwargs={"pk": attempt.pk}))

        # Auto-graded score should be 1.00 out of 2.00
        self.assertEqual(attempt.score, Decimal("1.00"))
        self.assertTrue(attempt.is_completed)

        # Automatically created ExamResult
        res = ExamResult.objects.get(exam=self.exam, enrollment=self.enrollment)
        self.assertEqual(res.marks_obtained, Decimal("1.00"))
