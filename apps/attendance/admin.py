from django.contrib import admin
from .models import Attendance


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ["enrollment", "session", "status", "marked_by", "marked_at"]
    list_filter = ["status", "session__course", "session__date"]
    search_fields = ["enrollment__student__username", "session__course__name"]
