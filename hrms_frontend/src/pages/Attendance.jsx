import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { attendanceApi, employeesApi } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StatCard from '../components/common/StatCard';
import { getErrorMessage, formatDate } from '../utils/helpers';
import { ATTENDANCE_STATUS_OPTIONS, PAGINATION_DEFAULT_PAGE_SIZE } from '../utils/constants';
import { validateDate, validateStatus, validateForm } from '../utils/validation';

const Attendance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // The selected employee drives everything — attendance is fetched for this employee
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [filters, setFilters] = useState({ start_date: '', end_date: '' });

  const [formData, setFormData] = useState({ date: formatDate(new Date()), status: 'PRESENT' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGINATION_DEFAULT_PAGE_SIZE, count: 0 });

  // Fetch the list of employees for the selector
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await employeesApi.list({ page_size: 100 });
      const results = response.data.results || [];
      setEmployees(results.map((emp) => ({
        value: emp.employee_id,
        label: `${emp.full_name} (${emp.employee_id})`,
      })));
      // After employees are loaded, check for employee_id in URL query params
      const employeeIdFromUrl = searchParams.get('employee_id');
      if (employeeIdFromUrl) {
        // Verify the employee_id exists in the loaded employees list
        const employeeExists = results.some(emp => emp.employee_id === employeeIdFromUrl);
        if (employeeExists) {
          setSelectedEmployeeId(employeeIdFromUrl);
        }
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch attendance for the selected employee
  const fetchAttendance = async (page = 1) => {
    if (!selectedEmployeeId) return;

    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: pagination.pageSize };
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const response = await attendanceApi.list(selectedEmployeeId, params);
      setAttendance(response.data.results || []);
      setPagination({ page, pageSize: pagination.pageSize, count: response.data.count || 0 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEmployees(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch attendance whenever the selected employee changes
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchAttendance(1);
    } else {
      setAttendance([]);
      setPagination((prev) => ({ ...prev, page: 1, count: 0 }));
    }
  }, [selectedEmployeeId]);

  const handleApplyFilters = () => fetchAttendance(1);

  const handleClearFilters = () => {
    setFilters({ start_date: '', end_date: '' });
    setTimeout(() => fetchAttendance(1), 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Frontend validation — employee comes from the selector, only date + status in form
    const validationErrors = validateForm(formData, {
      date: [(value) => validateDate(value, 'Date')],
      status: [(value) => validateStatus(value)],
    });

    if (validationErrors) {
      setFormError({ errors: validationErrors, message: 'Validation failed' });
      return;
    }

    setSubmitting(true);
    try {
      await attendanceApi.create(selectedEmployeeId, {
        date: formData.date,
        status: formData.status,
      });
      setIsModalOpen(false);
      setFormData({ date: formatDate(new Date()), status: 'PRESENT' });
      fetchAttendance(pagination.page);
    } catch (err) {
      setFormError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    try {
      await attendanceApi.delete(selectedEmployeeId, id);
      setDeleteConfirm(null);
      fetchAttendance(pagination.page);
    } catch (err) {
      setError(err);
    } finally {
      setIsDeleting(null);
    }
  };

  // Compute stats from current page data
  const presentCount = attendance.filter((r) => r.status === 'PRESENT').length;
  const absentCount = attendance.filter((r) => r.status === 'ABSENT').length;

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-xs">
            {row.employee_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.employee_name}</p>
            <p className="text-xs text-gray-500">{row.employee_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'employee_email',
      render: (row) => <span className="text-gray-500">{row.employee_email}</span>,
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => (
        <span className="text-gray-700">
          {new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
            row.status === 'PRESENT'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {row.status === 'PRESENT' ? 'Present' : 'Absent'}
        </span>
      ),
    },
    {
      header: '',
      accessor: 'actions',
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="danger-ghost" size="sm" onClick={() => setDeleteConfirm(row)} disabled={isDeleting === row.id}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(pagination.count / pagination.pageSize);
  const hasActiveFilters = filters.start_date || filters.end_date;

  // Find the display label for the selected employee
  const selectedEmployeeLabel = employees.find((e) => e.value === selectedEmployeeId)?.label || '';

  return (
    <div className="space-y-6">
      {/* Selector + Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Employee Selector */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1 max-w-md">
                <Select
                  label="Select Employee"
                  name="selectedEmployee"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    // Update URL query param when employee changes
                    if (e.target.value) {
                      setSearchParams({ employee_id: e.target.value });
                    } else {
                      setSearchParams({});
                    }
                  }}
                  options={employees}
                  placeholder="Choose an employee to view attendance"
                  disabled={employeesLoading}
                />
              </div>
            </div>
          </div>
        </div>
        {selectedEmployeeId && (
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Mark Attendance
          </Button>
        )}
      </div>

      {/* No employee selected — prompt */}
      {!selectedEmployeeId && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            message="Select an employee"
            description="Choose an employee from the dropdown above to view and manage their attendance records."
          />
        </div>
      )}

      {/* Everything below only shows when an employee is selected */}
      {selectedEmployeeId && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <StatCard
              title="Total Records"
              value={pagination.count}
              loading={loading}
              color="blue"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
            />
            <StatCard
              title="Present (page)"
              value={presentCount}
              loading={loading}
              color="green"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Absent (page)"
              value={absentCount}
              loading={loading}
              color="red"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Date Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-700">Date Filters</h3>
              {hasActiveFilters && <span className="ml-2 w-2 h-2 rounded-full bg-primary-500" />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <Input
                label="Start Date"
                name="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
              <Input
                label="End Date"
                name="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
              <div className="flex gap-2 mb-4">
                <Button onClick={handleApplyFilters} className="flex-1">Apply</Button>
                <Button variant="secondary" onClick={handleClearFilters} className="flex-1">Clear</Button>
              </div>
            </div>
          </div>

          {error && !loading && <ErrorMessage error={error} />}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : attendance.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <EmptyState
                message="No attendance records found"
                description={hasActiveFilters ? 'Try adjusting your date filters.' : 'Mark attendance for this employee to get started.'}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <Table columns={columns} data={attendance} />
              <Pagination
                currentPage={pagination.page}
                totalPages={totalPages}
                totalCount={pagination.count}
                pageSize={pagination.pageSize}
                onPageChange={(p) => fetchAttendance(p)}
              />
            </div>
          )}
        </>
      )}

      {/* Create Modal — employee is pre-set from the selector, only date & status needed */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormData({ date: formatDate(new Date()), status: 'PRESENT' }); setFormError(null); }}
        title="Mark Attendance"
      >
        <form onSubmit={handleCreate}>
          {/* Show who we're marking attendance for */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-0.5">Employee</p>
            <p className="text-sm font-medium text-gray-900">{selectedEmployeeLabel}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formError ? getErrorMessage(formError, 'date') : null}
              required
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={ATTENDANCE_STATUS_OPTIONS}
              error={formError ? getErrorMessage(formError, 'status') : null}
              required
            />
          </div>

          {formError && !getErrorMessage(formError, 'date') && !getErrorMessage(formError, 'status') && (
            <ErrorMessage error={formError} className="mb-4" />
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setIsModalOpen(false); setFormData({ date: formatDate(new Date()), status: 'PRESENT' }); setFormError(null); }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>Mark Attendance</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Attendance Record" size="sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the attendance record for{' '}
            <span className="font-semibold text-gray-900">"{deleteConfirm?.employee_name}"</span> on{' '}
            <span className="font-semibold text-gray-900">
              {deleteConfirm?.date && new Date(deleteConfirm.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>?
          </p>
        </div>
        {error && <ErrorMessage error={error} className="mb-4" />}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)} loading={isDeleting === deleteConfirm?.id}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;
