from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from employees.models import Attendance, Employee
from employees.api.serializers import AttendanceSerializer


class AttendanceViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    """
    ViewSet for Attendance model.

    Nested under /employees/<employee_id>/attendance/
    All operations are scoped to the employee identified by the URL.
    """
    serializer_class = AttendanceSerializer

    def _get_employee(self):
        """Look up the employee from the URL kwargs (employee_id field)."""
        employee_id = self.kwargs['employee_id']
        return get_object_or_404(Employee, employee_id=employee_id)

    def get_queryset(self):
        """Return attendance records for the employee, with optional date filters."""
        employee = self._get_employee()
        queryset = Attendance.objects.filter(employee=employee)

        # Filter by start date
        start_date = self.request.query_params.get('start_date', None)
        if start_date:
            try:
                start = parse_date(start_date)
                if start:
                    queryset = queryset.filter(date__gte=start)
            except (ValueError, TypeError):
                pass

        # Filter by end date
        end_date = self.request.query_params.get('end_date', None)
        if end_date:
            try:
                end = parse_date(end_date)
                if end:
                    queryset = queryset.filter(date__lte=end)
            except (ValueError, TypeError):
                pass

        return queryset

    def perform_create(self, serializer):
        """Automatically assign the employee from the URL to the attendance record."""
        employee = self._get_employee()
        serializer.save(employee=employee)

    def create(self, request, *args, **kwargs):
        """Create attendance with duplicate handling."""
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
                        'non_field_errors': ['Attendance for this employee on this date already exists.']
                    }
                },
                status=status.HTTP_409_CONFLICT
            )

