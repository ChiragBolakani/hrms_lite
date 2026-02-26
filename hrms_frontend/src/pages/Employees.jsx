import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeesApi, departmentsApi } from '../services/api';
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
import { getErrorMessage } from '../utils/helpers';
import { PAGINATION_DEFAULT_PAGE_SIZE } from '../utils/constants';
import { validateEmail, validateEmployeeId, validateFullName, validateDepartment, validateForm } from '../utils/validation';

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentsLoading, setDepartmentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ employee_id: '', full_name: '', email: '', department: '' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGINATION_DEFAULT_PAGE_SIZE, count: 0 });

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await departmentsApi.list({ page_size: 100 });
      setDepartments((response.data.results || []).map((d) => ({ value: d.id, label: d.name })));
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.list({ page, page_size: pagination.pageSize });
      setEmployees(response.data.results || []);
      setPagination({ page, pageSize: pagination.pageSize, count: response.data.count || 0 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); fetchEmployees(pagination.page); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Frontend validation
    const validationErrors = validateForm(formData, {
      employee_id: [(value) => validateEmployeeId(value)],
      full_name: [(value) => validateFullName(value)],
      email: [(value) => validateEmail(value)],
      department: [(value) => validateDepartment(value)],
    });
    
    if (validationErrors) {
      setFormError({ errors: validationErrors, message: 'Validation failed' });
      return;
    }
    
    setSubmitting(true);
    try {
      await employeesApi.create({ ...formData, department: parseInt(formData.department) });
      setIsModalOpen(false);
      setFormData({ employee_id: '', full_name: '', email: '', department: '' });
      fetchEmployees(pagination.page);
    } catch (err) {
      setFormError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await employeesApi.get(id);
      setViewingEmployee(response.data);
      setIsViewModalOpen(true);
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    try {
      await employeesApi.delete(id);
      setDeleteConfirm(null);
      fetchEmployees(pagination.page);
    } catch (err) {
      setError(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => setFormData({ employee_id: '', full_name: '', email: '', department: '' });

  const columns = [
    {
      header: 'Employee',
      accessor: 'full_name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
            {row.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.full_name}</p>
            <p className="text-xs text-gray-500">{row.employee_id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => <span className="text-gray-600">{row.email}</span>,
    },
    {
      header: 'Department',
      accessor: 'department_name',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
          {row.department_name}
        </span>
      ),
    },
    {
      header: '',
      accessor: 'actions',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/attendance?employee_id=${row.employee_id}`)}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Attendance
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleView(row.id)}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View
          </Button>
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

  return (
    <div className="space-y-6">
      {/* Stats + Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 max-w-md">
          <StatCard
            title="Total Employees"
            value={pagination.count}
            loading={loading}
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <StatCard
            title="Departments"
            value={departments.length}
            loading={departmentsLoading}
            color="primary"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Employee
        </Button>
      </div>

      {error && !loading && <ErrorMessage error={error} className="mb-4" />}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState message="No employees yet" description="Create your first employee to get started." />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table columns={columns} data={employees} />
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            totalCount={pagination.count}
            pageSize={pagination.pageSize}
            onPageChange={(p) => fetchEmployees(p)}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); setFormError(null); }} title="Add Employee" size="lg">
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input label="Employee ID" name="employee_id" value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })} error={formError ? getErrorMessage(formError, 'employee_id') : null} required placeholder="e.g. EMP001" />
            <Input label="Full Name" name="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} error={formError ? getErrorMessage(formError, 'full_name') : null} required placeholder="e.g. John Doe" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input label="Email" name="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={formError ? getErrorMessage(formError, 'email') : null} required placeholder="e.g. john@company.com" />
            <Select label="Department" name="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} options={departments} error={formError ? getErrorMessage(formError, 'department') : null} required placeholder="Select department" disabled={departmentsLoading} />
          </div>
          {formError && !getErrorMessage(formError, 'employee_id') && !getErrorMessage(formError, 'full_name') && !getErrorMessage(formError, 'email') && !getErrorMessage(formError, 'department') && (
            <ErrorMessage error={formError} className="mb-4" />
          )}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); setFormError(null); }}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Employee</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setViewingEmployee(null); }} title="Employee Details">
        {viewingEmployee && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 font-bold text-lg">
                {viewingEmployee.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{viewingEmployee.full_name}</h4>
                <p className="text-sm text-gray-500">{viewingEmployee.employee_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                <p className="mt-1 text-sm text-gray-900">{viewingEmployee.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Department</p>
                <p className="mt-1 text-sm text-gray-900">{viewingEmployee.department_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created</p>
                <p className="mt-1 text-sm text-gray-900">{new Date(viewingEmployee.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</p>
                <p className="mt-1 text-sm text-gray-900">{new Date(viewingEmployee.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Employee" size="sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteConfirm?.full_name}"</span>? All associated attendance records will be removed.
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

export default Employees;
