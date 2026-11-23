from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.db import transaction
from django.db.models import Q
from django.core.paginator import Paginator
from apps.core.mixins import AdminRequiredMixin
from apps.users.models import User
from apps.academics.models import Course
from .models import TeacherProfile, StudentProfile, TeacherAssignment
from .forms import TeacherCreationForm, StudentCreationForm, TeacherAssignmentForm


class TeacherListView(AdminRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "")
        teachers = User.objects.filter(role=User.Role.TEACHER).select_related("teacher_profile").order_by("-date_joined")
        if query:
            teachers = teachers.filter(Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(phone__icontains=query))

        paginator = Paginator(teachers, 15)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "people/teacher_list.html", {"teachers": page_obj, "query": query})


class TeacherCreateView(AdminRequiredMixin, View):
    def get(self, request):
        form = TeacherCreationForm()
        return render(request, "people/teacher_form.html", {"form": form})

    def post(self, request):
        form = TeacherCreationForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            try:
                with transaction.atomic():
                    user = User.objects.create_user(
                        username=data["username"],
                        first_name=data["first_name"],
                        last_name=data["last_name"],
                        email=data["email"],
                        phone=data["phone"],
                        password=data["password"],
                        role=User.Role.TEACHER,
                    )
                    TeacherProfile.objects.create(
                        user=user,
                        designation=data["designation"],
                        qualification=data["qualification"],
                    )
                messages.success(request, f"Teacher '{user.get_full_name() or user.username}' registered successfully.")
                return redirect("people:teacher_list")
            except Exception as e:
                messages.error(request, f"Error registering teacher: {e}")
        return render(request, "people/teacher_form.html", {"form": form})


class TeacherDetailView(AdminRequiredMixin, View):
    def get(self, request, pk):
        teacher = get_object_or_404(User.objects.select_related("teacher_profile"), pk=pk, role=User.Role.TEACHER)
        assignments = teacher.assignments.select_related("course").all()
        recent_sessions = teacher.conducted_sessions.select_related("course", "section").order_by("-date")[:10]
        return render(
            request,
            "people/teacher_detail.html",
            {
                "teacher": teacher,
                "assignments": assignments,
                "recent_sessions": recent_sessions,
            },
        )


class TeacherToggleActiveView(AdminRequiredMixin, View):
    def post(self, request, pk):
        teacher = get_object_or_404(User, pk=pk, role=User.Role.TEACHER)
        teacher.is_active = not teacher.is_active
        teacher.save()
        status = "activated" if teacher.is_active else "deactivated"
        messages.success(request, f"Teacher account {teacher.username} {status}.")
        return redirect("people:teacher_detail", pk=pk)


class StudentListView(AdminRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "")
        students = User.objects.filter(role=User.Role.STUDENT).select_related("student_profile__section__academic_class").order_by("-date_joined")
        if query:
            students = students.filter(Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(phone__icontains=query))

        paginator = Paginator(students, 15)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "people/student_list.html", {"students": page_obj, "query": query})


class StudentCreateView(AdminRequiredMixin, View):
    def get(self, request):
        form = StudentCreationForm()
        return render(request, "people/student_form.html", {"form": form})

    def post(self, request):
        form = StudentCreationForm(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            section = data["section"]
            roll_no = data["roll_no"]

            # Check unique roll in section
            if StudentProfile.objects.filter(section=section, roll_no=roll_no).exists():
                messages.error(request, f"Roll number {roll_no} already exists in {section}.")
                return render(request, "people/student_form.html", {"form": form})

            # Auto-generate standard username: {class_code}-{roll_no:03d}
            base_username = f"{section.academic_class.code}-{roll_no:03d}"
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}-{counter}"
                counter += 1

            try:
                with transaction.atomic():
                    user = User.objects.create_user(
                        username=username,
                        first_name=data["first_name"],
                        last_name=data["last_name"],
                        email=data["email"],
                        phone=data["phone"],
                        location=data["location"],
                        password=data["password"],
                        role=User.Role.STUDENT,
                    )
                    StudentProfile.objects.create(
                        user=user,
                        section=section,
                        roll_no=roll_no,
                        guardian_name=data["guardian_name"],
                        guardian_phone=data["guardian_phone"],
                    )
                messages.success(request, f"Student account created with username: {username}")
                return redirect("people:student_list")
            except Exception as e:
                messages.error(request, f"Error registering student: {e}")
        return render(request, "people/student_form.html", {"form": form})


class StudentDetailView(AdminRequiredMixin, View):
    def get(self, request, pk):
        student = get_object_or_404(User.objects.select_related("student_profile__section__academic_class"), pk=pk, role=User.Role.STUDENT)
        enrollments = student.enrollments.select_related("course").all()
        payments = student.enrollments.prefetch_related("payments").all()
        return render(
            request,
            "people/student_detail.html",
            {
                "student": student,
                "profile": getattr(student, "student_profile", None),
                "enrollments": enrollments,
            },
        )


class StudentToggleActiveView(AdminRequiredMixin, View):
    def post(self, request, pk):
        student = get_object_or_404(User, pk=pk, role=User.Role.STUDENT)
        student.is_active = not student.is_active
        student.save()
        status = "activated" if student.is_active else "deactivated"
        messages.success(request, f"Student account {student.username} {status}.")
        return redirect("people:student_detail", pk=pk)


class TeacherAssignmentListView(AdminRequiredMixin, View):
    def get(self, request):
        assignments = TeacherAssignment.objects.select_related("teacher", "course").all()
        form = TeacherAssignmentForm()
        return render(
            request,
            "people/assignment_list.html",
            {
                "assignments": assignments,
                "form": form,
            },
        )

    def post(self, request):
        form = TeacherAssignmentForm(request.POST)
        if form.is_valid():
            try:
                form.save()
                messages.success(request, "Teacher assigned to course successfully.")
            except Exception as e:
                messages.error(request, f"Duplicate assignment or error: {e}")
        else:
            messages.error(request, "Please correct the form errors.")
        return redirect("people:assignment_list")
