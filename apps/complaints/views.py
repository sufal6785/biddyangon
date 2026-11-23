from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib import messages
from apps.core.mixins import AdminRequiredMixin, StudentRequiredMixin
from .models import Complaint
from .forms import ComplaintSubmissionForm, ComplaintResolutionForm


class ComplaintListView(AdminRequiredMixin, View):
    def get(self, request):
        status_filter = request.GET.get("status", "")
        complaints = Complaint.objects.select_related("student", "resolved_by").order_by("-created_at")
        if status_filter:
            complaints = complaints.filter(status=status_filter)

        return render(
            request,
            "complaints/complaint_list.html",
            {
                "complaints": complaints,
                "status_choices": Complaint.Status.choices,
                "selected_status": status_filter,
            },
        )


class ComplaintDetailAdminView(AdminRequiredMixin, View):
    def get(self, request, pk):
        complaint = get_object_or_404(Complaint.objects.select_related("student"), pk=pk)
        form = ComplaintResolutionForm(instance=complaint)
        return render(request, "complaints/complaint_detail.html", {"complaint": complaint, "form": form})

    def post(self, request, pk):
        complaint = get_object_or_404(Complaint, pk=pk)
        form = ComplaintResolutionForm(request.POST, instance=complaint)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.resolved_by = request.user
            obj.save()
            messages.success(request, f"Complaint status updated to {obj.get_status_display()}.")
            return redirect("complaints:complaint_list")
        return render(request, "complaints/complaint_detail.html", {"complaint": complaint, "form": form})


class StudentComplaintsView(StudentRequiredMixin, View):
    def get(self, request):
        # Student sees ONLY their own complaints
        complaints = Complaint.objects.filter(student=request.user).order_by("-created_at")
        form = ComplaintSubmissionForm()
        return render(
            request,
            "complaints/my_complaints.html",
            {
                "complaints": complaints,
                "form": form,
            },
        )

    def post(self, request):
        form = ComplaintSubmissionForm(request.POST)
        if form.is_valid():
            complaint = form.save(commit=False)
            complaint.student = request.user
            complaint.status = Complaint.Status.OPEN
            complaint.save()
            messages.success(request, "Your complaint has been submitted. Administration will review it shortly.")
            return redirect("complaints:my_complaints")
        complaints = Complaint.objects.filter(student=request.user).order_by("-created_at")
        return render(request, "complaints/my_complaints.html", {"complaints": complaints, "form": form})
