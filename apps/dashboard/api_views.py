from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.utils import timezone
from apps.users.models import User
from apps.academics.models import Course, CourseSession, RoutineSlot
from apps.people.models import TeacherAssignment
from apps.enrollments.models import Enrollment
from apps.finance.models import Payment, Expenditure
from apps.results.models import Exam, ExamResult, ApprovalStatus
from apps.exams.models import Question
from apps.complaints.models import Complaint
from apps.attendance.models import Attendance


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard_api_view(request):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)

    total_students = User.objects.filter(role=User.Role.STUDENT, is_active=True).count()
    total_teachers = User.objects.filter(role=User.Role.TEACHER, is_active=True).count()
    total_courses = Course.objects.filter(is_active=True).count()

    total_revenue = Payment.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    total_expenditure = Expenditure.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    net_balance = total_revenue - total_expenditure

    pending_results_count = ExamResult.objects.filter(status=ApprovalStatus.PENDING).count()
    pending_questions_count = Question.objects.filter(status=ApprovalStatus.PENDING).count()
    open_complaints_count = Complaint.objects.filter(
        status__in=[Complaint.Status.OPEN, Complaint.Status.IN_PROGRESS]
    ).count()

    recent_payments = [
        {
            "id": p.id,
            "receipt_no": p.receipt_no,
            "student_name": p.enrollment.student.get_full_name() or p.enrollment.student.username,
            "course_name": p.enrollment.course.name,
            "amount": float(p.amount),
            "paid_on": str(p.paid_on),
        }
        for p in Payment.objects.select_related("enrollment__student", "enrollment__course").order_by("-paid_on", "-created_at")[:5]
    ]

    recent_complaints = [
        {
            "id": c.id,
            "subject": c.subject,
            "student_username": c.student.username,
            "status": c.status,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for c in Complaint.objects.select_related("student").order_by("-created_at")[:5]
    ]

    return Response({
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_courses": total_courses,
        "total_revenue": float(total_revenue),
        "total_expenditure": float(total_expenditure),
        "net_balance": float(net_balance),
        "pending_results_count": pending_results_count,
        "pending_questions_count": pending_questions_count,
        "open_complaints_count": open_complaints_count,
        "recent_payments": recent_payments,
        "recent_complaints": recent_complaints,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def teacher_dashboard_api_view(request):
    teacher = request.user
    if teacher.role != User.Role.TEACHER and not teacher.is_superuser:
        return Response({"error": "Teacher permission required."}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.localdate()
    assigned_courses = Course.objects.filter(teacher_assignments__teacher=teacher, is_active=True).distinct()

    today_routine = [
        {
            "id": slot.id,
            "course_name": slot.course.name,
            "section_name": slot.section.name,
            "start_time": slot.start_time.strftime("%H:%M"),
            "end_time": slot.end_time.strftime("%H:%M"),
            "room": slot.room or "TBD",
        }
        for slot in RoutineSlot.objects.filter(teacher=teacher, weekday=today.weekday()).select_related("course", "section")
    ]

    sessions_held_month = CourseSession.objects.filter(
        taught_by=teacher,
        held=True,
        date__year=today.year,
        date__month=today.month,
    ).count()

    assignments = {a.course_id: a.rate_per_session for a in TeacherAssignment.objects.filter(teacher=teacher)}
    monthly_salary = Decimal("0.00")
    for session in CourseSession.objects.filter(taught_by=teacher, held=True, date__year=today.year, date__month=today.month):
        monthly_salary += assignments.get(session.course_id, Decimal("0.00"))

    upcoming_exams = [
        {
            "id": ex.id,
            "title": ex.title,
            "course_name": ex.course.name,
            "date": str(ex.date),
            "total_marks": float(ex.total_marks),
        }
        for ex in Exam.objects.filter(course__in=assigned_courses, date__gte=today).order_by("date")[:5]
    ]

    pending_results = ExamResult.objects.filter(submitted_by=teacher, status=ApprovalStatus.PENDING).count()

    return Response({
        "assigned_courses_count": assigned_courses.count(),
        "today_routine": today_routine,
        "sessions_held_month": sessions_held_month,
        "monthly_salary": float(monthly_salary),
        "upcoming_exams": upcoming_exams,
        "pending_results": pending_results,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_dashboard_api_view(request):
    student = request.user
    if student.role != User.Role.STUDENT:
        return Response({"error": "Student permission required."}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.localdate()
    enrollments = Enrollment.objects.filter(student=student, is_active=True).select_related("course")

    total_fee = enrollments.aggregate(total=Sum("fee_total"))["total"] or Decimal("0.00")
    total_paid = Payment.objects.filter(enrollment__student=student).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
    total_due = total_fee - total_paid
    if total_due < Decimal("0.00"):
        total_due = Decimal("0.00")

    attendances = Attendance.objects.filter(enrollment__student=student)
    total_attended = attendances.count()
    present_count = attendances.filter(status=Attendance.Status.PRESENT).count()
    attendance_pct = (present_count / total_attended * 100) if total_attended > 0 else 100.0

    course_ids = [e.course_id for e in enrollments]
    upcoming_exams = [
        {
            "id": ex.id,
            "title": ex.title,
            "course_name": ex.course.name,
            "date": str(ex.date),
            "total_marks": float(ex.total_marks),
        }
        for ex in Exam.objects.filter(course_id__in=course_ids, date__gte=today).order_by("date")[:5]
    ]

    recent_results = [
        {
            "id": r.id,
            "exam_title": r.exam.title,
            "course_name": r.exam.course.name,
            "marks_obtained": float(r.marks_obtained),
            "total_marks": float(r.exam.total_marks),
            "date": str(r.exam.date),
        }
        for r in ExamResult.objects.filter(enrollment__student=student, status=ApprovalStatus.APPROVED).select_related("exam__course").order_by("-exam__date")[:5]
    ]

    enrolled_courses = [
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

    return Response({
        "enrolled_courses": enrolled_courses,
        "total_fee": float(total_fee),
        "total_paid": float(total_paid),
        "total_due": float(total_due),
        "attendance_percentage": round(attendance_pct, 1),
        "upcoming_exams": upcoming_exams,
        "recent_results": recent_results,
    })
