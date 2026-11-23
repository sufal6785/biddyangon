from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError, PermissionDenied
from apps.users.models import User
from apps.enrollments.models import Enrollment
from apps.results.models import Exam, ExamResult, ApprovalStatus
from .models import Question, ExamQuestion, ExamAttempt, ExamAnswer


class ExamService:
    @staticmethod
    def can_student_take_exam(student: User, exam: Exam) -> bool:
        """
        Fee Gate Check:
        Student can ONLY take exam if enrolled and course fees are 100% cleared (due == 0).
        """
        enrollment = Enrollment.objects.filter(student=student, course=exam.course, is_active=True).first()
        if not enrollment:
            return False
        return enrollment.is_cleared

    @staticmethod
    @transaction.atomic
    def start_exam_attempt(student: User, exam: Exam) -> ExamAttempt:
        if not ExamService.can_student_take_exam(student, exam):
            raise PermissionDenied("Access Denied: Full course fee payment is required to take this exam.")

        attempt, created = ExamAttempt.objects.get_or_create(
            exam=exam,
            student=student,
        )
        return attempt

    @staticmethod
    @transaction.atomic
    def submit_exam_attempt(attempt: ExamAttempt, answers_dict: dict) -> Decimal:
        """
        answers_dict: mapping question_id -> selected_option ('A', 'B', 'C', 'D')
        Calculates score, creates ExamAnswer records, and updates ExamResult.
        """
        # Server-side fee gate check again upon submission
        if not ExamService.can_student_take_exam(attempt.student, attempt.exam):
            raise PermissionDenied("Access Denied: Unsettled course fees prevent exam submission.")

        total_score = Decimal("0.00")
        exam_questions = ExamQuestion.objects.filter(exam=attempt.exam).select_related("question")

        for eq in exam_questions:
            q = eq.question
            selected = answers_dict.get(str(q.id))
            is_correct = (selected == q.correct_option)
            if is_correct:
                total_score += q.marks

            ExamAnswer.objects.update_or_create(
                attempt=attempt,
                question=q,
                defaults={
                    "selected_option": selected or "",
                    "is_correct": is_correct,
                },
            )

        attempt.score = total_score
        attempt.submitted_at = timezone.now()
        attempt.save()

        # Update or create ExamResult
        enrollment = Enrollment.objects.get(student=attempt.student, course=attempt.exam.course)
        admin_user = User.objects.filter(role=User.Role.ADMIN).first() or attempt.student

        ExamResult.objects.update_or_create(
            enrollment=enrollment,
            exam=attempt.exam,
            defaults={
                "marks_obtained": total_score,
                "status": ApprovalStatus.APPROVED,
                "submitted_by": attempt.student,
                "approved_by": admin_user,
                "approved_at": timezone.now(),
            },
        )
        return total_score
