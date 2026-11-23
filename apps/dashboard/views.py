from decimal import Decimal
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Sum, Count, Q
from django.utils import timezone
from apps.core.mixins import AdminRequiredMixin, TeacherRequiredMixin, StudentRequiredMixin
from apps.users.models import User
from apps.academics.models import Class, Course, CourseSession, RoutineSlot
from apps.people.models import TeacherProfile, StudentProfile, TeacherAssignment
from apps.enrollments.models import Enrollment
from apps.finance.models import Payment, Expenditure
from apps.results.models import Exam, ExamResult, ApprovalStatus
from apps.exams.models import Question
from apps.complaints.models import Complaint
from apps.attendance.models import Attendance


@login_required
def dashboard_dispatcher(request):
    """Central entry point redirecting users to their role-specific dashboard."""
    user = request.user
    if user.role == User.Role.ADMIN or user.is_superuser:
        return redirect("dashboard:admin")
    elif user.role == User.Role.TEACHER:
        return redirect("dashboard:teacher")
    elif user.role == User.Role.STUDENT:
        return redirect("dashboard:student")
    return redirect("login")


class AdminDashboardView(AdminRequiredMixin, View):
    def get(self, request):
        today = timezone.localdate()

        # Metrics counts
        total_students = User.objects.filter(role=User.Role.STUDENT, is_active=True).count()
        total_teachers = User.objects.filter(role=User.Role.TEACHER, is_active=True).count()
        total_courses = Course.objects.filter(is_active=True).count()

        # Financial totals (derived from append-only ledgers)
        total_revenue = Payment.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        total_expenditure = Expenditure.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        net_balance = total_revenue - total_expenditure

        # Pending approvals & open complaints
        pending_results_count = ExamResult.objects.filter(status=ApprovalStatus.PENDING).count()
        pending_questions_count = Question.objects.filter(status=ApprovalStatus.PENDING).count()
        open_complaints_count = Complaint.objects.filter(status__in=[Complaint.Status.OPEN, Complaint.Status.IN_PROGRESS]).count()

        # Recent activities
        recent_payments = Payment.objects.select_related("enrollment__student", "enrollment__course").order_by("-paid_on", "-created_at")[:5]
        recent_complaints = Complaint.objects.select_related("student").order_by("-created_at")[:5]

        context = {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_courses": total_courses,
            "total_revenue": total_revenue,
            "total_expenditure": total_expenditure,
            "net_balance": net_balance,
            "pending_results_count": pending_results_count,
            "pending_questions_count": pending_questions_count,
            "open_complaints_count": open_complaints_count,
            "recent_payments": recent_payments,
            "recent_complaints": recent_complaints,
        }
        return render(request, "dashboard/admin.html", context)


class TeacherDashboardView(TeacherRequiredMixin, View):
    def get(self, request):
        teacher = request.user
        today = timezone.localdate()

        # Assigned courses
        assigned_courses = Course.objects.filter(teacher_assignments__teacher=teacher, is_active=True).distinct()

        # Today's sessions & routine
        today_weekday = today.weekday()
        today_routine = RoutineSlot.objects.filter(teacher=teacher, weekday=today_weekday).select_related("course", "section")

        # Conducted sessions count this month
        sessions_held_month = CourseSession.objects.filter(
            taught_by=teacher,
            held=True,
            date__year=today.year,
            date__month=today.month,
        ).count()

        # Calculate earned salary this month
        assignments = {a.course_id: a.rate_per_session for a in TeacherAssignment.objects.filter(teacher=teacher)}
        monthly_salary = Decimal("0.00")
        for session in CourseSession.objects.filter(taught_by=teacher, held=True, date__year=today.year, date__month=today.month):
            rate = assignments.get(session.course_id, Decimal("0.00"))
            monthly_salary += rate

        # Upcoming exams for assigned courses
        upcoming_exams = Exam.objects.filter(course__in=assigned_courses, date__gte=today).order_by("date")[:5]

        # Pending results submitted by this teacher
        pending_results = ExamResult.objects.filter(submitted_by=teacher, status=ApprovalStatus.PENDING).count()

        context = {
            "teacher": teacher,
            "assigned_courses": assigned_courses,
            "today_routine": today_routine,
            "sessions_held_month": sessions_held_month,
            "monthly_salary": monthly_salary,
            "upcoming_exams": upcoming_exams,
            "pending_results": pending_results,
        }
        return render(request, "dashboard/teacher.html", context)


class StudentDashboardView(StudentRequiredMixin, View):
    def get(self, request):
        student = request.user
        today = timezone.localdate()

        # Enrolled courses
        enrollments = Enrollment.objects.filter(student=student, is_active=True).select_related("course")

        # Total fee, paid, and total due
        total_fee = enrollments.aggregate(total=Sum("fee_total"))["total"] or Decimal("0.00")
        total_paid = Payment.objects.filter(enrollment__student=student).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        total_due = total_fee - total_paid
        if total_due < Decimal("0.00"):
            total_due = Decimal("0.00")

        # Attendance calculation
        attendances = Attendance.objects.filter(enrollment__student=student)
        total_attended_sessions = attendances.count()
        present_count = attendances.filter(status=Attendance.Status.PRESENT).count()
        attendance_percentage = (present_count / total_attended_sessions * 100) if total_attended_sessions > 0 else 100.0

        # Upcoming exams
        course_ids = [e.course_id for e in enrollments]
        upcoming_exams = Exam.objects.filter(course_id__in=course_ids, date__gte=today).order_by("date")[:5]

        # Recent exam results
        recent_results = ExamResult.objects.filter(
            enrollment__student=student,
            status=ApprovalStatus.APPROVED,
        ).select_related("exam__course").order_by("-exam__date")[:5]

        context = {
            "student": student,
            "profile": getattr(student, "student_profile", None),
            "enrollments": enrollments,
            "total_fee": total_fee,
            "total_paid": total_paid,
            "total_due": total_due,
            "attendance_percentage": round(attendance_percentage, 1),
            "upcoming_exams": upcoming_exams,
            "recent_results": recent_results,
        }
        return render(request, "dashboard/student.html", context)
