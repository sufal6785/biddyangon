# Biddyangon Project Rules

1. **Derived Facts Only:** Every fact has one home table; totals (fees due, attendance %, salary earned, balance, and course progress) are never stored in the database, always derived dynamically via service methods or model properties.
2. **Append-Only Ledgers:** `Payment` and `Expenditure` tables are strictly append-only. There are no update or delete views for financial transactions. Adjustments require explicit compensating/reversal records.
3. **Strict Authorization & Role Mixins:** Every view must inherit from the appropriate role mixin (`AdminRequiredMixin`, `TeacherRequiredMixin`, `StudentRequiredMixin`) or enforce role verification. Never use raw `Model.objects.all()` in teacher or student facing endpoints.
4. **Mandatory Testing:** Every feature must ship with comprehensive unit tests, including both the happy path and negative permission denial tests (testing that other roles/users cannot access unauthorized resources).
5. **Atomic Transactions:** Wrap all financial operations (payments, expenditures, adjustments) and state changes (approvals, exam submissions, enrollment) in `transaction.atomic`.
6. **Money Types:** All currency and fee values must use `DecimalField(max_digits=10, decimal_places=2)`. Never use floating-point types for monetary values.
