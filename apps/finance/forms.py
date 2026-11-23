from django import forms
from apps.enrollments.models import Enrollment
from .models import Payment, Expenditure


class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = ["enrollment", "amount", "method", "paid_on", "remarks"]
        widgets = {
            "enrollment": forms.Select(attrs={"class": "form-select"}),
            "amount": forms.NumberInput(attrs={"class": "form-control", "step": "50.00"}),
            "method": forms.Select(attrs={"class": "form-select"}),
            "paid_on": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
            "remarks": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Transaction ID / note"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["enrollment"].queryset = Enrollment.objects.filter(is_active=True).select_related(
            "student", "course"
        )


class ExpenditureForm(forms.ModelForm):
    class Meta:
        model = Expenditure
        fields = ["category", "purpose", "amount", "spent_on"]
        widgets = {
            "category": forms.Select(attrs={"class": "form-select"}),
            "purpose": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. Teacher Salary, Electricity Bill"}),
            "amount": forms.NumberInput(attrs={"class": "form-control", "step": "50.00"}),
            "spent_on": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
        }
