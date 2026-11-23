from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.users.models import User
from apps.academics.models import Course, CourseSession
from apps.enrollments.models import Enrollment
from .models import Attendance
from .services import AttendanceService


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_roster_api_view(request, course_id):
    user = request.user
    course = Course.objects.filter(pk=course_id).first()
    if not course:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    # Permission: Admin or teacher assigned to this course
    if user.role == User.Role.TEACHER:
        if not course.teacher_assignments.filter(teacher=user).exists():
            return Response({"error": "You are not assigned to this course."}, status=status.HTTP_403_FORBIDDEN)
    elif user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    enrollments = Enrollment.objects.filter(course=course, is_active=True).select_related(
        "student", "student__student_profile__section"
    ).order_by("student__student_profile__roll_no", "student__username")

    sessions = CourseSession.objects.filter(course=course).order_by("date", "start_time")

    return Response({
        "course": {"id": course.id, "name": course.name, "code": course.code},
        "sessions": [
            {
                "id": s.id,
                "date": str(s.date),
                "start_time": s.start_time.strftime("%H:%M"),
                "end_time": s.end_time.strftime("%H:%M"),
                "topic": s.topic,
                "held": s.held,
            }
            for s in sessions
        ],
        "students": [
            {
                "enrollment_id": e.id,
                "student_id": e.student.id,
                "username": e.student.username,
                "name": e.student.get_full_name() or e.student.username,
                "roll_no": getattr(getattr(e.student, "student_profile", None), "roll_no", "-"),
                "section": str(getattr(getattr(e.student, "student_profile", None), "section", "")),
            }
            for e in enrollments
        ],
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_attendance_api_view(request):
    user = request.user
    if user.role not in [User.Role.ADMIN, User.Role.TEACHER] and not user.is_superuser:
        return Response({"error": "Teacher or Admin required."}, status=status.HTTP_403_FORBIDDEN)

    session_id = request.data.get("session_id")
    attendance_data = request.data.get("attendance", {})  # {enrollment_id: "PRESENT"|"ABSENT"|"LATE"}

    session = CourseSession.objects.filter(pk=session_id).first()
    if not session:
        return Response({"error": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.role == User.Role.TEACHER and not user.is_superuser:
        if not session.course.teacher_assignments.filter(teacher=user).exists():
            return Response({"error": "You are not assigned to teach this course."}, status=status.HTTP_403_FORBIDDEN)

    try:
        AttendanceService.mark_session_attendance(
            session=session,
            attendance_data=attendance_data,
            marked_by=user,
        )
        return Response({"message": f"Attendance recorded successfully for session {session}."})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_attendance_api_view(request):
    user = request.user
    target_student = user
    if user.role in [User.Role.ADMIN, User.Role.TEACHER] or user.is_superuser:
        student_id = request.GET.get("student_id")
        if student_id:
            s = User.objects.filter(pk=student_id, role=User.Role.STUDENT).first()
            if s:
                target_student = s

    if target_student.role != User.Role.STUDENT:
        return Response({"error": "User is not a student."}, status=status.HTTP_400_BAD_REQUEST)

    enrollments = Enrollment.objects.filter(student=target_student, is_active=True).select_related("course")
    results = []

    for enr in enrollments:
        stats = AttendanceService.get_student_course_attendance(target_student, enr.course)
        # History
        history = [
            {
                "session_date": str(att.session.date),
                "topic": att.session.topic,
                "status": att.status,
                "marked_at": att.marked_at.strftime("%Y-%m-%d %H:%M") if att.marked_at else "",
            }
            for att in Attendance.objects.filter(enrollment=enr).select_related("session").order_by("-session__date")
        ]
        results.append({
            "course_id": enr.course.id,
            "course_name": enr.course.name,
            "course_code": enr.course.code,
            "total_planned": stats["total_planned"],
            "held_sessions": stats["held_sessions"],
            "remaining_sessions": stats["remaining_sessions"],
            "present_count": stats["present_count"],
            "absent_count": stats["absent_count"],
            "late_count": stats["late_count"],
            "attendance_percentage": stats["attendance_percentage"],
            "history": history,
        })

    return Response(results)
