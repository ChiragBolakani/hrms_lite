from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from django.db import IntegrityError


def custom_exception_handler(exc, context):
    """Custom exception handler for DRF"""
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Customize the response data structure
    if response is not None:
        # DRF's default ValidationError response.data is already a dict with field names as keys
        # We need to wrap it in the expected format
        if isinstance(response.data, dict):
            # Check if it's already in our custom format
            if 'errors' in response.data and 'message' in response.data:
                # Already formatted, return as is
                pass
            else:
                # Wrap DRF's default format
                custom_response_data = {
                    'message': 'Validation failed' if response.status_code == 400 else 'An error occurred',
                    'errors': response.data
                }
                response.data = custom_response_data
    
    return response

