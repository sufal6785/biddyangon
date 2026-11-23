from django.contrib import admin
from .models import Question, ExamQuestion, ExamAttempt, ExamAnswer


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["text_snippet", "course", "correct_option", "marks", "status", "submitted_by", "approved_by"]
    list_filter = ["status", "course", "correct_option"]
    search_fields = ["text", "course__name"]

    def text_snippet(self, obj):
        return obj.text[:60]


@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
    list_display = ["exam", "question", "order"]
    list_filter = ["exam"]
    ordering = ["exam", "order"]


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ["student", "exam", "score", "started_at", "submitted_at"]
    list_filter = ["exam", "started_at"]
    search_fields = ["student__username", "exam__title"]


@admin.register(ExamAnswer)
class ExamAnswerAdmin(admin.ModelAdmin):
    list_display = ["attempt", "question", "selected_option", "is_correct"]
    list_filter = ["is_correct"]
