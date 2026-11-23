from django.contrib import admin
from .models import TeacherProfile, StudentProfile, TeacherAssignment


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "designation", "qualification", "joining_date"]
    search_fields = ["user__username", "user__first_name", "user__last_name", "designation"]


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "roll_no", "section", "guardian_name", "guardian_phone"]
    list_filter = ["section__academic_class", "section"]
    search_fields = ["user__username", "user__first_name", "user__last_name", "roll_no", "guardian_name"]


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ["teacher", "course", "rate_per_session", "assigned_at"]
    list_filter = ["course", "teacher"]
    search_fields = ["teacher__username", "course__name"]
