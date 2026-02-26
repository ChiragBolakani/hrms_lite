from rest_framework import serializers
from employees.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """Validate that department name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Department name cannot be empty.")
        return value.strip()

