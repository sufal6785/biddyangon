from django import forms
from apps.academics.models import Course
from .models import Question


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = ["course", "text", "option_a", "option_b", "option_c", "option_d", "correct_option", "marks"]
        widgets = {
            "course": forms.Select(attrs={"class": "form-select"}),
            "text": forms.Textarea(attrs={"class": "form-control", "rows": 3, "placeholder": "Enter question text or problem statement..."}),
            "option_a": forms.TextInput(attrs={"class": "form-control", "placeholder": "Option A"}),
            "option_b": forms.TextInput(attrs={"class": "form-control", "placeholder": "Option B"}),
            "option_c": forms.TextInput(attrs={"class": "form-control", "placeholder": "Option C"}),
            "option_d": forms.TextInput(attrs={"class": "form-control", "placeholder": "Option D"}),
            "correct_option": forms.Select(attrs={"class": "form-select"}),
            "marks": forms.NumberInput(attrs={"class": "form-control", "step": "0.50"}),
        }

    def __init__(self, *args, **kwargs):
        user = kwargs.pop("user", None)
        super().__init__(*args, **kwargs)
        if user and user.role == user.Role.TEACHER:
            self.fields["course"].queryset = Course.objects.filter(teacher_assignments__teacher=user, is_active=True)
        else:
            self.fields["course"].queryset = Course.objects.filter(is_active=True)
