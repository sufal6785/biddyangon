from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ["subject", "student", "status", "resolved_by", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["subject", "body", "student__username"]
