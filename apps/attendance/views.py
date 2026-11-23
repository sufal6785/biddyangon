from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from apps.core.mixins import TeacherRequiredMixin, StudentRequiredMixin, TeacherOrAdminRequiredMixin
from apps.users.models import User
from apps.academics.models import CourseSession, Course
from apps.enrollments.models import Enrollment
from .models import Attendance
from .services import AttendanceService


class MarkAttendanceView(TeacherOrAdminRequiredMixin, View):
    def get(self, request):
        today = timezone.localdate()
        user = request.user

        # Scoped sessions: Teachers only see courses assigned to them
        if user.role == User.Role.TEACHER:
            assigned_courses = Course.objects.filter(teacher_assignments__teacher=user)
            sessions = CourseSession.objects.filter(course__in=assigned_courses).order_by("-date")
        else:
            sessions = CourseSession.objects.all().order_by("-date")

        session_id = request.GET.get("session_id")
        selected_session = None
        enrollments = []
        existing_attendance = {}

        if session_id:
            selected_session = get_object_or_404(sessions, pk=session_id)
            enrollments = Enrollment.objects.filter(course=selected_session.course, is_active=True).select_related("student")
            existing = Attendance.objects.filter(session=selected_session)
            existing_attendance = {a.enrollment_id: a.status for a in existing}

        return render(
            request,
            "attendance/mark_attendance.html",
            {
                "sessions": sessions[:30],
                "selected_session": selected_session,
                "enrollments": enrollments,
                "existing_attendance": existing_attendance,
            },
        )

    def post(self, request):
        session_id = request.POST.get("session_id")
        session = get_object_or_404(CourseSession, pk=session_id)

        # Teacher authorization check: Must be assigned to this course
        if request.user.role == User.Role.TEACHER:
            if not Course.objects.filter(teacher_assignments__teacher=request.user, pk=session.course_id).exists():
                raise PermissionDenied("You are not assigned to instruct this course.")

        enrollments = Enrollment.objects.filter(course=session.course, is_active=True)
        attendance_data = {}
        for enr in enrollments:
            status = request.POST.get(f"status_{enr.id}", Attendance.Status.ABSENT)
            attendance_data[enr.id] = status

        AttendanceService.mark_session_attendance(session, attendance_data, request.user)
        messages.success(request, f"Attendance recorded for {session}. Session marked as held.")
        return redirect(f"{request.path}?session_id={session.id}")


class StudentAttendanceView(StudentRequiredMixin, View):
    def get(self, request):
        student = request.user
        enrollments = Enrollment.objects.filter(student=student, is_active=True).select_related("course")

        course_summaries = []
        for enr in enrollments:
            summary = AttendanceService.get_student_course_attendance(student, enr.course)
            # Find teacher contact
            assignment = enr.course.teacher_assignments.select_related("teacher").first()
            summary["teacher"] = assignment.teacher if assignment else None
            course_summaries.append(summary)

        recent_logs = Attendance.objects.filter(enrollment__student=student).select_related("session__course").order_by("-session__date")[:15]

        return render(
            request,
            "attendance/student_attendance.html",
            {
                "course_summaries": course_summaries,
                "recent_logs": recent_logs,
            },
        )


class CourseRosterView(TeacherRequiredMixin, View):
    def get(self, request, course_id):
        course = get_object_or_404(Course, pk=course_id)
        # Check teacher assignment
        if not course.teacher_assignments.filter(teacher=request.user).exists():
            raise PermissionDenied("You are not assigned to this course.")

        students = Enrollment.objects.filter(course=course, is_active=True).select_related("student__student_profile__section")
        return render(request, "attendance/roster.html", {"course": course, "students": students})
