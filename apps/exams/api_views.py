from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from apps.users.models import User
from apps.academics.models import Course
from apps.enrollments.models import Enrollment
from apps.results.models import Exam, ApprovalStatus
from .models import Question, ExamQuestion, ExamAttempt, ExamAnswer
from .services import ExamService


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def questions_api_view(request):
    user = request.user
    if user.role not in [User.Role.ADMIN, User.Role.TEACHER] and not user.is_superuser:
        return Response({"error": "Staff permission required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        course_id = request.GET.get("course_id")
        status_filter = request.GET.get("status")

        qs = Question.objects.select_related("course", "submitted_by")
        if course_id:
            qs = qs.filter(course_id=course_id)
        if status_filter:
            qs = qs.filter(status=status_filter)

        if user.role == User.Role.TEACHER and not user.is_superuser:
            # Teacher sees approved questions + their own questions
            qs = qs.filter(status=ApprovalStatus.APPROVED) | qs.filter(submitted_by=user)

        data = [
            {
                "id": q.id,
                "course_id": q.course.id,
                "course_name": q.course.name,
                "text": q.text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "correct_option": q.correct_option,
                "marks": float(q.marks),
                "status": q.status,
                "rejection_reason": q.rejection_reason,
                "submitted_by": q.submitted_by.username,
                "created_at": q.created_at.strftime("%Y-%m-%d"),
            }
            for q in qs.distinct()
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        course_id = d.get("course")
        text = d.get("text", "").strip()
        opt_a = d.get("option_a", "").strip()
        opt_b = d.get("option_b", "").strip()
        opt_c = d.get("option_c", "").strip()
        opt_d = d.get("option_d", "").strip()
        correct = d.get("correct_option", "").strip().upper()
        marks = Decimal(str(d.get("marks", 1.0)))

        course = Course.objects.filter(pk=course_id).first()
        if not course or not text or not opt_a or not opt_b or not opt_c or not opt_d or correct not in ["A", "B", "C", "D"]:
            return Response({"error": "All question fields and valid correct option (A-D) are required."}, status=status.HTTP_400_BAD_REQUEST)

        is_admin = user.role == User.Role.ADMIN or user.is_superuser
        question = Question.objects.create(
            course=course,
            text=text,
            option_a=opt_a,
            option_b=opt_b,
            option_c=opt_c,
            option_d=opt_d,
            correct_option=correct,
            marks=marks,
            submitted_by=user,
            status=ApprovalStatus.APPROVED if is_admin else ApprovalStatus.PENDING,
            approved_by=user if is_admin else None,
        )
        return Response({"id": question.id, "status": question.status}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_question_api_view(request, pk):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    q = Question.objects.filter(pk=pk).first()
    if not q:
        return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

    q.status = ApprovalStatus.APPROVED
    q.approved_by = user
    q.rejection_reason = ""
    q.save()
    return Response({"message": f"Question {q.id} approved."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_question_api_view(request, pk):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    reason = request.data.get("reason", "").strip()
    if not reason:
        return Response({"error": "Rejection reason required."}, status=status.HTTP_400_BAD_REQUEST)

    q = Question.objects.filter(pk=pk).first()
    if not q:
        return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

    q.status = ApprovalStatus.REJECTED
    q.approved_by = user
    q.rejection_reason = reason
    q.save()
    return Response({"message": f"Question {q.id} rejected."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_questions_to_exam_api_view(request, exam_id):
    user = request.user
    if user.role not in [User.Role.ADMIN, User.Role.TEACHER] and not user.is_superuser:
        return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

    exam = Exam.objects.filter(pk=exam_id).first()
    if not exam:
        return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

    question_ids = request.data.get("question_ids", [])
    added = 0
    order_start = exam.exam_questions.count() + 1

    for qid in question_ids:
        q = Question.objects.filter(pk=qid, course=exam.course, status=ApprovalStatus.APPROVED).first()
        if q:
            eq, created = ExamQuestion.objects.get_or_create(exam=exam, question=q, defaults={"order": order_start + added})
            if created:
                added += 1

    return Response({"message": f"Added {added} approved questions to {exam.title}."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def student_exams_api_view(request):
    user = request.user
    if user.role != User.Role.STUDENT:
        return Response({"error": "Student required."}, status=status.HTTP_403_FORBIDDEN)

    enrollments = Enrollment.objects.filter(student=user, is_active=True).select_related("course")
    enrolled_courses = {e.course_id: e for e in enrollments}

    exams = Exam.objects.filter(course_id__in=enrolled_courses.keys()).exclude(
        status=Exam.ExamStatus.DRAFT
    ).select_related("course").order_by("-date")

    attempts_map = {
        a.exam_id: a for a in ExamAttempt.objects.filter(student=user, exam__in=exams)
    }

    data = []
    for ex in exams:
        enr = enrolled_courses.get(ex.course_id)
        att = attempts_map.get(ex.id)
        data.append({
            "id": ex.id,
            "title": ex.title,
            "course_name": ex.course.name,
            "course_code": ex.course.code,
            "date": str(ex.date),
            "duration_minutes": ex.duration_minutes,
            "total_marks": float(ex.total_marks),
            "status": ex.status,
            "is_cleared": enr.is_cleared if enr else False,
            "due_amount": float(enr.due_amount) if enr else 0.0,
            "attempt": {
                "id": att.id,
                "is_completed": att.is_completed,
                "score": float(att.score),
                "started_at": att.started_at.strftime("%Y-%m-%d %H:%M"),
                "submitted_at": att.submitted_at.strftime("%Y-%m-%d %H:%M") if att.submitted_at else None,
            } if att else None,
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def take_exam_api_view(request, exam_id):
    """
    STRICT SERVER-SIDE FEE GATE:
    Student CANNOT take exam if course due > 0.
    """
    user = request.user
    if user.role != User.Role.STUDENT:
        return Response({"error": "Student required."}, status=status.HTTP_403_FORBIDDEN)

    exam = Exam.objects.filter(pk=exam_id).select_related("course").first()
    if not exam:
        return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

    enr = Enrollment.objects.filter(student=user, course=exam.course, is_active=True).first()
    if not enr:
        return Response({"error": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

    if not enr.is_cleared:
        return Response({
            "error": "Access Denied: You have an outstanding tuition balance. Course fees must be 100% cleared before taking this assessment.",
            "due_amount": float(enr.due_amount),
            "course_name": exam.course.name,
        }, status=status.HTTP_403_FORBIDDEN)

    attempt, _ = ExamAttempt.objects.get_or_create(exam=exam, student=user)
    if attempt.is_completed:
        return Response({
            "error": "You have already completed and submitted this exam.",
            "attempt_id": attempt.id,
            "score": float(attempt.score),
        }, status=status.HTTP_400_BAD_REQUEST)

    # Fetch questions for this exam (WITHOUT revealing correct_option)
    exam_questions = ExamQuestion.objects.filter(exam=exam).select_related("question").order_by("order")
    questions = [
        {
            "id": eq.question.id,
            "order": eq.order,
            "text": eq.question.text,
            "option_a": eq.question.option_a,
            "option_b": eq.question.option_b,
            "option_c": eq.question.option_c,
            "option_d": eq.question.option_d,
            "marks": float(eq.question.marks),
        }
        for eq in exam_questions
    ]

    return Response({
        "attempt_id": attempt.id,
        "exam": {
            "id": exam.id,
            "title": exam.title,
            "course_name": exam.course.name,
            "duration_minutes": exam.duration_minutes,
            "total_marks": float(exam.total_marks),
        },
        "questions": questions,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_exam_api_view(request, exam_id):
    """
    STRICT SERVER-SIDE FEE GATE & AUTO-GRADING
    """
    user = request.user
    if user.role != User.Role.STUDENT:
        return Response({"error": "Student required."}, status=status.HTTP_403_FORBIDDEN)

    exam = Exam.objects.filter(pk=exam_id).first()
    if not exam:
        return Response({"error": "Exam not found."}, status=status.HTTP_404_NOT_FOUND)

    attempt = ExamAttempt.objects.filter(exam=exam, student=user).first()
    if not attempt:
        return Response({"error": "No active exam attempt found."}, status=status.HTTP_400_BAD_REQUEST)

    if attempt.is_completed:
        return Response({"error": "Exam already submitted."}, status=status.HTTP_400_BAD_REQUEST)

    answers = request.data.get("answers", {})  # {str(qid): "A"|"B"|"C"|"D"}

    try:
        score = ExamService.submit_exam_attempt(attempt, answers)
        return Response({
            "message": "Exam successfully submitted and scored.",
            "score": float(score),
            "total_marks": float(exam.total_marks),
            "attempt_id": attempt.id,
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attempt_review_api_view(request, attempt_id):
    user = request.user
    attempt = ExamAttempt.objects.filter(pk=attempt_id).select_related("exam", "exam__course", "student").first()
    if not attempt:
        return Response({"error": "Attempt not found."}, status=status.HTTP_404_NOT_FOUND)

    if user.role == User.Role.STUDENT and attempt.student != user:
        return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

    answers = ExamAnswer.objects.filter(attempt=attempt).select_related("question").order_by("question__id")
    data = [
        {
            "question_id": a.question.id,
            "text": a.question.text,
            "option_a": a.question.option_a,
            "option_b": a.question.option_b,
            "option_c": a.question.option_c,
            "option_d": a.question.option_d,
            "correct_option": a.question.correct_option,
            "selected_option": a.selected_option,
            "is_correct": a.is_correct,
            "marks": float(a.question.marks),
        }
        for a in answers
    ]

    return Response({
        "attempt_id": attempt.id,
        "student_username": attempt.student.username,
        "exam_title": attempt.exam.title,
        "score": float(attempt.score),
        "total_marks": float(attempt.exam.total_marks),
        "submitted_at": attempt.submitted_at.strftime("%Y-%m-%d %H:%M") if attempt.submitted_at else None,
        "answers": data,
    })
