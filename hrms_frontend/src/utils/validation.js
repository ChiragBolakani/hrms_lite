/**
 * Validation utility functions for form validation
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
};

/**
 * Validate required field
 */
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate department selection
 */
export const validateDepartment = (departmentId) => {
  if (!departmentId || departmentId === '') {
    return 'Please select a department';
  }
  return null;
};

/**
 * Validate employee ID format (optional - can be customized)
 */
export const validateEmployeeId = (employeeId) => {
  if (!employeeId || !employeeId.trim()) {
    return 'Employee ID is required';
  }
  if (employeeId.trim().length < 2) {
    return 'Employee ID must be at least 2 characters';
  }
  return null;
};

/**
 * Validate full name
 */
export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return 'Full name is required';
  }
  if (fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters';
  }
  return null;
};

/**
 * Validate department name
 */
export const validateDepartmentName = (name) => {
  if (!name || !name.trim()) {
    return 'Department name is required';
  }
  if (name.trim().length < 2) {
    return 'Department name must be at least 2 characters';
  }
  return null;
};

/**
 * Validate date
 */
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) {
    return `${fieldName} is required`;
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  return null;
};

/**
 * Validate attendance status
 */
export const validateStatus = (status) => {
  if (!status || (status !== 'PRESENT' && status !== 'ABSENT')) {
    return 'Please select a valid status';
  }
  return null;
};

/**
 * Validate employee selection
 */
export const validateEmployee = (employeeId) => {
  if (!employeeId || employeeId === '') {
    return 'Please select an employee';
  }
  return null;
};

/**
 * Validate form data object
 * Returns object with field names as keys and error messages as values
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const error = rule(value, field);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return Object.keys(errors).length > 0 ? errors : null;
};

