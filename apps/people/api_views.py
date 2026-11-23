from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.users.models import User
from apps.academics.models import Section, Course
from .models import TeacherProfile, StudentProfile, TeacherAssignment


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def teachers_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        teachers = User.objects.filter(role=User.Role.TEACHER).select_related("teacher_profile").order_by("-date_joined")
        data = [
            {
                "id": t.id,
                "username": t.username,
                "first_name": t.first_name,
                "last_name": t.last_name,
                "email": t.email,
                "phone": t.phone,
                "designation": getattr(t.teacher_profile, "designation", "Instructor"),
                "qualification": getattr(t.teacher_profile, "qualification", ""),
                "is_active": t.is_active,
                "assignments_count": t.assignments.count(),
            }
            for t in teachers
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        username = d.get("username", "").strip()
        password = d.get("password", "teacher123").strip()
        if not username:
            return Response({"error": "Username is required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                first_name=d.get("first_name", ""),
                last_name=d.get("last_name", ""),
                email=d.get("email", ""),
                phone=d.get("phone", ""),
                password=password,
                role=User.Role.TEACHER,
            )
            TeacherProfile.objects.create(
                user=user,
                designation=d.get("designation", "Instructor"),
                qualification=d.get("qualification", ""),
            )
        return Response({"id": user.id, "username": user.username}, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def students_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        students = User.objects.filter(role=User.Role.STUDENT).select_related(
            "student_profile__section__academic_class"
        ).order_by("-date_joined")
        data = [
            {
                "id": s.id,
                "username": s.username,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "email": s.email,
                "phone": s.phone,
                "location": s.location,
                "section_id": s.student_profile.section.id if hasattr(s, "student_profile") else None,
                "section_name": str(s.student_profile.section) if hasattr(s, "student_profile") else "N/A",
                "roll_no": s.student_profile.roll_no if hasattr(s, "student_profile") else None,
                "guardian_name": s.student_profile.guardian_name if hasattr(s, "student_profile") else "",
                "guardian_phone": s.student_profile.guardian_phone if hasattr(s, "student_profile") else "",
                "is_active": s.is_active,
            }
            for s in students
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        section_id = d.get("section")
        roll_no = d.get("roll_no")
        sec = Section.objects.filter(pk=section_id).first()
        if not sec or not roll_no:
            return Response({"error": "Section and Roll Number are required."}, status=status.HTTP_400_BAD_REQUEST)

        if StudentProfile.objects.filter(section=sec, roll_no=roll_no).exists():
            return Response({"error": f"Roll {roll_no} already registered in {sec}."}, status=status.HTTP_400_BAD_REQUEST)

        base_username = f"{sec.academic_class.code}-{int(roll_no):03d}"
        username = base_username
        cnt = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}-{cnt}"
            cnt += 1

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                first_name=d.get("first_name", ""),
                last_name=d.get("last_name", ""),
                email=d.get("email", ""),
                phone=d.get("phone", ""),
                location=d.get("location", ""),
                password=d.get("password", "student123"),
                role=User.Role.STUDENT,
            )
            StudentProfile.objects.create(
                user=user,
                section=sec,
                roll_no=int(roll_no),
                guardian_name=d.get("guardian_name", ""),
                guardian_phone=d.get("guardian_phone", ""),
            )
        return Response({"id": user.id, "username": user.username}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_user_active_api_view(request, pk):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)
    user = User.objects.filter(pk=pk).first()
    if not user:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    user.is_active = not user.is_active
    user.save()
    return Response({"id": user.id, "is_active": user.is_active})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def teacher_assignments_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        assignments = TeacherAssignment.objects.select_related("teacher", "course").all()
        data = [
            {
                "id": a.id,
                "teacher_id": a.teacher.id,
                "teacher_name": a.teacher.get_full_name() or a.teacher.username,
                "course_id": a.course.id,
                "course_name": a.course.name,
                "course_code": a.course.code,
                "rate_per_session": float(a.rate_per_session),
            }
            for a in assignments
        ]
        return Response(data)

    elif request.method == "POST":
        d = request.data
        t_id = d.get("teacher")
        c_id = d.get("course")
        rate = d.get("rate_per_session", 0.00)
        assignment, created = TeacherAssignment.objects.update_or_create(
            teacher_id=t_id,
            course_id=c_id,
            defaults={"rate_per_session": rate},
        )
        return Response({"id": assignment.id, "rate_per_session": float(assignment.rate_per_session)}, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_teacher_assignment_api_view(request, pk):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)
    TeacherAssignment.objects.filter(pk=pk).delete()
    return Response({"message": "Assignment removed."})
