from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.users.models import User
from apps.enrollments.models import Enrollment
from .models import Payment, Expenditure
from .services import FinanceService


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def payments_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        payments = Payment.objects.select_related("enrollment__student", "enrollment__course").order_by("-paid_on", "-created_at")
        data = [
            {
                "id": p.id,
                "receipt_no": p.receipt_no,
                "student_id": p.enrollment.student.id,
                "student_name": p.enrollment.student.get_full_name() or p.enrollment.student.username,
                "student_username": p.enrollment.student.username,
                "course_name": p.enrollment.course.name,
                "amount": float(p.amount),
                "method": p.method,
                "method_display": p.get_method_display(),
                "paid_on": str(p.paid_on),
                "remarks": p.remarks,
            }
            for p in payments
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        enrollment_id = d.get("enrollment")
        amount = Decimal(str(d.get("amount", 0)))
        method = d.get("method", Payment.PaymentMethod.CASH)
        remarks = d.get("remarks", "")
        paid_on = d.get("paid_on")

        enr = Enrollment.objects.filter(pk=enrollment_id).first()
        if not enr:
            return Response({"error": "Valid enrollment required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = FinanceService.record_payment(
                enrollment=enr,
                amount=amount,
                method=method,
                received_by=request.user,
                paid_on=paid_on,
                remarks=remarks,
            )
            return Response({
                "id": payment.id,
                "receipt_no": payment.receipt_no,
                "amount": float(payment.amount),
                "remaining_due": float(enr.due_amount),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payment_receipt_api_view(request, pk):
    payment = Payment.objects.select_related(
        "enrollment__student__student_profile__section", "enrollment__course", "received_by"
    ).filter(pk=pk).first()

    if not payment:
        return Response({"error": "Receipt not found."}, status=status.HTTP_404_NOT_FOUND)

    # Scoped access
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser and payment.enrollment.student != request.user:
        return Response({"error": "Not authorized to view this receipt."}, status=status.HTTP_403_FORBIDDEN)

    return Response({
        "id": payment.id,
        "receipt_no": payment.receipt_no,
        "student_name": payment.enrollment.student.get_full_name() or payment.enrollment.student.username,
        "student_username": payment.enrollment.student.username,
        "section": str(getattr(payment.enrollment.student.student_profile, "section", "General")),
        "course_name": payment.enrollment.course.name,
        "course_code": payment.enrollment.course.code,
        "course_fee_total": float(payment.enrollment.fee_total),
        "amount_paid": float(payment.amount),
        "remaining_due": float(payment.enrollment.due_amount),
        "method": payment.get_method_display(),
        "paid_on": str(payment.paid_on),
        "received_by": payment.received_by.get_full_name() or payment.received_by.username,
        "remarks": payment.remarks,
        "created_at": payment.created_at.strftime("%Y-%m-%d %H:%M"),
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def expenditures_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        expenses = Expenditure.objects.select_related("recorded_by").order_by("-spent_on", "-created_at")
        data = [
            {
                "id": ex.id,
                "category": ex.category,
                "category_display": ex.get_category_display(),
                "purpose": ex.purpose,
                "amount": float(ex.amount),
                "spent_on": str(ex.spent_on),
                "recorded_by": ex.recorded_by.username,
            }
            for ex in expenses
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        category = d.get("category", Expenditure.Category.OTHER)
        purpose = d.get("purpose", "").strip()
        amount = Decimal(str(d.get("amount", 0)))
        spent_on = d.get("spent_on")

        if not purpose or amount <= 0:
            return Response({"error": "Valid purpose and positive amount required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            exp = FinanceService.record_expenditure(category, purpose, amount, request.user, spent_on)
            return Response({"id": exp.id, "amount": float(exp.amount)}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def financial_summary_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    summary = FinanceService.get_financial_summary()
    return Response({
        "total_revenue": float(summary["total_revenue"]),
        "total_expenditure": float(summary["total_expenditure"]),
        "balance": float(summary["balance"]),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def payroll_report_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.localdate()
    year = int(request.GET.get("year", today.year))
    month = int(request.GET.get("month", today.month))

    teachers = User.objects.filter(role=User.Role.TEACHER, is_active=True).order_by("username")
    payroll_list = []
    total_payroll = Decimal("0.00")

    for t in teachers:
        p = FinanceService.calculate_teacher_payroll(t, year, month)
        payroll_list.append({
            "teacher_id": t.id,
            "teacher_name": t.get_full_name() or t.username,
            "teacher_username": t.username,
            "designation": getattr(t.teacher_profile, "designation", "Instructor"),
            "total_sessions": p["total_sessions"],
            "total_salary": float(p["total_salary"]),
        })
        total_payroll += p["total_salary"]

    return Response({
        "year": year,
        "month": month,
        "total_payroll": float(total_payroll),
        "payroll_list": payroll_list,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_salary_api_view(request):
    if request.user.role != User.Role.TEACHER:
        return Response({"error": "Teacher required."}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.localdate()
    year = int(request.GET.get("year", today.year))
    month = int(request.GET.get("month", today.month))

    payroll = FinanceService.calculate_teacher_payroll(request.user, year, month)
    breakdown = [
        {
            "date": str(item["date"]),
            "course_name": item["course"].name,
            "section_name": item["session"].section.name,
            "topic": item["session"].topic or "Class Lecture",
            "rate": float(item["rate"]),
        }
        for item in payroll["breakdown"]
    ]

    return Response({
        "year": year,
        "month": month,
        "total_sessions": payroll["total_sessions"],
        "total_salary": float(payroll["total_salary"]),
        "breakdown": breakdown,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_fees_api_view(request):
    if request.user.role != User.Role.STUDENT:
        return Response({"error": "Student required."}, status=status.HTTP_403_FORBIDDEN)

    student = request.user
    enrollments = Enrollment.objects.filter(student=student).select_related("course").prefetch_related("payments")

    courses_list = [
        {
            "id": e.id,
            "course_name": e.course.name,
            "course_code": e.course.code,
            "fee_total": float(e.fee_total),
            "total_paid": float(e.total_paid),
            "due_amount": float(e.due_amount),
            "is_cleared": e.is_cleared,
        }
        for e in enrollments
    ]

    payments = Payment.objects.filter(enrollment__student=student).select_related("enrollment__course").order_by("-paid_on")
    payments_list = [
        {
            "id": p.id,
            "receipt_no": p.receipt_no,
            "course_name": p.enrollment.course.name,
            "amount": float(p.amount),
            "method": p.get_method_display(),
            "paid_on": str(p.paid_on),
        }
        for p in payments
    ]

    return Response({
        "courses": courses_list,
        "payments": payments_list,
    })
