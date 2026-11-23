from django import forms
from .models import Class, Section, Course, RoutineSlot, CourseSession, SyllabusTopic


class ClassForm(forms.ModelForm):
    class Meta:
        model = Class
        fields = ["name", "code", "is_active"]
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Class 10 (SSC 2026)"}),
            "code": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. ssc26"}),
            "is_active": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }


class SectionForm(forms.ModelForm):
    class Meta:
        model = Section
        fields = ["academic_class", "name"]
        widgets = {
            "academic_class": forms.Select(attrs={"class": "form-select"}),
            "name": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Science-A"}),
        }


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ["academic_class", "name", "code", "total_sessions_planned", "default_fee", "is_active"]
        widgets = {
            "academic_class": forms.Select(attrs={"class": "form-select"}),
            "name": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Higher Mathematics"}),
            "code": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. H-MATH-10"}),
            "total_sessions_planned": forms.NumberInput(attrs={"class": "form-control"}),
            "default_fee": forms.NumberInput(attrs={"class": "form-control"}),
            "is_active": forms.CheckboxInput(attrs={"class": "form-check-input"}),
        }


class RoutineSlotForm(forms.ModelForm):
    class Meta:
        model = RoutineSlot
        fields = ["section", "course", "teacher", "weekday", "start_time", "end_time", "room"]
        widgets = {
            "section": forms.Select(attrs={"class": "form-select"}),
            "course": forms.Select(attrs={"class": "form-select"}),
            "teacher": forms.Select(attrs={"class": "form-select"}),
            "weekday": forms.Select(attrs={"class": "form-select"}),
            "start_time": forms.TimeInput(attrs={"class": "form-control", "type": "time"}),
            "end_time": forms.TimeInput(attrs={"class": "form-control", "type": "time"}),
            "room": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Room 201"}),
        }


class SessionGenerationForm(forms.Form):
    course = forms.ModelChoiceField(
        queryset=Course.objects.filter(is_active=True),
        widget=forms.Select(attrs={"class": "form-select"}),
    )
    start_date = forms.DateField(
        widget=forms.DateInput(attrs={"class": "form-control", "type": "date"}),
    )
    end_date = forms.DateField(
        widget=forms.DateInput(attrs={"class": "form-control", "type": "date"}),
    )
