from django.contrib import admin
from .models import Exam, ExamResult, CourseResult


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "date", "duration_minutes", "total_marks", "status"]
    list_filter = ["status", "date", "course"]
    search_fields = ["title", "course__name"]


@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    list_display = ["enrollment", "exam", "marks_obtained", "status", "submitted_by", "approved_by", "approved_at"]
    list_filter = ["status", "exam__course", "exam"]
    search_fields = ["enrollment__student__username", "exam__title"]


@admin.register(CourseResult)
class CourseResultAdmin(admin.ModelAdmin):
    list_display = ["enrollment", "grade", "gpa", "status", "approved_by", "updated_at"]
    list_filter = ["status", "grade"]
    search_fields = ["enrollment__student__username", "enrollment__course__name"]
