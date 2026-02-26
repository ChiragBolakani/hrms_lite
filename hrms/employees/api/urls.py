from django.urls import path, include
from rest_framework.routers import DefaultRouter
from employees.api.views import DepartmentViewSet, EmployeeViewSet, AttendanceViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')

urlpatterns = [
    # Nested attendance routes under employees
    path(
        'employees/<str:employee_id>/attendance/',
        AttendanceViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='employee-attendance-list',
    ),
    path(
        'employees/<str:employee_id>/attendance/<int:pk>/',
        AttendanceViewSet.as_view({'delete': 'destroy'}),
        name='employee-attendance-detail',
    ),
    path('', include(router.urls)),
]

