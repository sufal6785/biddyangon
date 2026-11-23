from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class Class(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="e.g. Class 10, HSC 2026")
    code = models.CharField(max_length=20, unique=True, help_text="Short identifier, e.g. ssc26, hsc26")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Class"
        verbose_name_plural = "Classes"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class Section(models.Model):
    academic_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name="sections")
    name = models.CharField(max_length=50, help_text="e.g. Science-A, Commerce, Morning")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["academic_class", "name"], name="unique_section_per_class")
        ]
        ordering = ["academic_class", "name"]

    def __str__(self):
        return f"{self.academic_class.name} - {self.name}"


class Course(models.Model):
    academic_class = models.ForeignKey(Class, on_delete=models.PROTECT, related_name="courses")
    name = models.CharField(max_length=150, help_text="e.g. Higher Mathematics, Physics")
    code = models.CharField(max_length=30, unique=True, help_text="e.g. PHY-101")
    total_sessions_planned = models.PositiveIntegerField(default=40)
    default_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(default_fee__gte=0), name="course_default_fee_non_negative"),
            models.CheckConstraint(condition=models.Q(total_sessions_planned__gt=0), name="course_sessions_positive")
        ]
        ordering = ["academic_class", "name"]

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.academic_class.name}"


class RoutineSlot(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, _("Monday")
        TUESDAY = 1, _("Tuesday")
        WEDNESDAY = 2, _("Wednesday")
        THURSDAY = 3, _("Thursday")
        FRIDAY = 4, _("Friday")
        SATURDAY = 5, _("Saturday")
        SUNDAY = 6, _("Sunday")

    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="routine_slots")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="routine_slots")
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="routine_slots",
        limit_choices_to={"role": "TEACHER"},
    )
    weekday = models.IntegerField(choices=Weekday.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["weekday", "start_time"]

    def clean(self):
        super().clean()
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError({"end_time": "End time must be later than start time."})

        # Check section conflict
        section_conflicts = RoutineSlot.objects.filter(
            section=self.section,
            weekday=self.weekday,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        ).exclude(pk=self.pk)
        if section_conflicts.exists():
            raise ValidationError("This section already has a class scheduled during this time slot.")

        # Check teacher conflict
        teacher_conflicts = RoutineSlot.objects.filter(
            teacher=self.teacher,
            weekday=self.weekday,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        ).exclude(pk=self.pk)
        if teacher_conflicts.exists():
            raise ValidationError("This teacher is already scheduled for another class during this time slot.")

    def __str__(self):
        return f"{self.get_weekday_display()} {self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')} | {self.course.name} ({self.section})"


class CourseSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="sessions")
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="sessions")
    taught_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conducted_sessions",
    )
    date = models.DateField()
    topic = models.CharField(max_length=255, blank=True)
    held = models.BooleanField(default=False, help_text="True indicates session took place; feeds salary and progress.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "course"]

    def __str__(self):
        status = "Held" if self.held else "Scheduled"
        return f"{self.course.name} - {self.section.name} on {self.date} [{status}]"


class SyllabusTopic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="syllabus_topics")
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=1)
    is_covered = models.BooleanField(default=False)

    class Meta:
        ordering = ["course", "order"]
        constraints = [
            models.UniqueConstraint(fields=["course", "order"], name="unique_topic_order_per_course")
        ]

    def __str__(self):
        return f"{self.order}. {self.title} ({self.course.code})"
