from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.users.models import User
from .models import Class, Section, Course, RoutineSlot, CourseSession
from .services import AcademicService


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def classes_api_view(request):
    if request.method == "GET":
        classes = Class.objects.prefetch_related("sections").all()
        data = [
            {
                "id": c.id,
                "name": c.name,
                "code": c.code,
                "is_active": c.is_active,
                "sections": [{"id": s.id, "name": s.name} for s in c.sections.all()],
            }
            for c in classes
        ]
        return Response(data)

    elif request.method == "POST":
        if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
            return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)
        name = request.data.get("name", "").strip()
        code = request.data.get("code", "").strip()
        if not name or not code:
            return Response({"error": "Name and code are required."}, status=status.HTTP_400_BAD_REQUEST)
        cls, created = Class.objects.get_or_create(code=code, defaults={"name": name, "is_active": True})
        if not created:
            return Response({"error": "Class with this code already exists."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"id": cls.id, "name": cls.name, "code": cls.code}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sections_create_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)
    class_id = request.data.get("academic_class")
    name = request.data.get("name", "").strip()
    if not class_id or not name:
        return Response({"error": "Class ID and Section name are required."}, status=status.HTTP_400_BAD_REQUEST)
    cls = Class.objects.filter(pk=class_id).first()
    if not cls:
        return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)
    sec, created = Section.objects.get_or_create(academic_class=cls, name=name)
    if not created:
        return Response({"error": "Section already exists in this class."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"id": sec.id, "name": sec.name, "class": cls.name}, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def courses_api_view(request):
    if request.method == "GET":
        courses = Course.objects.select_related("academic_class").all()
        data = [
            {
                "id": c.id,
                "name": c.name,
                "code": c.code,
                "class_id": c.academic_class.id,
                "class_name": c.academic_class.name,
                "default_fee": float(c.default_fee),
                "total_sessions_planned": c.total_sessions_planned,
                "is_active": c.is_active,
            }
            for c in courses
        ]
        return Response(data)

    elif request.method == "POST":
        if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
            return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        class_obj = Class.objects.filter(pk=data.get("academic_class")).first()
        if not class_obj:
            return Response({"error": "Valid academic_class required."}, status=status.HTTP_400_BAD_REQUEST)
        course = Course.objects.create(
            academic_class=class_obj,
            name=data.get("name"),
            code=data.get("code"),
            default_fee=data.get("default_fee", 0.00),
            total_sessions_planned=data.get("total_sessions_planned", 30),
            is_active=data.get("is_active", True),
        )
        return Response({"id": course.id, "name": course.name, "code": course.code}, status=status.HTTP_201_CREATED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def routine_api_view(request):
    user = request.user
    if request.method == "GET":
        slots = RoutineSlot.objects.select_related("section__academic_class", "course", "teacher")
        if user.role == User.Role.TEACHER:
            slots = slots.filter(teacher=user)
        elif user.role == User.Role.STUDENT:
            sp = getattr(user, "student_profile", None)
            slots = slots.filter(section=sp.section) if sp else slots.none()

        data = [
            {
                "id": s.id,
                "weekday": s.weekday,
                "weekday_name": s.get_weekday_display(),
                "section_id": s.section.id,
                "section_name": s.section.name,
                "class_name": s.section.academic_class.name,
                "course_id": s.course.id,
                "course_name": s.course.name,
                "teacher_id": s.teacher.id,
                "teacher_name": s.teacher.get_full_name() or s.teacher.username,
                "start_time": s.start_time.strftime("%H:%M"),
                "end_time": s.end_time.strftime("%H:%M"),
                "room": s.room,
            }
            for s in slots
        ]
        return Response(data)

    elif request.method == "POST":
        if user.role != User.Role.ADMIN and not user.is_superuser:
            return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)
        d = request.data
        slot = RoutineSlot(
            section_id=d.get("section"),
            course_id=d.get("course"),
            teacher_id=d.get("teacher"),
            weekday=d.get("weekday"),
            start_time=d.get("start_time"),
            end_time=d.get("end_time"),
            room=d.get("room", ""),
        )
        try:
            slot.full_clean()
            slot.save()
            return Response({"message": "Routine slot added successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_sessions_api_view(request):
    if request.user.role != User.Role.ADMIN and not request.user.is_superuser:
        return Response({"error": "Admin required."}, status=status.HTTP_403_FORBIDDEN)

    course_id = request.data.get("course")
    start_date_str = request.data.get("start_date")
    end_date_str = request.data.get("end_date")

    course = Course.objects.filter(pk=course_id).first()
    if not course:
        return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except Exception:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    if start_date > end_date:
        return Response({"error": "Start date cannot be after end date."}, status=status.HTTP_400_BAD_REQUEST)

    sessions = AcademicService.generate_sessions_from_routine(course, start_date, end_date)
    return Response({"message": f"Generated {len(sessions)} sessions.", "count": len(sessions)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sessions_api_view(request):
    user = request.user
    sessions = CourseSession.objects.select_related("course", "section", "taught_by")
    if user.role == User.Role.TEACHER:
        sessions = sessions.filter(taught_by=user)
    elif user.role == User.Role.STUDENT:
        sp = getattr(user, "student_profile", None)
        sessions = sessions.filter(section=sp.section) if sp else sessions.none()

    data = [
        {
            "id": s.id,
            "course_id": s.course.id,
            "course_name": s.course.name,
            "section_name": s.section.name,
            "taught_by": s.taught_by.get_full_name() or s.taught_by.username if s.taught_by else "Unassigned",
            "date": str(s.date),
            "topic": s.topic,
            "held": s.held,
        }
        for s in sessions[:50]
    ]
    return Response(data)
