from django.contrib import admin
from .models import Department, Employee, Attendance


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'created_at', 'updated_at']
    search_fields = ['name']
    ordering = ['name']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'email', 'department', 'created_at']
    search_fields = ['full_name', 'email']
    list_filter = ['department', 'created_at']
    ordering = ['full_name']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'employee', 'date', 'status', 'created_at']
    search_fields = ['employee__full_name', 'employee__email']
    list_filter = ['status', 'date', 'created_at']
    ordering = ['-date', 'employee']
