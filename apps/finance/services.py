from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from django.db.models import Sum
from apps.users.models import User
from apps.enrollments.models import Enrollment
from apps.academics.models import CourseSession
from apps.people.models import TeacherAssignment
from .models import Payment, Expenditure


class FinanceService:
    @staticmethod
    @transaction.atomic
    def record_payment(enrollment: Enrollment, amount: Decimal, method: str, received_by: User, paid_on=None, remarks="") -> Payment:
        if amount <= Decimal("0.00"):
            raise ValidationError("Payment amount must be greater than zero.")

        due = enrollment.due_amount
        if amount > due:
            raise ValidationError(f"Payment amount (৳{amount}) exceeds remaining due (৳{due}).")

        kwargs = {
            "enrollment": enrollment,
            "amount": amount,
            "method": method,
            "received_by": received_by,
            "remarks": remarks,
        }
        if paid_on:
            kwargs["paid_on"] = paid_on

        return Payment.objects.create(**kwargs)

    @staticmethod
    @transaction.atomic
    def record_expenditure(category: str, purpose: str, amount: Decimal, recorded_by: User, spent_on=None) -> Expenditure:
        if amount <= Decimal("0.00"):
            raise ValidationError("Expenditure amount must be greater than zero.")

        kwargs = {
            "category": category,
            "purpose": purpose,
            "amount": amount,
            "recorded_by": recorded_by,
        }
        if spent_on:
            kwargs["spent_on"] = spent_on

        return Expenditure.objects.create(**kwargs)

    @staticmethod
    def get_financial_summary(start_date=None, end_date=None):
        payments_qs = Payment.objects.all()
        expenses_qs = Expenditure.objects.all()

        if start_date:
            payments_qs = payments_qs.filter(paid_on__gte=start_date)
            expenses_qs = expenses_qs.filter(spent_on__gte=start_date)
        if end_date:
            payments_qs = payments_qs.filter(paid_on__lte=end_date)
            expenses_qs = expenses_qs.filter(spent_on__lte=end_date)

        total_revenue = payments_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        total_expenditure = expenses_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        balance = total_revenue - total_expenditure

        return {
            "total_revenue": total_revenue,
            "total_expenditure": total_expenditure,
            "balance": balance,
        }

    @staticmethod
    def calculate_teacher_payroll(teacher: User, year: int, month: int):
        assignments = {
            a.course_id: a.rate_per_session
            for a in TeacherAssignment.objects.filter(teacher=teacher)
        }
        held_sessions = CourseSession.objects.filter(
            taught_by=teacher,
            held=True,
            date__year=year,
            date__month=month,
        ).select_related("course", "section")

        total_salary = Decimal("0.00")
        breakdown = []
        for s in held_sessions:
            rate = assignments.get(s.course_id, Decimal("0.00"))
            total_salary += rate
            breakdown.append({
                "session": s,
                "course": s.course,
                "date": s.date,
                "rate": rate,
            })

        return {
            "teacher": teacher,
            "year": year,
            "month": month,
            "total_sessions": held_sessions.count(),
            "total_salary": total_salary,
            "breakdown": breakdown,
        }
