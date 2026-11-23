from django import forms
from apps.academics.models import Course, SyllabusTopic
from apps.enrollments.models import Enrollment
from .models import Exam, ExamResult, ApprovalStatus


class ExamForm(forms.ModelForm):
    class Meta:
        model = Exam
        fields = ["course", "title", "date", "duration_minutes", "total_marks", "status", "syllabus_topics"]
        widgets = {
            "course": forms.Select(attrs={"class": "form-select"}),
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Midterm Assessment"}),
            "date": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
            "duration_minutes": forms.NumberInput(attrs={"class": "form-control"}),
            "total_marks": forms.NumberInput(attrs={"class": "form-control", "step": "0.50"}),
            "status": forms.Select(attrs={"class": "form-select"}),
            "syllabus_topics": forms.SelectMultiple(attrs={"class": "form-select", "size": "4"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["course"].queryset = Course.objects.filter(is_active=True)


class ResultEntryForm(forms.Form):
    enrollment = forms.ModelChoiceField(
        queryset=Enrollment.objects.filter(is_active=True).select_related("student", "course"),
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    marks_obtained = forms.DecimalField(
        max_digits=6,
        decimal_places=2,
        widget=forms.NumberInput(attrs={"class": "form-control", "step": "0.50"}),
    )
