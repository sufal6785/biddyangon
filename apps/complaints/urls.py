from django.urls import path
from . import views

app_name = "complaints"

urlpatterns = [
    path("", views.ComplaintListView.as_view(), name="complaint_list"),
    path("<int:pk>/", views.ComplaintDetailAdminView.as_view(), name="complaint_detail"),
    path("my-complaints/", views.StudentComplaintsView.as_view(), name="my_complaints"),
]
