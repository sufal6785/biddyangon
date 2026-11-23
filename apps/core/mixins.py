from django.contrib.auth.mixins import AccessMixin
from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect
from django.contrib import messages
from apps.users.models import User


class RoleRequiredMixin(AccessMixin):
    """Base mixin to enforce role-based access control."""
    allowed_roles = []

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()

        if request.user.is_superuser:
            return super().dispatch(request, *args, **kwargs)

        if getattr(request.user, "role", None) not in self.allowed_roles:
            raise PermissionDenied("You do not have permission to access this resource.")

        return super().dispatch(request, *args, **kwargs)


class AdminRequiredMixin(RoleRequiredMixin):
    """Enforces that the user is an Administrator."""
    allowed_roles = [User.Role.ADMIN]


class TeacherRequiredMixin(RoleRequiredMixin):
    """Enforces that the user is a Teacher."""
    allowed_roles = [User.Role.TEACHER]


class StudentRequiredMixin(RoleRequiredMixin):
    """Enforces that the user is a Student."""
    allowed_roles = [User.Role.STUDENT]


class TeacherOrAdminRequiredMixin(RoleRequiredMixin):
    """Enforces that the user is a Teacher or Admin."""
    allowed_roles = [User.Role.ADMIN, User.Role.TEACHER]
