from decimal import Decimal
from datetime import date
from django.test import TestCase, Client
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from apps.academics.models import Class, Section, Course, CourseSession
from apps.people.models import TeacherAssignment
from apps.enrollments.models import Enrollment
from .models import Payment, Expenditure
from .services import FinanceService

User = get_user_model()


class FinanceTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_fin", password="password123", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="teacher_fin", password="password123", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="student_fin", password="password123", role=User.Role.STUDENT
        )
        self.other_student = User.objects.create_user(
            username="student_other", password="password123", role=User.Role.STUDENT
        )

        self.cls = Class.objects.create(name="Class 12", code="c12")
        self.course = Course.objects.create(
            academic_class=self.cls,
            name="Chemistry 2nd",
            code="CHEM-12",
            default_fee=Decimal("15000.00"),
        )
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            course=self.course,
            fee_total=Decimal("15000.00"),
        )
        TeacherAssignment.objects.create(
            teacher=self.teacher,
            course=self.course,
            rate_per_session=Decimal("1200.00"),
        )

    def test_payment_recording_and_due_calculation(self):
        # Initial due
        self.assertEqual(self.enrollment.due_amount, Decimal("15000.00"))

        # Record payment of 6000
        payment = FinanceService.record_payment(
            enrollment=self.enrollment,
            amount=Decimal("6000.00"),
            method=Payment.PaymentMethod.BKASH,
            received_by=self.admin,
        )
        self.assertTrue(payment.receipt_no.startswith("RCP-"))
        self.assertEqual(self.enrollment.total_paid, Decimal("6000.00"))
        self.assertEqual(self.enrollment.due_amount, Decimal("9000.00"))
        self.assertFalse(self.enrollment.is_cleared)

        # Clear remaining due
        FinanceService.record_payment(
            enrollment=self.enrollment,
            amount=Decimal("9000.00"),
            method=Payment.PaymentMethod.CASH,
            received_by=self.admin,
        )
        self.assertEqual(self.enrollment.total_paid, Decimal("15000.00"))
        self.assertEqual(self.enrollment.due_amount, Decimal("0.00"))
        self.assertTrue(self.enrollment.is_cleared)

    def test_overpayment_validation(self):
        # Attempting to pay 16000 when fee is 15000 should raise ValidationError
        with self.assertRaises(ValidationError):
            FinanceService.record_payment(
                enrollment=self.enrollment,
                amount=Decimal("16000.00"),
                method=Payment.PaymentMethod.CASH,
                received_by=self.admin,
            )

    def test_append_only_payment_immutability(self):
        payment = FinanceService.record_payment(
            enrollment=self.enrollment,
            amount=Decimal("2000.00"),
            method=Payment.PaymentMethod.CASH,
            received_by=self.admin,
        )
        # Attempt to update
        payment.amount = Decimal("3000.00")
        with self.assertRaises(ValidationError):
            payment.save()

        # Attempt to delete
        with self.assertRaises(ValidationError):
            payment.delete()

    def test_append_only_expenditure_immutability(self):
        exp = FinanceService.record_expenditure(
            category=Expenditure.Category.UTILITIES,
            purpose="Internet bill",
            amount=Decimal("1500.00"),
            recorded_by=self.admin,
        )
        with self.assertRaises(ValidationError):
            exp.delete()

    def test_dynamic_teacher_salary_calculation(self):
        sec = Section.objects.create(academic_class=self.cls, name="Sec-Chem")
        # 3 sessions held in November 2026
        for day in [5, 12, 19]:
            CourseSession.objects.create(
                course=self.course,
                section=sec,
                taught_by=self.teacher,
                date=date(2026, 11, day),
                held=True,
            )
        # 1 scheduled but not held session
        CourseSession.objects.create(
            course=self.course,
            section=sec,
            taught_by=self.teacher,
            date=date(2026, 11, 26),
            held=False,
        )

        payroll = FinanceService.calculate_teacher_payroll(self.teacher, 2026, 11)
        self.assertEqual(payroll["total_sessions"], 3)
        # 3 sessions * 1200.00 rate = 3600.00
        self.assertEqual(payroll["total_salary"], Decimal("3600.00"))

    def test_negative_permission_finance(self):
        payment = FinanceService.record_payment(
            enrollment=self.enrollment,
            amount=Decimal("1000.00"),
            method=Payment.PaymentMethod.CASH,
            received_by=self.admin,
        )
        # Other student cannot view this receipt
        self.client.login(username="student_other", password="password123")
        response = self.client.get(reverse("finance:receipt", kwargs={"pk": payment.pk}))
        self.assertRedirects(response, reverse("dashboard:index"), target_status_code=302)

        # Student cannot access payroll report
        response = self.client.get(reverse("finance:payroll_report"))
        self.assertEqual(response.status_code, 403)
