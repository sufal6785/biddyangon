from django.contrib import admin
from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "fee_total", "total_paid", "due_amount", "is_active", "enrolled_at"]
    list_filter = ["course", "is_active", "enrolled_at"]
    search_fields = ["student__username", "student__first_name", "student__last_name", "course__name"]
