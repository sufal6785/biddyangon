from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from django.core.paginator import Paginator
from django.db.models import Q
from apps.core.mixins import AdminRequiredMixin
from .models import Enrollment
from .forms import EnrollmentForm, BulkSectionEnrollmentForm
from .services import EnrollmentService


class EnrollmentListView(AdminRequiredMixin, View):
    def get(self, request):
        query = request.GET.get("q", "")
        enrollments = Enrollment.objects.select_related("student__student_profile__section", "course").order_by("-enrolled_at")
        if query:
            enrollments = enrollments.filter(
                Q(student__username__icontains=query)
                | Q(student__first_name__icontains=query)
                | Q(course__name__icontains=query)
            )

        paginator = Paginator(enrollments, 20)
        page_number = request.GET.get("page")
        page_obj = paginator.get_page(page_number)
        return render(request, "enrollments/enrollment_list.html", {"enrollments": page_obj, "query": query})


class EnrollmentCreateView(AdminRequiredMixin, View):
    def get(self, request):
        form = EnrollmentForm()
        bulk_form = BulkSectionEnrollmentForm()
        return render(request, "enrollments/enrollment_form.html", {"form": form, "bulk_form": bulk_form})

    def post(self, request):
        action = request.POST.get("action")
        if action == "bulk_enroll":
            form = BulkSectionEnrollmentForm(request.POST)
            if form.is_valid():
                section = form.cleaned_data["section"]
                course = form.cleaned_data["course"]
                fee_total = form.cleaned_data["fee_total"] or course.default_fee
                enrolled = EnrollmentService.bulk_enroll_section(section, course, fee_total)
                messages.success(request, f"Enrolled {len(enrolled)} students from {section} into {course.name}.")
                return redirect("enrollments:enrollment_list")
        else:
            form = EnrollmentForm(request.POST)
            if form.is_valid():
                try:
                    form.save()
                    messages.success(request, "Student enrolled successfully.")
                    return redirect("enrollments:enrollment_list")
                except Exception as e:
                    messages.error(request, f"Enrollment error: {e}")

        bulk_form = BulkSectionEnrollmentForm()
        return render(request, "enrollments/enrollment_form.html", {"form": form, "bulk_form": bulk_form})


class EnrollmentToggleActiveView(AdminRequiredMixin, View):
    def post(self, request, pk):
        enr = get_object_or_404(Enrollment, pk=pk)
        if enr.is_active:
            # Unenroll / withdraw
            enr.is_active = False
            enr.save()
            messages.info(request, f"Enrollment for {enr.student.username} marked as inactive/withdrawn.")
        else:
            enr.is_active = True
            enr.save()
            messages.success(request, f"Enrollment for {enr.student.username} reactivated.")
        return redirect("enrollments:enrollment_list")
