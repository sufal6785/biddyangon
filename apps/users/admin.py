from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "role", "phone", "is_active", "is_staff"]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["username", "first_name", "last_name", "phone", "email"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Custom Role & Details", {"fields": ("role", "phone", "location")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Custom Role & Details", {"fields": ("role", "phone", "location")}),
    )
