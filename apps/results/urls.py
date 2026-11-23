from django.urls import path
from . import views

app_name = "results"

urlpatterns = [
    path("exams/", views.ExamListView.as_view(), name="exam_list"),
    path("exams/new/", views.ExamCreateView.as_view(), name="exam_create"),
    path("enter-marks/", views.EnterMarksView.as_view(), name="enter_marks"),
    path("approvals/", views.ResultsApprovalQueueView.as_view(), name="approval_queue"),
    path("approvals/<int:pk>/approve/", views.ApproveResultActionView.as_view(), name="approve_result"),
    path("approvals/<int:pk>/reject/", views.RejectResultActionView.as_view(), name="reject_result"),
    path("search/", views.StudentResultsSearchView.as_view(), name="student_results_search"),
    path("my-results/", views.MyResultsView.as_view(), name="my_results"),
]
