from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from django.db import IntegrityError
from employees.models import Employee
from employees.api.serializers import EmployeeSerializer


class EmployeeViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """ViewSet for Employee model"""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    def create(self, request, *args, **kwargs):
        """Create an employee with duplicate handling"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except IntegrityError as e:
            error_message = str(e)
            errors = {}
            
            if 'unique constraint' in error_message.lower() or 'duplicate key' in error_message.lower():
                if 'employee_id' in error_message.lower():
                    errors['employee_id'] = ['An employee with this employee ID already exists.']
                elif 'email' in error_message.lower():
                    errors['email'] = ['An employee with this email already exists.']
            
            if not errors:
                errors['non_field_errors'] = ['An employee with this information already exists.']
            
            return Response(
                {
                    'message': 'Validation failed',
                    'errors': errors
                },
                status=status.HTTP_409_CONFLICT
            )

