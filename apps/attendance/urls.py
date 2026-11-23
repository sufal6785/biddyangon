from django.urls import path
from . import views

app_name = "attendance"

urlpatterns = [
    path("mark/", views.MarkAttendanceView.as_view(), name="mark_attendance"),
    path("my-attendance/", views.StudentAttendanceView.as_view(), name="student_attendance"),
    path("roster/<int:course_id>/", views.CourseRosterView.as_view(), name="course_roster"),
]
