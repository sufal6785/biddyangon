from django.db import models
from django.conf import settings


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        LATE = "LATE", "Late"

    enrollment = models.ForeignKey(
        "enrollments.Enrollment",
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    session = models.ForeignKey(
        "academics.CourseSession",
        on_delete=models.CASCADE,
        related_name="attendances",
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PRESENT,
    )
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="marked_attendances",
    )
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["enrollment", "session"], name="unique_attendance_per_session")
        ]
        ordering = ["-session__date", "enrollment__student__username"]

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.session}: {self.status}"
