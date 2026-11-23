from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from apps.users.models import User
from apps.enrollments.models import Enrollment
from .models import Exam, ExamResult, ApprovalStatus


class ResultService:
    @staticmethod
    @transaction.atomic
    def submit_exam_result(enrollment: Enrollment, exam: Exam, marks_obtained: Decimal, submitted_by: User) -> ExamResult:
        if marks_obtained < Decimal("0.00"):
            raise ValidationError("Marks cannot be negative.")
        if marks_obtained > exam.total_marks:
            raise ValidationError(f"Marks ({marks_obtained}) cannot exceed exam total marks ({exam.total_marks}).")

        # Admin submission is auto-approved; teacher submission is PENDING
        is_admin = submitted_by.role == User.Role.ADMIN or submitted_by.is_superuser
        initial_status = ApprovalStatus.APPROVED if is_admin else ApprovalStatus.PENDING

        defaults = {
            "marks_obtained": marks_obtained,
            "status": initial_status,
            "submitted_by": submitted_by,
        }
        if is_admin:
            defaults["approved_by"] = submitted_by
            defaults["approved_at"] = timezone.now()

        result, created = ExamResult.objects.update_or_create(
            enrollment=enrollment,
            exam=exam,
            defaults=defaults,
        )
        return result

    @staticmethod
    @transaction.atomic
    def approve_result(result: ExamResult, approved_by: User) -> ExamResult:
        result.status = ApprovalStatus.APPROVED
        result.approved_by = approved_by
        result.approved_at = timezone.now()
        result.rejection_reason = ""
        result.save()
        return result

    @staticmethod
    @transaction.atomic
    def reject_result(result: ExamResult, rejected_by: User, reason: str) -> ExamResult:
        result.status = ApprovalStatus.REJECTED
        result.approved_by = rejected_by
        result.approved_at = timezone.now()
        result.rejection_reason = reason
        result.save()
        return result
