from rest_framework import serializers
from employees.models import Employee, Department


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer for Employee model"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'department_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'department_name']

    def validate_full_name(self, value):
        """Validate that full_name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Full name cannot be empty.")
        return value.strip()

    def validate_email(self, value):
        """Validate email format"""
        if not value or not value.strip():
            raise serializers.ValidationError("Email cannot be empty.")
        return value.strip().lower()

    def validate_employee_id(self, value):
        """Validate that employee_id is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Employee ID cannot be empty.")
        return value.strip()

    def validate_department(self, value):
        """Validate that department exists"""
        if not value:
            raise serializers.ValidationError("Department is required.")
        if not Department.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Department does not exist.")
        return value

