from decimal import Decimal
from django.db import models
from django.conf import settings


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="enrollments",
        limit_choices_to={"role": "STUDENT"},
    )
    course = models.ForeignKey(
        "academics.Course",
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    fee_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Agreed total fee for this course",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "course"], name="unique_student_course_enrollment"),
            models.CheckConstraint(condition=models.Q(fee_total__gte=0), name="fee_total_non_negative"),
        ]
        ordering = ["-enrolled_at"]

    @property
    def total_paid(self) -> Decimal:
        paid = self.payments.aggregate(total=models.Sum("amount"))["total"]
        return paid if paid is not None else Decimal("0.00")

    @property
    def due_amount(self) -> Decimal:
        due = self.fee_total - self.total_paid
        return due if due > Decimal("0.00") else Decimal("0.00")

    @property
    def is_cleared(self) -> bool:
        return self.due_amount <= Decimal("0.00")

    def __str__(self):
        return f"{self.student.username} in {self.course.name} (Due: {self.due_amount})"
