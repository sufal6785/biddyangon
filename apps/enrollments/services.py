from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.users.models import User
from apps.academics.models import Course, Section
from .models import Enrollment


class EnrollmentService:
    @staticmethod
    @transaction.atomic
    def enroll_student(student: User, course: Course, fee_total: Decimal = None) -> Enrollment:
        if fee_total is None:
            fee_total = course.default_fee

        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            course=course,
            defaults={"fee_total": fee_total, "is_active": True},
        )
        if not created and not enrollment.is_active:
            enrollment.is_active = True
            enrollment.fee_total = fee_total
            enrollment.save()
        return enrollment

    @staticmethod
    @transaction.atomic
    def bulk_enroll_section(section: Section, course: Course, fee_total: Decimal = None):
        if fee_total is None:
            fee_total = course.default_fee

        students = User.objects.filter(student_profile__section=section, is_active=True)
        enrolled = []
        for student in students:
            enr = EnrollmentService.enroll_student(student, course, fee_total)
            enrolled.append(enr)
        return enrolled
