from django.contrib import admin
from .models import Payment, Expenditure


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["receipt_no", "enrollment", "amount", "method", "paid_on", "received_by", "created_at"]
    list_filter = ["method", "paid_on", "created_at"]
    search_fields = ["receipt_no", "enrollment__student__username", "enrollment__course__name"]
    readonly_fields = ["receipt_no", "created_at"]

    def has_change_permission(self, request, obj=None):
        return False  # Append-only

    def has_delete_permission(self, request, obj=None):
        return False  # Append-only


@admin.register(Expenditure)
class ExpenditureAdmin(admin.ModelAdmin):
    list_display = ["purpose", "category", "amount", "spent_on", "recorded_by", "created_at"]
    list_filter = ["category", "spent_on", "created_at"]
    search_fields = ["purpose", "recorded_by__username"]
    readonly_fields = ["created_at"]

    def has_change_permission(self, request, obj=None):
        return False  # Append-only

    def has_delete_permission(self, request, obj=None):
        return False  # Append-only
