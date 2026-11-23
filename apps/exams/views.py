from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.utils import timezone
from apps.core.mixins import AdminRequiredMixin, TeacherRequiredMixin, StudentRequiredMixin, TeacherOrAdminRequiredMixin
from apps.users.models import User
from apps.academics.models import Course
from apps.enrollments.models import Enrollment
from apps.results.models import Exam, ApprovalStatus
from .models import Question, ExamQuestion, ExamAttempt, ExamAnswer
from .forms import QuestionForm
from .services import ExamService


class QuestionBankListView(TeacherOrAdminRequiredMixin, View):
    def get(self, request):
        user = request.user
        questions = Question.objects.select_related("course", "submitted_by", "approved_by")

        if user.role == User.Role.TEACHER:
            assigned_courses = Course.objects.filter(teacher_assignments__teacher=user)
            questions = questions.filter(course__in=assigned_courses)

        course_id = request.GET.get("course")
        status_filter = request.GET.get("status")

        if course_id:
            questions = questions.filter(course_id=course_id)
        if status_filter:
            questions = questions.filter(status=status_filter)

        return render(
            request,
            "exams/question_list.html",
            {
                "questions": questions.order_by("-created_at"),
                "status_choices": ApprovalStatus.choices,
                "is_admin": (user.role == User.Role.ADMIN or user.is_superuser),
            },
        )


class QuestionCreateView(TeacherOrAdminRequiredMixin, View):
    def get(self, request):
        form = QuestionForm(user=request.user)
        return render(request, "exams/question_form.html", {"form": form})

    def post(self, request):
        form = QuestionForm(request.POST, user=request.user)
        if form.is_valid():
            q = form.save(commit=False)
            q.submitted_by = request.user
            if request.user.role == User.Role.ADMIN or request.user.is_superuser:
                q.status = ApprovalStatus.APPROVED
                q.approved_by = request.user
                messages.success(request, "Question created and automatically approved.")
            else:
                q.status = ApprovalStatus.PENDING
                messages.success(request, "Question submitted for Administrator approval.")
            q.save()
            return redirect("exams:question_list")
        return render(request, "exams/question_form.html", {"form": form})


class QuestionApproveActionView(AdminRequiredMixin, View):
    def post(self, request, pk):
        q = get_object_or_404(Question, pk=pk)
        q.status = ApprovalStatus.APPROVED
        q.approved_by = request.user
        q.rejection_reason = ""
        q.save()
        messages.success(request, f"Question #{q.id} approved.")
        return redirect("exams:question_list")


class QuestionRejectActionView(AdminRequiredMixin, View):
    def post(self, request, pk):
        q = get_object_or_404(Question, pk=pk)
        reason = request.POST.get("reason", "Question rejected by administrator.")
        q.status = ApprovalStatus.REJECTED
        q.approved_by = request.user
        q.rejection_reason = reason
        q.save()
        messages.warning(request, f"Question #{q.id} rejected.")
        return redirect("exams:question_list")


class StudentExamsListView(StudentRequiredMixin, View):
    def get(self, request):
        student = request.user
        enrollments = Enrollment.objects.filter(student=student, is_active=True).select_related("course")
        course_ids = [e.course_id for e in enrollments]
        enrollment_map = {e.course_id: e for e in enrollments}

        exams = Exam.objects.filter(course_id__in=course_ids).select_related("course").order_by("-date")
        exam_cards = []

        for ex in exams:
            enr = enrollment_map.get(ex.course_id)
            attempt = ExamAttempt.objects.filter(exam=ex, student=student).first()
            is_fee_cleared = enr.is_cleared if enr else False
            exam_cards.append({
                "exam": ex,
                "enrollment": enr,
                "is_fee_cleared": is_fee_cleared,
                "attempt": attempt,
                "can_start": is_fee_cleared and (attempt is None or not attempt.is_completed),
            })

        return render(request, "exams/student_exams.html", {"exam_cards": exam_cards})


class TakeExamView(StudentRequiredMixin, View):
    def get(self, request, pk):
        exam = get_object_or_404(Exam, pk=pk)
        student = request.user

        # STRICT FEE GATE CHECK
        if not ExamService.can_student_take_exam(student, exam):
            raise PermissionDenied("Access Denied: Full course fee payment is required to take this exam.")

        attempt = ExamService.start_exam_attempt(student, exam)
        if attempt.is_completed:
            messages.info(request, "You have already completed and submitted this assessment.")
            return redirect("exams:attempt_result", pk=attempt.pk)

        exam_questions = ExamQuestion.objects.filter(exam=exam).select_related("question").order_by("order")
        return render(
            request,
            "exams/take_exam.html",
            {
                "exam": exam,
                "attempt": attempt,
                "exam_questions": exam_questions,
            },
        )

    def post(self, request, pk):
        exam = get_object_or_404(Exam, pk=pk)
        student = request.user

        # STRICT FEE GATE CHECK AGAIN ON POST
        if not ExamService.can_student_take_exam(student, exam):
            raise PermissionDenied("Access Denied: Full course fee payment is required to submit this exam.")

        attempt = get_object_or_404(ExamAttempt, exam=exam, student=student)
        if attempt.is_completed:
            messages.info(request, "This attempt is already finalized.")
            return redirect("exams:attempt_result", pk=attempt.pk)

        answers_dict = {}
        for key, val in request.POST.items():
            if key.startswith("q_"):
                q_id = key.replace("q_", "")
                answers_dict[q_id] = val

        score = ExamService.submit_exam_attempt(attempt, answers_dict)
        messages.success(request, f"Assessment submitted successfully! Your score: {score} / {exam.total_marks}")
        return redirect("exams:attempt_result", pk=attempt.pk)


class ExamAttemptResultView(StudentRequiredMixin, View):
    def get(self, request, pk):
        attempt = get_object_or_404(ExamAttempt.objects.select_related("exam__course"), pk=pk, student=request.user)
        answers = ExamAnswer.objects.filter(attempt=attempt).select_related("question")
        return render(
            request,
            "exams/attempt_result.html",
            {
                "attempt": attempt,
                "answers": answers,
            },
        )
