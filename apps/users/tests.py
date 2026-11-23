from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


class AuthAndProfileTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.admin = User.objects.create_superuser(
            username="test_admin", password="password123", email="admin@test.com", role=User.Role.ADMIN
        )
        self.teacher = User.objects.create_user(
            username="test_teacher", password="password123", email="teacher@test.com", role=User.Role.TEACHER
        )
        self.student = User.objects.create_user(
            username="test_student", password="password123", email="student@test.com", role=User.Role.STUDENT
        )

    def test_login_redirect_by_role(self):
        # Admin login
        response = self.client.post(reverse("login"), {"username": "test_admin", "password": "password123"})
        self.assertRedirects(response, reverse("dashboard:index"), target_status_code=302)
        response = self.client.get(reverse("dashboard:index"))
        self.assertRedirects(response, reverse("dashboard:admin"))

        # Teacher login
        self.client.logout()
        response = self.client.post(reverse("login"), {"username": "test_teacher", "password": "password123"})
        self.assertRedirects(response, reverse("dashboard:index"), target_status_code=302)
        response = self.client.get(reverse("dashboard:index"))
        self.assertRedirects(response, reverse("dashboard:teacher"))

        # Student login
        self.client.logout()
        response = self.client.post(reverse("login"), {"username": "test_student", "password": "password123"})
        self.assertRedirects(response, reverse("dashboard:index"), target_status_code=302)
        response = self.client.get(reverse("dashboard:index"))
        self.assertRedirects(response, reverse("dashboard:student"))

    def test_negative_permission_denial(self):
        # Student trying to access Admin dashboard
        self.client.login(username="test_student", password="password123")
        response = self.client.get(reverse("dashboard:admin"))
        self.assertEqual(response.status_code, 403)

        # Teacher trying to access Admin dashboard
        self.client.login(username="test_teacher", password="password123")
        response = self.client.get(reverse("dashboard:admin"))
        self.assertEqual(response.status_code, 403)

        # Student trying to access Teacher dashboard
        self.client.login(username="test_student", password="password123")
        response = self.client.get(reverse("dashboard:teacher"))
        self.assertEqual(response.status_code, 403)

    def test_profile_view_and_update(self):
        self.client.login(username="test_student", password="password123")
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, 200)

        # Update profile
        response = self.client.post(
            reverse("profile"),
            {
                "first_name": "UpdatedFirst",
                "last_name": "UpdatedLast",
                "email": "updated@test.com",
                "phone": "01799999999",
                "location": "New Location",
            },
        )
        self.assertRedirects(response, reverse("profile"))
        self.student.refresh_from_db()
        self.assertEqual(self.student.first_name, "UpdatedFirst")
        self.assertEqual(self.student.location, "New Location")
        self.assertEqual(self.student.username, "test_student")
