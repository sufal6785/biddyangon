from django.urls import path
from apps.users import api_views as user_api
from apps.dashboard import api_views as dashboard_api
from apps.academics import api_views as academics_api
from apps.people import api_views as people_api
from apps.enrollments import api_views as enrollments_api
from apps.finance import api_views as finance_api
from apps.attendance import api_views as attendance_api
from apps.results import api_views as results_api
from apps.exams import api_views as exams_api
from apps.complaints import api_views as complaints_api

urlpatterns = [
    # Auth
    path("auth/login/", user_api.login_api_view, name="api_login"),
    path("auth/logout/", user_api.logout_api_view, name="api_logout"),
    path("auth/profile/", user_api.profile_api_view, name="api_profile"),
    path("auth/change-password/", user_api.change_password_api_view, name="api_change_password"),

    # Dashboards
    path("dashboard/admin/", dashboard_api.admin_dashboard_api_view, name="api_admin_dashboard"),
    path("dashboard/teacher/", dashboard_api.teacher_dashboard_api_view, name="api_teacher_dashboard"),
    path("dashboard/student/", dashboard_api.student_dashboard_api_view, name="api_student_dashboard"),

    # Academics
    path("academics/classes/", academics_api.classes_api_view, name="api_classes"),
    path("academics/sections/", academics_api.sections_create_api_view, name="api_sections_create"),
    path("academics/courses/", academics_api.courses_api_view, name="api_courses"),
    path("academics/routine/", academics_api.routine_api_view, name="api_routine"),
    path("academics/sessions/", academics_api.sessions_api_view, name="api_sessions"),
    path("academics/sessions/generate/", academics_api.generate_sessions_api_view, name="api_generate_sessions"),

    # People
    path("people/teachers/", people_api.teachers_api_view, name="api_teachers"),
    path("people/students/", people_api.students_api_view, name="api_students"),
    path("people/users/<int:pk>/status/", people_api.toggle_user_active_api_view, name="api_toggle_user_active"),
    path("people/assignments/", people_api.teacher_assignments_api_view, name="api_teacher_assignments"),
    path("people/assignments/<int:pk>/", people_api.delete_teacher_assignment_api_view, name="api_delete_teacher_assignment"),

    # Enrollments
    path("enrollments/", enrollments_api.enrollments_api_view, name="api_enrollments"),
    path("enrollments/bulk/", enrollments_api.bulk_enroll_api_view, name="api_bulk_enroll"),
    path("enrollments/<int:pk>/status/", enrollments_api.toggle_enrollment_active_api_view, name="api_toggle_enrollment_active"),

    # Finance
    path("finance/payments/", finance_api.payments_api_view, name="api_payments"),
    path("finance/receipts/<int:pk>/", finance_api.payment_receipt_api_view, name="api_payment_receipt"),
    path("finance/expenditures/", finance_api.expenditures_api_view, name="api_expenditures"),
    path("finance/summary/", finance_api.financial_summary_api_view, name="api_financial_summary"),
    path("finance/payroll/", finance_api.payroll_report_api_view, name="api_payroll_report"),
    path("finance/my-salary/", finance_api.teacher_salary_api_view, name="api_teacher_salary"),
    path("finance/student-fees/", finance_api.student_fees_api_view, name="api_student_fees"),

    # Attendance
    path("attendance/roster/<int:course_id>/", attendance_api.attendance_roster_api_view, name="api_attendance_roster"),
    path("attendance/mark/", attendance_api.mark_attendance_api_view, name="api_mark_attendance"),
    path("attendance/student/", attendance_api.student_attendance_api_view, name="api_student_attendance"),

    # Results
    path("results/exams/", results_api.exams_api_view, name="api_exams"),
    path("results/exams/<int:exam_id>/marks/", results_api.enter_marks_api_view, name="api_enter_marks"),
    path("results/approvals/", results_api.approvals_queue_api_view, name="api_results_approvals"),
    path("results/approvals/<int:pk>/approve/", results_api.approve_result_api_view, name="api_approve_result"),
    path("results/approvals/<int:pk>/reject/", results_api.reject_result_api_view, name="api_reject_result"),
    path("results/my-results/", results_api.my_results_api_view, name="api_my_results"),

    # Question Bank & Fee-gated Exams
    path("exams/questions/", exams_api.questions_api_view, name="api_questions"),
    path("exams/questions/<int:pk>/approve/", exams_api.approve_question_api_view, name="api_approve_question"),
    path("exams/questions/<int:pk>/reject/", exams_api.reject_question_api_view, name="api_reject_question"),
    path("exams/exams/<int:exam_id>/questions/", exams_api.add_questions_to_exam_api_view, name="api_add_questions_to_exam"),
    path("exams/student-exams/", exams_api.student_exams_api_view, name="api_student_exams"),
    path("exams/take/<int:exam_id>/", exams_api.take_exam_api_view, name="api_take_exam"),
    path("exams/submit/<int:exam_id>/", exams_api.submit_exam_api_view, name="api_submit_exam"),
    path("exams/attempts/<int:attempt_id>/", exams_api.attempt_review_api_view, name="api_attempt_review"),

    # Complaints
    path("complaints/", complaints_api.complaints_api_view, name="api_complaints"),
    path("complaints/<int:pk>/resolve/", complaints_api.resolve_complaint_api_view, name="api_resolve_complaint"),
]
