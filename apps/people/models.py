from django.db import models
from django.conf import settings
from django.utils import timezone


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teacher_profile",
        limit_choices_to={"role": "TEACHER"},
    )
    designation = models.CharField(max_length=100, default="Instructor")
    qualification = models.CharField(max_length=255, blank=True)
    joining_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.designation})"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
        limit_choices_to={"role": "STUDENT"},
    )
    section = models.ForeignKey(
        "academics.Section",
        on_delete=models.PROTECT,
        related_name="students",
    )
    roll_no = models.PositiveIntegerField(help_text="Roll number inside section")
    guardian_name = models.CharField(max_length=150, blank=True)
    guardian_phone = models.CharField(max_length=15, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["section", "roll_no"], name="unique_roll_per_section")
        ]
        ordering = ["section", "roll_no"]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} (Roll: {self.roll_no}, {self.section})"


class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assignments",
        limit_choices_to={"role": "TEACHER"},
    )
    course = models.ForeignKey(
        "academics.Course",
        on_delete=models.CASCADE,
        related_name="teacher_assignments",
    )
    rate_per_session = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Remuneration rate per conducted session",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["teacher", "course"], name="unique_teacher_course_assignment"),
            models.CheckConstraint(condition=models.Q(rate_per_session__gte=0), name="rate_per_session_non_negative")
        ]
        ordering = ["teacher", "course"]

    def __str__(self):
        return f"{self.teacher.username} -> {self.course.name} (@ {self.rate_per_session}/session)"
