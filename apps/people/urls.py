from django.urls import path
from . import views

app_name = "people"

urlpatterns = [
    path("teachers/", views.TeacherListView.as_view(), name="teacher_list"),
    path("teachers/new/", views.TeacherCreateView.as_view(), name="teacher_create"),
    path("teachers/<int:pk>/", views.TeacherDetailView.as_view(), name="teacher_detail"),
    path("teachers/<int:pk>/toggle-active/", views.TeacherToggleActiveView.as_view(), name="teacher_toggle_active"),
    path("students/", views.StudentListView.as_view(), name="student_list"),
    path("students/new/", views.StudentCreateView.as_view(), name="student_create"),
    path("students/<int:pk>/", views.StudentDetailView.as_view(), name="student_detail"),
    path("students/<int:pk>/toggle-active/", views.StudentToggleActiveView.as_view(), name="student_toggle_active"),
    path("assignments/", views.TeacherAssignmentListView.as_view(), name="assignment_list"),
]
