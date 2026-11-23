from django import forms
from django.contrib.auth import get_user_model
from apps.academics.models import Section, Course
from .models import TeacherProfile, StudentProfile, TeacherAssignment

User = get_user_model()


class TeacherCreationForm(forms.Form):
    username = forms.CharField(
        max_length=150,
        widget=forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. rafiq10"}),
    )
    first_name = forms.CharField(max_length=150, widget=forms.TextInput(attrs={"class": "form-control"}))
    last_name = forms.CharField(max_length=150, widget=forms.TextInput(attrs={"class": "form-control"}))
    email = forms.EmailField(required=False, widget=forms.EmailInput(attrs={"class": "form-control"}))
    phone = forms.CharField(max_length=15, required=False, widget=forms.TextInput(attrs={"class": "form-control"}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Temporary Password"}),
        initial="teacher123",
    )
    designation = forms.CharField(
        max_length=100,
        initial="Instructor",
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )
    qualification = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={"class": "form-control"}),
    )


class StudentCreationForm(forms.Form):
    first_name = forms.CharField(max_length=150, widget=forms.TextInput(attrs={"class": "form-control"}))
    last_name = forms.CharField(max_length=150, widget=forms.TextInput(attrs={"class": "form-control"}))
    section = forms.ModelChoiceField(
        queryset=Section.objects.select_related("academic_class").all(),
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    roll_no = forms.IntegerField(
        min_value=1,
        widget=forms.NumberInput(attrs={"class": "form-control", "placeholder": "Roll inside section"}),
    )
    email = forms.EmailField(required=False, widget=forms.EmailInput(attrs={"class": "form-control"}))
    phone = forms.CharField(max_length=15, required=False, widget=forms.TextInput(attrs={"class": "form-control"}))
    location = forms.CharField(max_length=255, required=False, widget=forms.TextInput(attrs={"class": "form-control"}))
    guardian_name = forms.CharField(max_length=150, required=False, widget=forms.TextInput(attrs={"class": "form-control"}))
    guardian_phone = forms.CharField(max_length=15, required=False, widget=forms.TextInput(attrs={"class": "form-control"}))
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "placeholder": "Temporary Password"}),
        initial="student123",
    )


class TeacherAssignmentForm(forms.ModelForm):
    class Meta:
        model = TeacherAssignment
        fields = ["teacher", "course", "rate_per_session"]
        widgets = {
            "teacher": forms.Select(attrs={"class": "form-select"}),
            "course": forms.Select(attrs={"class": "form-select"}),
            "rate_per_session": forms.NumberInput(attrs={"class": "form-control", "step": "50.00"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["teacher"].queryset = User.objects.filter(role=User.Role.TEACHER, is_active=True)
        self.fields["course"].queryset = Course.objects.filter(is_active=True)
