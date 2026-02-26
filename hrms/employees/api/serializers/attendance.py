from rest_framework import serializers
from employees.models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Serializer for Attendance model.

    The employee is set automatically from the URL (via perform_create in the view),
    so it is read-only here. The request body only needs 'date' and 'status'.
    """
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_email',
            'employee_id', 'date', 'status', 'created_at',
        ]
        read_only_fields = [
            'id', 'employee', 'employee_name', 'employee_email',
            'employee_id', 'created_at',
        ]

    def validate_status(self, value):
        """Validate status is PRESENT or ABSENT"""
        if value not in ['PRESENT', 'ABSENT']:
            raise serializers.ValidationError("Status must be either 'PRESENT' or 'ABSENT'.")
        return value

