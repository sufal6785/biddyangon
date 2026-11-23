from django.urls import path
from . import views

app_name = "enrollments"

urlpatterns = [
    path("", views.EnrollmentListView.as_view(), name="enrollment_list"),
    path("new/", views.EnrollmentCreateView.as_view(), name="enrollment_create"),
    path("<int:pk>/toggle/", views.EnrollmentToggleActiveView.as_view(), name="enrollment_toggle"),
]
