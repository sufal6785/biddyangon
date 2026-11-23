from django.db import models
from django.conf import settings
from apps.results.models import ApprovalStatus


class Question(models.Model):
    class CorrectOption(models.TextChoices):
        A = "A", "Option A"
        B = "B", "Option B"
        C = "C", "Option C"
        D = "D", "Option D"

    course = models.ForeignKey(
        "academics.Course",
        on_delete=models.CASCADE,
        related_name="questions",
    )
    text = models.TextField(help_text="Question text or prompt")
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(max_length=1, choices=CorrectOption.choices)
    marks = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="submitted_questions",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_questions",
    )
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["course", "-created_at"]

    def __str__(self):
        return f"[{self.course.code}] {self.text[:50]}... ({self.status})"


class ExamQuestion(models.Model):
    exam = models.ForeignKey(
        "results.Exam",
        on_delete=models.CASCADE,
        related_name="exam_questions",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.PROTECT,
        related_name="exam_questions",
    )
    order = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["exam", "question"], name="unique_exam_question")
        ]
        ordering = ["exam", "order"]

    def __str__(self):
        return f"{self.exam.title} - Q{self.order}: {self.question.id}"


class ExamAttempt(models.Model):
    exam = models.ForeignKey(
        "results.Exam",
        on_delete=models.CASCADE,
        related_name="attempts",
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exam_attempts",
        limit_choices_to={"role": "STUDENT"},
    )
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["exam", "student"], name="unique_exam_student_attempt")
        ]
        ordering = ["-started_at"]

    @property
    def is_completed(self):
        return self.submitted_at is not None

    def __str__(self):
        status = f"Score: {self.score}" if self.is_completed else "In Progress"
        return f"{self.student.username} - {self.exam.title} ({status})"


class ExamAnswer(models.Model):
    attempt = models.ForeignKey(
        ExamAttempt,
        on_delete=models.CASCADE,
        related_name="answers",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
    )
    selected_option = models.CharField(max_length=1, choices=Question.CorrectOption.choices)
    is_correct = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["attempt", "question"], name="unique_attempt_question_answer")
        ]

    def __str__(self):
        return f"Attempt {self.attempt.id} - Q {self.question.id}: Ans {self.selected_option} ({'Correct' if self.is_correct else 'Wrong'})"
