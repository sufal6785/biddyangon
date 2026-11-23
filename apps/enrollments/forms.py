from decimal import Decimal
from django import forms
from django.contrib.auth import get_user_model
from apps.academics.models import Course, Section
from .models import Enrollment

User = get_user_model()


class EnrollmentForm(forms.ModelForm):
    class Meta:
        model = Enrollment
        fields = ["student", "course", "fee_total"]
        widgets = {
            "student": forms.Select(attrs={"class": "form-select"}),
            "course": forms.Select(attrs={"class": "form-select"}),
            "fee_total": forms.NumberInput(attrs={"class": "form-control", "step": "100.00"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["student"].queryset = User.objects.filter(role=User.Role.STUDENT, is_active=True).select_related("student_profile__section")
        self.fields["course"].queryset = Course.objects.filter(is_active=True)


class BulkSectionEnrollmentForm(forms.Form):
    section = forms.ModelChoiceField(
        queryset=Section.objects.select_related("academic_class").all(),
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    course = forms.ModelChoiceField(
        queryset=Course.objects.filter(is_active=True),
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    fee_total = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Leave blank to use default course fee",
        widget=forms.NumberInput(attrs={"class": "form-control", "placeholder": "Default course fee"}),
    )
