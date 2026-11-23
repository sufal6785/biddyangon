from django.urls import path
from . import views

app_name = "exams"

urlpatterns = [
    path("questions/", views.QuestionBankListView.as_view(), name="question_list"),
    path("questions/new/", views.QuestionCreateView.as_view(), name="question_create"),
    path("questions/<int:pk>/approve/", views.QuestionApproveActionView.as_view(), name="question_approve"),
    path("questions/<int:pk>/reject/", views.QuestionRejectActionView.as_view(), name="question_reject"),
    path("portal/", views.StudentExamsListView.as_view(), name="student_exams"),
    path("take/<int:pk>/", views.TakeExamView.as_view(), name="take_exam"),
    path("attempts/<int:pk>/", views.ExamAttemptResultView.as_view(), name="attempt_result"),
    path("exams/", views.StudentExamsListView.as_view(), name="exam_list"),  # Alias for exam schedule
]
