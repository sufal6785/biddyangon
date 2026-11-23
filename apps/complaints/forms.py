from django import forms
from .models import Complaint


class ComplaintSubmissionForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = ["subject", "body"]
        widgets = {
            "subject": forms.TextInput(attrs={"class": "form-control", "placeholder": "Brief title of your issue"}),
            "body": forms.Textarea(attrs={"class": "form-control", "rows": 4, "placeholder": "Describe your grievance or feedback in detail..."}),
        }


class ComplaintResolutionForm(forms.ModelForm):
    class Meta:
        model = Complaint
        fields = ["status", "admin_response"]
        widgets = {
            "status": forms.Select(attrs={"class": "form-select"}),
            "admin_response": forms.Textarea(attrs={"class": "form-control", "rows": 4, "placeholder": "Official resolution statement to the student..."}),
        }
