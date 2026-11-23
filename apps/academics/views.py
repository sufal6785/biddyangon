from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.db.models import ProtectedError, Q
from django.core.paginator import Paginator
from apps.core.mixins import AdminRequiredMixin, RoleRequiredMixin
from apps.users.models import User
from .models import Class, Section, Course, RoutineSlot, CourseSession
from .forms import ClassForm, SectionForm, CourseForm, RoutineSlotForm, SessionGenerationForm
from .services import AcademicService


class ClassListView(AdminRequiredMixin, View):
    def get(self, request):
        classes = Class.objects.prefetch_related("sections").all()
        class_form = ClassForm()
        section_form = SectionForm()
        return render(
            request,
            "academics/class_list.html",
            {
                "classes": classes,
                "class_form": class_form,
                "section_form": section_form,
            },
        )

    def post(self, request):
        action = request.POST.get("action")
        if action == "create_class":
            form = ClassForm(request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, f"Class '{form.cleaned_data['name']}' created successfully.")
            else:
                messages.error(request, "Failed to create class. Check fields.")
        elif action == "create_section":
            form = SectionForm(request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, f"Section '{form.cleaned_data['name']}' added.")
            else:
                messages.error(request, "Failed to add section. Check for duplicates.")
        return redirect("academics:class_list")


class ClassUpdateView(AdminRequiredMixin, View):
    def get(self, request, pk):
        cls = get_object_or_404(Class, pk=pk)
        form = ClassForm(instance=cls)
        return render(request, "academics/class_form.html", {"form": form, "cls": cls})

    def post(self, request, pk):
        cls = get_object_or_404(Class, pk=pk)
        form = ClassForm(request.POST, instance=cls)
        if form.is_valid():
            form.save()
            messages.success(request, "Class updated successfully.")
            return redirect("academics:class_list")
        return render(request, "academics/class_form.html", {"form": form, "cls": cls})


class ClassDeleteView(AdminRequiredMixin, View):
    def post(self, request, pk):
        cls = get_object_or_404(Class, pk=pk)
        try:
            cls.delete()
            messages.success(request, "Class deleted successfully.")
        except ProtectedError:
            messages.error(request, "Cannot delete class with existing courses or students. Deactivate it instead.")
        return redirect("academics:class_list")


class CourseListView(AdminRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "")
        courses = Course.objects.select_related("academic_class").all()
        if query:
            courses = courses.filter(Q(name__icontains=query) | Q(code__icontains=query))

        paginator = Paginator(courses, 15)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "academics/course_list.html", {"courses": page_obj, "query": query})


class CourseCreateView(AdminRequiredMixin, View):
    def get(self, request):
        form = CourseForm()
        return render(request, "academics/course_form.html", {"form": form, "title": "Create Course"})

    def post(self, request):
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save()
            messages.success(request, f"Course '{course.name}' created.")
            return redirect("academics:course_list")
        return render(request, "academics/course_form.html", {"form": form, "title": "Create Course"})


class CourseUpdateView(AdminRequiredMixin, View):
    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        form = CourseForm(instance=course)
        return render(request, "academics/course_form.html", {"form": form, "course": course, "title": "Edit Course"})

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, "Course updated.")
            return redirect("academics:course_list")
        return render(request, "academics/course_form.html", {"form": form, "course": course, "title": "Edit Course"})


class RoutineSlotListView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")

        user = request.user
        slots = RoutineSlot.objects.select_related("section__academic_class", "course", "teacher")

        if user.role == User.Role.TEACHER:
            slots = slots.filter(teacher=user)
        elif user.role == User.Role.STUDENT:
            student_profile = getattr(user, "student_profile", None)
            if student_profile:
                slots = slots.filter(section=student_profile.section)
            else:
                slots = slots.none()

        # Group by weekday
        days = {
            i: {
                "name": label,
                "slots": [s for s in slots if s.weekday == i],
            }
            for i, label in RoutineSlot.Weekday.choices
        }

        form = RoutineSlotForm() if (user.role == User.Role.ADMIN or user.is_superuser) else None
        return render(
            request,
            "academics/routine_list.html",
            {
                "days": days,
                "form": form,
                "is_admin": (user.role == User.Role.ADMIN or user.is_superuser),
            },
        )

    def post(self, request):
        if not (request.user.is_authenticated and (request.user.role == User.Role.ADMIN or request.user.is_superuser)):
            messages.error(request, "Only administrators can modify timetable schedules.")
            return redirect("academics:routine_list")

        form = RoutineSlotForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Routine slot added successfully without conflict.")
        else:
            for err in form.non_field_errors():
                messages.error(request, err)
            for field, errs in form.errors.items():
                if field != "__all__":
                    messages.error(request, f"{field.capitalize()}: {errs[0]}")
        return redirect("academics:routine_list")


class RoutineSlotDeleteView(AdminRequiredMixin, View):
    def post(self, request, pk):
        slot = get_object_or_404(RoutineSlot, pk=pk)
        slot.delete()
        messages.success(request, "Routine slot removed.")
        return redirect("academics:routine_list")


class GenerateSessionsView(AdminRequiredMixin, View):
    def get(self, request):
        form = SessionGenerationForm()
        return render(request, "academics/generate_sessions.html", {"form": form})

    def post(self, request):
        form = SessionGenerationForm(request.POST)
        if form.is_valid():
            course = form.cleaned_data["course"]
            start_date = form.cleaned_data["start_date"]
            end_date = form.cleaned_data["end_date"]
            if start_date > end_date:
                messages.error(request, "Start date cannot be after end date.")
                return render(request, "academics/generate_sessions.html", {"form": form})

            created_sessions = AcademicService.generate_sessions_from_routine(course, start_date, end_date)
            messages.success(request, f"Generated {len(created_sessions)} course sessions for '{course.name}'.")
            return redirect("academics:session_list")
        return render(request, "academics/generate_sessions.html", {"form": form})


class CourseSessionListView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")

        user = request.user
        sessions = CourseSession.objects.select_related("course", "section", "taught_by")

        if user.role == User.Role.TEACHER:
            sessions = sessions.filter(taught_by=user)
        elif user.role == User.Role.STUDENT:
            student_profile = getattr(user, "student_profile", None)
            if student_profile:
                sessions = sessions.filter(section=student_profile.section)
            else:
                sessions = sessions.none()

        paginator = Paginator(sessions, 20)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "academics/session_list.html", {"sessions": page_obj})
