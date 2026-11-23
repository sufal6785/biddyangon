from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.users.models import User
from apps.academics.models import Course, Section
from .models import Enrollment
from .services import EnrollmentService


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def enrollments_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        enrollments = Enrollment.objects.select_related("student__student_profile__section", "course").order_by("-enrolled_at")
        data = [
            {
                "id": e.id,
                "student_id": e.student.id,
                "student_name": e.student.get_full_name() or e.student.username,
                "student_username": e.student.username,
                "section_name": str(e.student.student_profile.section) if hasattr(e.student, "student_profile") else "",
                "course_id": e.course.id,
                "course_name": e.course.name,
                "course_code": e.course.code,
                "fee_total": float(e.fee_total),
                "total_paid": float(e.total_paid),
                "due_amount": float(e.due_amount),
                "is_cleared": e.is_cleared,
                "is_active": e.is_active,
            }
            for e in enrollments
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        student_id = d.get("student")
        course_id = d.get("course")
        student = User.objects.filter(pk=student_id).first()
        course = Course.objects.filter(pk=course_id).first()
        if not student or not course:
            return Response({"error": "Valid student and course required."}, status=status.HTTP_400_BAD_REQUEST)

        fee_total = Decimal(str(d.get("fee_total", course.default_fee)))
        enr = EnrollmentService.enroll_student(student, course, fee_total)
        return Response({"id": enr.id, "fee_total": float(enr.fee_total)}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def bulk_enroll_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    section_id = request.data.get("section")
    course_id = request.data.get("course")
    fee_total_input = request.data.get("fee_total")

    sec = Section.objects.filter(pk=section_id).first()
    course = Course.objects.filter(pk=course_id).first()
    if not sec or not course:
        return Response({"error": "Section and course required."}, status=status.HTTP_400_BAD_REQUEST)

    fee_total = Decimal(str(fee_total_input)) if fee_total_input else course.default_fee
    enrolled = EnrollmentService.bulk_enroll_section(sec, course, fee_total)
    return Response({"message": f"Enrolled {len(enrolled)} students from {sec.name}.", "count": len(enrolled)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_enrollment_active_api_view(request, pk):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    enr = Enrollment.objects.filter(pk=pk).first()
    if not enr:
        return Response({"error": "Enrollment not found."}, status=status.HTTP_404_NOT_FOUND)
    enr.is_active = not enr.is_active
    enr.save()
    return Response({"id": enr.id, "is_active": enr.is_active})
