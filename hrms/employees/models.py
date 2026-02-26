from django.db import models
from django.core.validators import EmailValidator


class Department(models.Model):
    """Department model for HRMS"""
    name = models.CharField(max_length=255, unique=True, null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'departments'


class Employee(models.Model):
    """Employee model for HRMS"""
    employee_id = models.CharField(max_length=255, unique=True, null=False, blank=False)
    full_name = models.CharField(max_length=255, null=False, blank=False)
    email = models.EmailField(unique=True, validators=[EmailValidator()], null=False, blank=False)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='employees')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'


class Attendance(models.Model):
    """Attendance model for HRMS"""
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'employee']
        unique_together = [['employee', 'date']]
