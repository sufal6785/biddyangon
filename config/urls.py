from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("config.api_urls")),
    path("dashboard/", include("apps.dashboard.urls")),
    path("academics/", include("apps.academics.urls")),
    path("people/", include("apps.people.urls")),
    path("enrollments/", include("apps.enrollments.urls")),
    path("finance/", include("apps.finance.urls")),
    path("attendance/", include("apps.attendance.urls")),
    path("results/", include("apps.results.urls")),
    path("exams/", include("apps.exams.urls")),
    path("complaints/", include("apps.complaints.urls")),
    path("", include("apps.users.urls")),
]
