from datetime import timedelta
from django.db import transaction
from .models import RoutineSlot, CourseSession, Course


class AcademicService:
    @staticmethod
    @transaction.atomic
    def generate_sessions_from_routine(course: Course, start_date, end_date):
        """
        Generates CourseSession rows for a given course across the date range
        matching its configured RoutineSlot weekdays.
        """
        slots = RoutineSlot.objects.filter(course=course).select_related("section", "teacher")
        slots_by_weekday = {}
        for slot in slots:
            slots_by_weekday.setdefault(slot.weekday, []).append(slot)

        current_date = start_date
        created_sessions = []

        while current_date <= end_date:
            weekday = current_date.weekday()
            day_slots = slots_by_weekday.get(weekday, [])

            for slot in day_slots:
                session, created = CourseSession.objects.get_or_create(
                    course=course,
                    section=slot.section,
                    date=current_date,
                    defaults={
                        "taught_by": slot.teacher,
                        "topic": f"Session scheduled via timetable slot",
                        "held": False,
                    },
                )
                if created:
                    created_sessions.append(session)

            current_date += timedelta(days=1)

        return created_sessions
