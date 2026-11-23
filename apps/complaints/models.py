from django.db import models
from django.conf import settings


class Complaint(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        RESOLVED = "RESOLVED", "Resolved"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="complaints",
        limit_choices_to={"role": "STUDENT"},
    )
    subject = models.CharField(max_length=200)
    body = models.TextField(help_text="Detailed description of the issue or feedback")
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.OPEN,
    )
    admin_response = models.TextField(blank=True, help_text="Official resolution or note from admin")
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_complaints",
        limit_choices_to={"role": "ADMIN"},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.status}] {self.subject} ({self.student.username})"
