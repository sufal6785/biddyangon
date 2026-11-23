from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.users.models import User
from .models import Complaint


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def complaints_api_view(request):
    user = request.user

    if request.method == "GET":
        status_filter = request.GET.get("status")

        if user.role == User.Role.STUDENT:
            # Student views only their complaints
            qs = Complaint.objects.filter(student=user).order_by("-created_at")
        elif user.role == User.Role.ADMIN or user.is_superuser:
            qs = Complaint.objects.select_related("student", "resolved_by").order_by("-created_at")
        else:
            return Response({"error": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        if status_filter:
            qs = qs.filter(status=status_filter)

        data = [
            {
                "id": c.id,
                "student_id": c.student.id,
                "student_username": c.student.username,
                "student_name": c.student.get_full_name() or c.student.username,
                "subject": c.subject,
                "body": c.body,
                "status": c.status,
                "status_display": c.get_status_display(),
                "admin_response": c.admin_response,
                "resolved_by": c.resolved_by.username if c.resolved_by else None,
                "created_at": c.created_at.strftime("%Y-%m-%d %H:%M"),
                "updated_at": c.updated_at.strftime("%Y-%m-%d %H:%M"),
            }
            for c in qs
        ]
        return Response(data)

    elif request.method == "POST":
        if user.role != User.Role.STUDENT:
            return Response({"error": "Only students can submit complaints/grievances."}, status=status.HTTP_403_FORBIDDEN)

        subject = request.data.get("subject", "").strip()
        body = request.data.get("body", "").strip()

        if not subject or not body:
            return Response({"error": "Subject and detailed description are required."}, status=status.HTTP_400_BAD_REQUEST)

        complaint = Complaint.objects.create(
            student=user,
            subject=subject,
            body=body,
            status=Complaint.Status.OPEN,
        )
        return Response({
            "id": complaint.id,
            "subject": complaint.subject,
            "status": complaint.status,
            "message": "Complaint submitted successfully.",
        }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resolve_complaint_api_view(request, pk):
    user = request.user
    if user.role != User.Role.ADMIN and not user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    complaint = Complaint.objects.filter(pk=pk).first()
    if not complaint:
        return Response({"error": "Complaint not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status", Complaint.Status.RESOLVED)
    admin_response = request.data.get("admin_response", "").strip()

    if new_status not in [Complaint.Status.OPEN, Complaint.Status.IN_PROGRESS, Complaint.Status.RESOLVED]:
        return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

    complaint.status = new_status
    if admin_response:
        complaint.admin_response = admin_response
    complaint.resolved_by = user
    complaint.save()

    return Response({
        "id": complaint.id,
        "status": complaint.status,
        "admin_response": complaint.admin_response,
        "message": f"Complaint #{complaint.id} status updated to {complaint.get_status_display()}.",
    })
