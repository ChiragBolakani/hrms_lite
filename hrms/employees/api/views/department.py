from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from django.db import IntegrityError
from employees.models import Department
from employees.api.serializers import DepartmentSerializer


class DepartmentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """ViewSet for Department model"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def create(self, request, *args, **kwargs):
        """Create a department with duplicate handling"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except IntegrityError:
            return Response(
                {
                    'message': 'Validation failed',
                    'errors': {
                        'name': ['A department with this name already exists.']
                    }
                },
                status=status.HTTP_409_CONFLICT
            )

    def destroy(self, request, *args, **kwargs):
        """Delete a department, but only if no employees reference it"""
        instance = self.get_object()
        
        # Check if any employees reference this department
        if instance.employees.exists():
            return Response(
                {
                    'message': 'Cannot delete department',
                    'errors': {
                        'non_field_errors': ['Cannot delete department because it has associated employees.']
                    }
                },
                status=status.HTTP_409_CONFLICT
            )
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

