from datetime import date
from decimal import Decimal
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Sum, Q
from django.utils import timezone
from apps.core.mixins import AdminRequiredMixin, TeacherRequiredMixin, StudentRequiredMixin
from apps.users.models import User
from apps.enrollments.models import Enrollment
from .models import Payment, Expenditure
from .forms import PaymentForm, ExpenditureForm
from .services import FinanceService


class PaymentListView(AdminRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "")
        payments = Payment.objects.select_related("enrollment__student", "enrollment__course", "received_by").order_by("-paid_on", "-created_at")
        if query:
            payments = payments.filter(
                Q(receipt_no__icontains=query)
                | Q(enrollment__student__username__icontains=query)
                | Q(enrollment__student__first_name__icontains=query)
                | Q(enrollment__course__name__icontains=query)
            )

        total_collected = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        paginator = Paginator(payments, 20)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(
            request,
            "finance/payment_list.html",
            {
                "payments": page_obj,
                "total_collected": total_collected,
                "query": query,
            },
        )


class PaymentCreateView(AdminRequiredMixin, View):
    def get(self, request):
        enrollment_id = request.GET.get("enrollment")
        initial = {}
        if enrollment_id:
            enr = Enrollment.objects.filter(pk=enrollment_id).first()
            if enr:
                initial["enrollment"] = enr
                initial["amount"] = enr.due_amount
        form = PaymentForm(initial=initial)
        return render(request, "finance/payment_form.html", {"form": form})

    def post(self, request):
        form = PaymentForm(request.POST)
        if form.is_valid():
            try:
                payment = FinanceService.record_payment(
                    enrollment=form.cleaned_data["enrollment"],
                    amount=form.cleaned_data["amount"],
                    method=form.cleaned_data["method"],
                    received_by=request.user,
                    paid_on=form.cleaned_data["paid_on"],
                    remarks=form.cleaned_data["remarks"],
                )
                messages.success(request, f"Payment recorded successfully. Receipt No: {payment.receipt_no}")
                return redirect("finance:receipt", pk=payment.pk)
            except Exception as e:
                messages.error(request, f"Payment error: {e}")
        return render(request, "finance/payment_form.html", {"form": form})


class PaymentReceiptView(View):
    def get(self, request, pk):
        if not request.user.is_authenticated:
            return redirect("login")

        payment = get_object_or_404(
            Payment.objects.select_related("enrollment__student__student_profile__section", "enrollment__course", "received_by"),
            pk=pk,
        )

        # Scoped access check: Only Admin or the student who made the payment
        if not (request.user.role == User.Role.ADMIN or request.user.is_superuser or payment.enrollment.student == request.user):
            messages.error(request, "You are not authorized to view this payment receipt.")
            return redirect("dashboard:index")

        return render(request, "finance/receipt.html", {"payment": payment})


class ExpenditureListView(AdminRequiredMixin, View):
    def get(self, request):
        category = request.GET.get("category", "")
        expenses = Expenditure.objects.select_related("recorded_by").order_by("-spent_on", "-created_at")
        if category:
            expenses = expenses.filter(category=category)

        total_expenses = expenses.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        paginator = Paginator(expenses, 20)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        form = ExpenditureForm()
        return render(
            request,
            "finance/expenditure_list.html",
            {
                "expenses": page_obj,
                "total_expenses": total_expenses,
                "selected_category": category,
                "categories": Expenditure.Category.choices,
                "form": form,
            },
        )

    def post(self, request):
        form = ExpenditureForm(request.POST)
        if form.is_valid():
            try:
                exp = FinanceService.record_expenditure(
                    category=form.cleaned_data["category"],
                    purpose=form.cleaned_data["purpose"],
                    amount=form.cleaned_data["amount"],
                    recorded_by=request.user,
                    spent_on=form.cleaned_data["spent_on"],
                )
                messages.success(request, f"Expenditure '{exp.purpose}' recorded.")
            except Exception as e:
                messages.error(request, f"Error recording expense: {e}")
        else:
            messages.error(request, "Please check the form inputs.")
        return redirect("finance:expenditure_list")


class FinancialSummaryView(AdminRequiredMixin, View):
    def get(self, request):
        summary = FinanceService.get_financial_summary()
        recent_payments = Payment.objects.select_related("enrollment__student", "enrollment__course").order_by("-paid_on")[:10]
        recent_expenses = Expenditure.objects.order_by("-spent_on")[:10]
        return render(
            request,
            "finance/financial_summary.html",
            {
                "summary": summary,
                "recent_payments": recent_payments,
                "recent_expenses": recent_expenses,
            },
        )


class TeacherPayrollReportView(AdminRequiredMixin, View):
    def get(self, request):
        today = timezone.localdate()
        year = int(request.GET.get("year", today.year))
        month = int(request.GET.get("month", today.month))

        teachers = User.objects.filter(role=User.Role.TEACHER, is_active=True).order_by("username")
        payroll_list = []
        total_payroll = Decimal("0.00")

        for t in teachers:
            data = FinanceService.calculate_teacher_payroll(t, year, month)
            payroll_list.append(data)
            total_payroll += data["total_salary"]

        months = [
            (1, "January"), (2, "February"), (3, "March"), (4, "April"),
            (5, "May"), (6, "June"), (7, "July"), (8, "August"),
            (9, "September"), (10, "October"), (11, "November"), (12, "December"),
        ]
        return render(
            request,
            "finance/payroll_report.html",
            {
                "payroll_list": payroll_list,
                "total_payroll": total_payroll,
                "current_year": year,
                "current_month": month,
                "months": months,
            },
        )


class TeacherSalaryView(TeacherRequiredMixin, View):
    def get(self, request):
        today = timezone.localdate()
        year = int(request.GET.get("year", today.year))
        month = int(request.GET.get("month", today.month))

        # Teacher sees ONLY their own data
        payroll_data = FinanceService.calculate_teacher_payroll(request.user, year, month)
        months = [
            (1, "January"), (2, "February"), (3, "March"), (4, "April"),
            (5, "May"), (6, "June"), (7, "July"), (8, "August"),
            (9, "September"), (10, "October"), (11, "November"), (12, "December"),
        ]
        return render(
            request,
            "finance/teacher_salary.html",
            {
                "payroll": payroll_data,
                "current_year": year,
                "current_month": month,
                "months": months,
            },
        )


class StudentFeesView(StudentRequiredMixin, View):
    def get(self, request):
        student = request.user
        enrollments = Enrollment.objects.filter(student=student).select_related("course").prefetch_related("payments")

        total_fee = Decimal("0.00")
        total_paid = Decimal("0.00")
        for enr in enrollments:
            total_fee += enr.fee_total
            total_paid += enr.total_paid

        total_due = total_fee - total_paid
        payments = Payment.objects.filter(enrollment__student=student).select_related("enrollment__course").order_by("-paid_on")

        return render(
            request,
            "finance/student_fees.html",
            {
                "enrollments": enrollments,
                "payments": payments,
                "total_fee": total_fee,
                "total_paid": total_paid,
                "total_due": total_due if total_due > Decimal("0.00") else Decimal("0.00"),
            },
        )
