from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.db.models import Q
from django.utils import timezone
from apps.core.mixins import AdminRequiredMixin, TeacherRequiredMixin, StudentRequiredMixin, TeacherOrAdminRequiredMixin
from apps.users.models import User
from apps.academics.models import Course
from apps.enrollments.models import Enrollment
from .models import Exam, ExamResult, CourseResult, ApprovalStatus
from .forms import ExamForm, ResultEntryForm
from .services import ResultService


class ExamListView(AdminRequiredMixin, View):
    def get(self, request):
        exams = Exam.objects.select_related("course").prefetch_related("syllabus_topics").order_by("-date")
        return render(request, "results/exam_list.html", {"exams": exams})


class ExamCreateView(AdminRequiredMixin, View):
    def get(self, request):
        form = ExamForm()
        return render(request, "results/exam_form.html", {"form": form})

    def post(self, request):
        form = ExamForm(request.POST)
        if form.is_valid():
            exam = form.save()
            messages.success(request, f"Exam '{exam.title}' scheduled.")
            return redirect("results:exam_list")
        return render(request, "results/exam_form.html", {"form": form})


class EnterMarksView(TeacherOrAdminRequiredMixin, View):
    def get(self, request):
        user = request.user
        if user.role == User.Role.TEACHER:
            assigned_courses = Course.objects.filter(teacher_assignments__teacher=user)
            exams = Exam.objects.filter(course__in=assigned_courses).order_by("-date")
        else:
            exams = Exam.objects.all().order_by("-date")

        exam_id = request.GET.get("exam_id")
        selected_exam = None
        enrollments = []
        existing_results = {}

        if exam_id:
            selected_exam = get_object_or_404(exams, pk=exam_id)
            enrollments = Enrollment.objects.filter(course=selected_exam.course, is_active=True).select_related("student")
            results = ExamResult.objects.filter(exam=selected_exam)
            existing_results = {r.enrollment_id: r for r in results}

        return render(
            request,
            "results/enter_marks.html",
            {
                "exams": exams,
                "selected_exam": selected_exam,
                "enrollments": enrollments,
                "existing_results": existing_results,
            },
        )

    def post(self, request):
        exam_id = request.POST.get("exam_id")
        exam = get_object_or_404(Exam, pk=exam_id)

        # Scoped permission check for teacher
        if request.user.role == User.Role.TEACHER:
            if not Course.objects.filter(teacher_assignments__teacher=request.user, pk=exam.course_id).exists():
                raise PermissionDenied("You are not authorized to submit marks for this course.")

        enrollments = Enrollment.objects.filter(course=exam.course, is_active=True)
        count = 0
        for enr in enrollments:
            marks_str = request.POST.get(f"marks_{enr.id}")
            if marks_str and marks_str.strip():
                try:
                    marks = Decimal(marks_str.strip())
                    ResultService.submit_exam_result(enr, exam, marks, request.user)
                    count += 1
                except Exception as e:
                    messages.error(request, f"Error saving marks for {enr.student.username}: {e}")

        if count > 0:
            status_note = "approved" if (request.user.role == User.Role.ADMIN or request.user.is_superuser) else "submitted for Admin approval"
            messages.success(request, f"Saved marks for {count} students ({status_note}).")
        return redirect(f"{request.path}?exam_id={exam.id}")


class ResultsApprovalQueueView(AdminRequiredMixin, View):
    def get(self, request):
        pending_results = ExamResult.objects.filter(status=ApprovalStatus.PENDING).select_related(
            "enrollment__student", "enrollment__course", "exam", "submitted_by"
        ).order_by("-created_at")
        return render(request, "results/approval_queue.html", {"pending_results": pending_results})


class ApproveResultActionView(AdminRequiredMixin, View):
    def post(self, request, pk):
        result = get_object_or_404(ExamResult, pk=pk)
        ResultService.approve_result(result, request.user)
        messages.success(request, f"Result for {result.enrollment.student.username} approved.")
        return redirect("results:approval_queue")


class RejectResultActionView(AdminRequiredMixin, View):
    def post(self, request, pk):
        result = get_object_or_404(ExamResult, pk=pk)
        reason = request.POST.get("reason", "Marks require correction by instructor.")
        ResultService.reject_result(result, request.user, reason)
        messages.warning(request, f"Result for {result.enrollment.student.username} rejected with feedback.")
        return redirect("results:approval_queue")


class StudentResultsSearchView(AdminRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "")
        student = None
        results = []
        if query:
            student = User.objects.filter(role=User.Role.STUDENT).filter(
                Q(username__iexact=query) | Q(student_profile__roll_no__iexact=query)
            ).first()
            if student:
                results = ExamResult.objects.filter(enrollment__student=student).select_related("exam__course")

        return render(
            request,
            "results/student_results_search.html",
            {
                "query": query,
                "student": student,
                "results": results,
            },
        )


class MyResultsView(StudentRequiredMixin, View):
    def get(self, request):
        student = request.user
        # Students ONLY see APPROVED results
        results = ExamResult.objects.filter(
            enrollment__student=student,
            status=ApprovalStatus.APPROVED,
        ).select_related("exam__course").order_by("-exam__date")

        return render(request, "results/my_results.html", {"results": results})
