/**
 * Format date to YYYY-MM-DD format
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format datetime to readable format
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const d = new Date(dateTime);
  return d.toLocaleString();
};

/**
 * Get error message from API error response
 */
export const getErrorMessage = (error, field = null) => {
  if (!error) return null;
  
  // If a specific field is requested, only return error for that field
  if (field) {
    if (error.errors && error.errors[field]) {
      return Array.isArray(error.errors[field]) 
        ? error.errors[field][0] 
        : error.errors[field];
    }
    // Return null if the field doesn't have an error
    return null;
  }
  
  // If no field specified, return general errors
  if (error.errors && error.errors.non_field_errors) {
    return Array.isArray(error.errors.non_field_errors)
      ? error.errors.non_field_errors[0]
      : error.errors.non_field_errors;
  }
  
  return error.message || 'An error occurred';
};

/**
 * Get all error messages from API error response
 */
export const getAllErrorMessages = (error) => {
  if (!error || !error.errors) return [];
  
  const messages = [];
  
  Object.keys(error.errors).forEach((key) => {
    const fieldErrors = error.errors[key];
    if (Array.isArray(fieldErrors)) {
      fieldErrors.forEach((msg) => messages.push(`${key}: ${msg}`));
    } else {
      messages.push(`${key}: ${fieldErrors}`);
    }
  });
  
  return messages;
};

