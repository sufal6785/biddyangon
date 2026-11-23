from django.contrib import admin
from .models import Class, Section, Course, RoutineSlot, CourseSession, SyllabusTopic


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "code"]


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ["name", "academic_class", "created_at"]
    list_filter = ["academic_class"]
    search_fields = ["name", "academic_class__name"]


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "academic_class", "total_sessions_planned", "default_fee", "is_active"]
    list_filter = ["academic_class", "is_active"]
    search_fields = ["name", "code"]


@admin.register(RoutineSlot)
class RoutineSlotAdmin(admin.ModelAdmin):
    list_display = ["weekday", "start_time", "end_time", "section", "course", "teacher", "room"]
    list_filter = ["weekday", "course", "section", "teacher"]
    search_fields = ["course__name", "section__name", "teacher__username", "room"]


@admin.register(CourseSession)
class CourseSessionAdmin(admin.ModelAdmin):
    list_display = ["date", "course", "section", "taught_by", "topic", "held"]
    list_filter = ["held", "date", "course", "section"]
    search_fields = ["course__name", "topic", "taught_by__username"]


@admin.register(SyllabusTopic)
class SyllabusTopicAdmin(admin.ModelAdmin):
    list_display = ["order", "title", "course", "is_covered"]
    list_filter = ["course", "is_covered"]
    search_fields = ["title", "course__name"]
