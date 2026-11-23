from django.db import models
from django.conf import settings


class ApprovalStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PENDING = "PENDING", "Pending Approval"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class Exam(models.Model):
    class ExamStatus(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SCHEDULED = "SCHEDULED", "Scheduled"
        OPEN = "OPEN", "Open (Active)"
        CLOSED = "CLOSED", "Closed"

    course = models.ForeignKey(
        "academics.Course",
        on_delete=models.CASCADE,
        related_name="exams",
    )
    title = models.CharField(max_length=200)
    date = models.DateField()
    duration_minutes = models.PositiveIntegerField(default=60)
    total_marks = models.DecimalField(max_digits=6, decimal_places=2, default=100.00)
    status = models.CharField(
        max_length=15,
        choices=ExamStatus.choices,
        default=ExamStatus.SCHEDULED,
    )
    syllabus_topics = models.ManyToManyField(
        "academics.SyllabusTopic",
        blank=True,
        related_name="exams",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "course"]

    def __str__(self):
        return f"{self.title} - {self.course.name} ({self.date})"


class ExamResult(models.Model):
    enrollment = models.ForeignKey(
        "enrollments.Enrollment",
        on_delete=models.CASCADE,
        related_name="exam_results",
    )
    exam = models.ForeignKey(
        Exam,
        on_delete=models.CASCADE,
        related_name="results",
    )
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="submitted_results",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_results",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["enrollment", "exam"], name="unique_student_exam_result"),
            models.CheckConstraint(condition=models.Q(marks_obtained__gte=0), name="result_marks_non_negative"),
        ]
        ordering = ["-exam__date", "enrollment__student__username"]

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.exam.title}: {self.marks_obtained}/{self.exam.total_marks} [{self.status}]"


class CourseResult(models.Model):
    enrollment = models.OneToOneField(
        "enrollments.Enrollment",
        on_delete=models.CASCADE,
        related_name="course_result",
    )
    grade = models.CharField(max_length=5, help_text="e.g. A+, A, A-, B, C, D, F")
    gpa = models.DecimalField(max_digits=3, decimal_places=2, help_text="GPA (0.00 to 5.00)")
    status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_course_grades",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["enrollment__course", "-gpa"]

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.enrollment.course.name}: Grade {self.grade} (GPA: {self.gpa}) [{self.status}]"
