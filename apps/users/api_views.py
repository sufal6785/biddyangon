from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer
from apps.people.models import TeacherProfile, StudentProfile


@api_view(["POST"])
@permission_classes([AllowAny])
def login_api_view(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "").strip()

    if not username or not password:
        return Response(
            {"error": "Please provide both username and password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {"error": "Invalid username or password credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"error": "This account has been deactivated."},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)

    user_data = UserSerializer(user).data
    # Extra role details
    if user.role == User.Role.STUDENT and hasattr(user, "student_profile"):
        user_data["section_name"] = str(user.student_profile.section)
        user_data["roll_no"] = user.student_profile.roll_no
    elif user.role == User.Role.TEACHER and hasattr(user, "teacher_profile"):
        user_data["designation"] = user.teacher_profile.designation

    return Response({
        "token": token.key,
        "user": user_data,
        "message": f"Welcome, {user.get_full_name() or user.username}!",
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_api_view(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"message": "Successfully logged out."})


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile_api_view(request):
    user = request.user
    if request.method == "GET":
        data = UserSerializer(user).data
        if hasattr(user, "student_profile"):
            data["section"] = str(user.student_profile.section)
            data["roll_no"] = user.student_profile.roll_no
            data["guardian_name"] = user.student_profile.guardian_name
            data["guardian_phone"] = user.student_profile.guardian_phone
        elif hasattr(user, "teacher_profile"):
            data["designation"] = user.teacher_profile.designation
            data["qualification"] = user.teacher_profile.qualification
            data["joining_date"] = user.teacher_profile.joining_date
        return Response(data)

    elif request.method == "PUT":
        data = request.data
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.phone = data.get("phone", user.phone)
        user.location = data.get("location", user.location)
        user.save()

        if hasattr(user, "teacher_profile"):
            tp = user.teacher_profile
            tp.designation = data.get("designation", tp.designation)
            tp.qualification = data.get("qualification", tp.qualification)
            tp.save()
        elif hasattr(user, "student_profile"):
            sp = user.student_profile
            sp.guardian_name = data.get("guardian_name", sp.guardian_name)
            sp.guardian_phone = data.get("guardian_phone", sp.guardian_phone)
            sp.save()

        return Response({"message": "Profile updated successfully.", "user": UserSerializer(user).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_api_view(request):
    user = request.user
    old_password = request.data.get("old_password", "")
    new_password = request.data.get("new_password", "")

    if not user.check_password(old_password):
        return Response({"error": "Current password does not match."}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({"error": "New password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    # Refresh token
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)

    return Response({"message": "Password changed successfully.", "token": token.key})
