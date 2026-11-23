from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Complaint

User = get_user_model()


class ComplaintsTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="admin_comp", password="password123", role=User.Role.ADMIN
        )
        self.student = User.objects.create_user(
            username="student_comp", password="password123", role=User.Role.STUDENT
        )
        self.other_student = User.objects.create_user(
            username="student_other", password="password123", role=User.Role.STUDENT
        )

    def test_complaint_lifecycle(self):
        # Student submits complaint
        self.client.login(username="student_comp", password="password123")
        response = self.client.post(
            reverse("complaints:my_complaints"),
            {"subject": "Projector not working", "body": "In Room 102 projector is flickering"},
        )
        self.assertRedirects(response, reverse("complaints:my_complaints"))
        complaint = Complaint.objects.get(student=self.student)
        self.assertEqual(complaint.status, Complaint.Status.OPEN)

        # Other student cannot see this complaint
        self.client.login(username="student_other", password="password123")
        response = self.client.get(reverse("complaints:my_complaints"))
        self.assertNotContains(response, "Projector not working")

        # Admin resolves complaint
        self.client.login(username="admin_comp", password="password123")
        response = self.client.post(
            reverse("complaints:complaint_detail", kwargs={"pk": complaint.pk}),
            {"status": Complaint.Status.RESOLVED, "admin_response": "Replaced HDMI cable today."},
        )
        self.assertRedirects(response, reverse("complaints:complaint_list"))
        complaint.refresh_from_db()
        self.assertEqual(complaint.status, Complaint.Status.RESOLVED)
        self.assertEqual(complaint.resolved_by, self.admin)

        # Student sees the admin response
        self.client.login(username="student_comp", password="password123")
        response = self.client.get(reverse("complaints:my_complaints"))
        self.assertContains(response, "Replaced HDMI cable today.")

    def test_negative_permission_complaints(self):
        self.client.login(username="student_comp", password="password123")
        response = self.client.get(reverse("complaints:complaint_list"))
        self.assertEqual(response.status_code, 403)
