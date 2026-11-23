from django.urls import path
from . import views

app_name = "finance"

urlpatterns = [
    path("payments/", views.PaymentListView.as_view(), name="payment_list"),
    path("payments/new/", views.PaymentCreateView.as_view(), name="payment_create"),
    path("payments/<int:pk>/receipt/", views.PaymentReceiptView.as_view(), name="receipt"),
    path("expenditures/", views.ExpenditureListView.as_view(), name="expenditure_list"),
    path("summary/", views.FinancialSummaryView.as_view(), name="financial_summary"),
    path("payroll/", views.TeacherPayrollReportView.as_view(), name="payroll_report"),
    path("salary/", views.TeacherSalaryView.as_view(), name="teacher_salary"),
    path("my-fees/", views.StudentFeesView.as_view(), name="student_fees"),
]
