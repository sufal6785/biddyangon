from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.users.models import User
from apps.academics.models import Course
from apps.enrollments.models import Enrollment
from .models import Exam, ExamResult, ApprovalStatus, CourseResult
from .services import ResultService


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def exams_api_view(request):
    user = request.user
    if request.method == "GET":
        course_id = request.GET.get("course_id")
        exams = Exam.objects.select_related("course")
        if course_id:
            exams = exams.filter(course_id=course_id)
        if user.role == User.Role.STUDENT:
            # Student can only see scheduled/open/closed exams for enrolled courses
            enrolled_course_ids = Enrollment.objects.filter(student=user, is_active=True).values_list("course_id", flat=True)
            exams = exams.filter(course_id__in=enrolled_course_ids).exclude(status=Exam.ExamStatus.DRAFT)

        data = [
            {
                "id": ex.id,
                "title": ex.title,
                "course_id": ex.course.id,
                "course_name": ex.course.name,
                "course_code": ex.course.code,
                "date": str(ex.date),
                "duration_minutes": ex.duration_minutes,
                "total_marks": float(ex.total_marks),
                "status": ex.status,
                "questions_count": ex.exam_questions.count(),
            }
            for ex in exams
        ]
        return Response(data)

    elif request.method == "POST":
        if user.role != User.Role.ADMIN and not user.is_superuser:
            return Response({"error": "Admin required to create exams."}, status=status.HTTP_403_FORBIDDEN)

        d = request.data
        course_id = d.get("course")
        title = d.get("title", "").strip()
        date = d.get("date")
        duration = d.get("duration_minutes", 60)
        total_marks = Decimal(str(d.get("total_marks", 100)))
        status_val = d.get("status", Exam.ExamStatus.SCHEDULED)

        course = Course.objects.filter(pk=course_id).first()
        if not course or not title or not date:
            return Response({"error": "Valid course, title, and date are required."}, status=status.HTTP_400_BAD_REQUEST)

        exam = Exam.objects.create(
            course=course,
            title=title,
            date=date,
            duration_minutes=int(duration),
            total_marks=total_marks,
            status=status_val,
        )
        return Response({
            "id": exam.id,
            "title": exam.title,
            "course": exam.course.name,
            "date": str(exam.date),
        }, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def enter_marks_api_view(request, exam_id):
    user = request.user
    exam = Exam.objects.filter(pk=exam_id).select_related("course").first()
    if not exam:
        return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

    # Permission: Admin or assigned teacher
    if user.role == User.Role.TEACHER:
        if not exam.course.teacher_assignments.filter(teacher=user).exists():
            return Response({"error": "You are not assigned to teach this course."}, status=status.HTTP_403_FORBIDDEN)
    elif user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        enrollments = Enrollment.objects.filter(course=exam.course, is_active=True).select_related(
            "student", "student__student_profile__section"
        ).order_by("student__student_profile__roll_no", "student__username")

        results_map = {
            r.enrollment_id: {
                "id": r.id,
                "marks_obtained": float(r.marks_obtained),
                "status": r.status,
                "rejection_reason": r.rejection_reason,
            }
            for r in ExamResult.objects.filter(exam=exam)
        }

        students = [
            {
                "enrollment_id": e.id,
                "student_id": e.student.id,
                "username": e.student.username,
                "name": e.student.get_full_name() or e.student.username,
                "roll_no": getattr(getattr(e.student, "student_profile", None), "roll_no", "-"),
                "section": str(getattr(getattr(e.student, "student_profile", None), "section", "")),
                "result": results_map.get(e.id),
            }
            for e in enrollments
        ]

        return Response({
            "exam": {
                "id": exam.id,
                "title": exam.title,
                "course_name": exam.course.name,
                "total_marks": float(exam.total_marks),
            },
            "students": students,
        })

    elif request.method == "POST":
        entries = request.data.get("marks", [])  # list of {enrollment_id, marks_obtained}
        saved_count = 0
        errors = []

        for item in entries:
            enrollment_id = item.get("enrollment_id")
            marks_raw = item.get("marks_obtained")
            if marks_raw is None or marks_raw == "":
                continue

            enr = Enrollment.objects.filter(pk=enrollment_id, course=exam.course).first()
            if not enr:
                errors.append(f"Invalid enrollment ID {enrollment_id}")
                continue

            try:
                marks = Decimal(str(marks_raw))
                ResultService.submit_exam_result(
                    enrollment=enr,
                    exam=exam,
                    marks_obtained=marks,
                    submitted_by=user,
                )
                saved_count += 1
            except Exception as e:
                errors.append(f"Student {enr.student.username}: {str(e)}")

        return Response({
            "message": f"Successfully recorded {saved_count} student marks.",
            "errors": errors,
        })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def approvals_queue_api_view(request):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    pending_results = ExamResult.objects.filter(status=ApprovalStatus.PENDING).select_related(
        "exam", "exam__course", "enrollment__student", "submitted_by"
    ).order_by("-created_at")

    data = [
        {
            "id": r.id,
            "exam_id": r.exam.id,
            "exam_title": r.exam.title,
            "course_name": r.exam.course.name,
            "student_username": r.enrollment.student.username,
            "student_name": r.enrollment.student.get_full_name() or r.enrollment.student.username,
            "marks_obtained": float(r.marks_obtained),
            "total_marks": float(r.exam.total_marks),
            "submitted_by": r.submitted_by.username,
            "submitted_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for r in pending_results
    ]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_result_api_view(request, pk):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    result = ExamResult.objects.filter(pk=pk).first()
    if not result:
        return Response({"error": "Result record not found."}, status=status.HTTP_404_NOT_FOUND)

    ResultService.approve_result(result, user)
    return Response({"message": f"Approved marks for {result.enrollment.student.username} ({result.exam.title})."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_result_api_view(request, pk):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    reason = request.data.get("reason", "").strip()
    if not reason:
        return Response({"error": "Rejection reason is required."}, status=status.HTTP_400_BAD_REQUEST)

    result = ExamResult.objects.filter(pk=pk).first()
    if not result:
        return Response({"error": "Result record not found."}, status=status.HTTP_404_NOT_FOUND)

    ResultService.reject_result(result, user, reason)
    return Response({"message": f"Rejected marks for {result.enrollment.student.username}. Reason: {reason}"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_results_api_view(request):
    user = request.user
    if user.role != User.Role.STUDENT:
        return Response({"error": "Student required."}, status=status.HTTP_403_FORBIDDEN)

    results = ExamResult.objects.filter(
        enrollment__student=user,
        status=ApprovalStatus.APPROVED,
    ).select_related("exam", "exam__course").order_by("-exam__date")

    data = [
        {
            "id": r.id,
            "exam_title": r.exam.title,
            "course_name": r.exam.course.name,
            "course_code": r.exam.course.code,
            "exam_date": str(r.exam.date),
            "marks_obtained": float(r.marks_obtained),
            "total_marks": float(r.exam.total_marks),
            "percentage": round((float(r.marks_obtained) / float(r.exam.total_marks) * 100), 1) if r.exam.total_marks > 0 else 0,
        }
        for r in results
    ]
    return Response(data)
