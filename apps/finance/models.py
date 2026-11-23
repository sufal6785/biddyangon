import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError


def generate_receipt_number():
    return f"RCP-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        BKASH = "BKASH", "bKash"
        NAGAD = "NAGAD", "Nagad"
        BANK = "BANK", "Bank Transfer"
        CARD = "CARD", "Debit/Credit Card"

    enrollment = models.ForeignKey(
        "enrollments.Enrollment",
        on_delete=models.PROTECT,
        related_name="payments",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Payment amount (must be positive)",
    )
    receipt_no = models.CharField(
        max_length=64,
        unique=True,
        default=generate_receipt_number,
        editable=False,
    )
    method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
    )
    paid_on = models.DateField(default=timezone.now)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="collected_payments",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(amount__gt=0), name="payment_amount_positive")
        ]
        ordering = ["-paid_on", "-created_at"]

    def save(self, *args, **kwargs):
        if self.pk is not None:
            # Check if this is an update attempt
            orig = Payment.objects.filter(pk=self.pk).first()
            if orig:
                raise ValidationError("Payment records are append-only and cannot be updated.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Payment records are append-only and cannot be deleted.")

    def __str__(self):
        return f"{self.receipt_no}: {self.amount} for {self.enrollment} on {self.paid_on}"


class Expenditure(models.Model):
    class Category(models.TextChoices):
        SALARY = "SALARY", "Teacher Salary"
        RENT = "RENT", "Premises Rent"
        UTILITIES = "UTILITIES", "Electricity / Internet / Water"
        STATIONERY = "STATIONERY", "Printing & Stationery"
        EQUIPMENT = "EQUIPMENT", "Lab / Classroom Equipment"
        MAINTENANCE = "MAINTENANCE", "Repairs & Maintenance"
        OTHER = "OTHER", "Miscellaneous"

    category = models.CharField(max_length=30, choices=Category.choices, default=Category.OTHER)
    purpose = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    spent_on = models.DateField(default=timezone.now)
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="recorded_expenses",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(amount__gt=0), name="expenditure_amount_positive")
        ]
        ordering = ["-spent_on", "-created_at"]

    def save(self, *args, **kwargs):
        if self.pk is not None:
            orig = Expenditure.objects.filter(pk=self.pk).first()
            if orig:
                raise ValidationError("Expenditure records are append-only and cannot be updated.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Expenditure records are append-only and cannot be deleted.")

    def __str__(self):
        return f"[{self.category}] {self.purpose}: {self.amount} on {self.spent_on}"
