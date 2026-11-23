from decimal import Decimal
from django.db import transaction
from apps.users.models import User
from apps.academics.models import CourseSession, Course
from apps.enrollments.models import Enrollment
from .models import Attendance


class AttendanceService:
    @staticmethod
    @transaction.atomic
    def mark_session_attendance(session: CourseSession, attendance_data: dict, marked_by: User):
        """
        attendance_data: dict mapping enrollment_id -> status ('PRESENT', 'ABSENT', 'LATE')
        Saves attendance and marks session.held = True atomically.
        """
        for enrollment_id, status in attendance_data.items():
            enrollment = Enrollment.objects.get(pk=enrollment_id)
            Attendance.objects.update_or_create(
                enrollment=enrollment,
                session=session,
                defaults={
                    "status": status,
                    "marked_by": marked_by,
                },
            )

        session.held = True
        session.taught_by = marked_by
        session.save()
        return True

    @staticmethod
    def get_student_course_attendance(student: User, course: Course):
        held_sessions = CourseSession.objects.filter(course=course, held=True).count()
        attendances = Attendance.objects.filter(enrollment__student=student, session__course=course)
        present_count = attendances.filter(status=Attendance.Status.PRESENT).count()
        absent_count = attendances.filter(status=Attendance.Status.ABSENT).count()
        late_count = attendances.filter(status=Attendance.Status.LATE).count()

        percentage = (present_count / held_sessions * 100) if held_sessions > 0 else 100.0
        remaining_sessions = course.total_sessions_planned - held_sessions
        if remaining_sessions < 0:
            remaining_sessions = 0

        return {
            "course": course,
            "total_planned": course.total_sessions_planned,
            "held_sessions": held_sessions,
            "remaining_sessions": remaining_sessions,
            "present_count": present_count,
            "absent_count": absent_count,
            "late_count": late_count,
            "attendance_percentage": round(percentage, 1),
        }
