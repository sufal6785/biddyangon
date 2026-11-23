from django.urls import path
from . import views

app_name = "academics"

urlpatterns = [
    path("classes/", views.ClassListView.as_view(), name="class_list"),
    path("classes/<int:pk>/edit/", views.ClassUpdateView.as_view(), name="class_edit"),
    path("classes/<int:pk>/delete/", views.ClassDeleteView.as_view(), name="class_delete"),
    path("courses/", views.CourseListView.as_view(), name="course_list"),
    path("courses/new/", views.CourseCreateView.as_view(), name="course_create"),
    path("courses/<int:pk>/edit/", views.CourseUpdateView.as_view(), name="course_edit"),
    path("routine/", views.RoutineSlotListView.as_view(), name="routine_list"),
    path("routine/<int:pk>/delete/", views.RoutineSlotDeleteView.as_view(), name="routine_delete"),
    path("sessions/", views.CourseSessionListView.as_view(), name="session_list"),
    path("sessions/generate/", views.GenerateSessionsView.as_view(), name="session_generate"),
]
