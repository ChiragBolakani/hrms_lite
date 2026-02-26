import { useState, useEffect } from 'react';
import { departmentsApi } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Pagination from '../components/common/Pagination';
import StatCard from '../components/common/StatCard';
import { getErrorMessage } from '../utils/helpers';
import { PAGINATION_DEFAULT_PAGE_SIZE } from '../utils/constants';
import { validateDepartmentName, validateForm } from '../utils/validation';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGINATION_DEFAULT_PAGE_SIZE,
    count: 0,
  });

  const fetchDepartments = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentsApi.list({ page, page_size: pagination.pageSize });
      setDepartments(response.data.results || []);
      setPagination({ page, pageSize: pagination.pageSize, count: response.data.count || 0 });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(pagination.page); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    // Frontend validation
    const validationErrors = validateForm(formData, {
      name: [(value) => validateDepartmentName(value)],
    });
    
    if (validationErrors) {
      setFormError({ errors: validationErrors, message: 'Validation failed' });
      return;
    }
    
    setSubmitting(true);
    try {
      await departmentsApi.create(formData);
      setIsModalOpen(false);
      setFormData({ name: '' });
      fetchDepartments(pagination.page);
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
      await departmentsApi.delete(id);
      setDeleteConfirm(null);
      fetchDepartments(pagination.page);
    } catch (err) {
      setError(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-600 font-semibold text-sm">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (row) => (
        <span className="text-gray-500">{new Date(row.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      ),
    },
    {
      header: '',
      accessor: 'actions',
      render: (row) => (
        <div className="flex justify-end">
          <Button
            variant="danger-ghost"
            size="sm"
            onClick={() => setDeleteConfirm(row)}
            disabled={isDeleting === row.id}
          >
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
            title="Total Departments"
            value={pagination.count}
            loading={loading}
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
          Add Department
        </Button>
      </div>

      {error && !loading && <ErrorMessage error={error} className="mb-4" />}

      {/* Table Card */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <EmptyState
            message="No departments yet"
            description="Create your first department to get started."
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table columns={columns} data={departments} />
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            totalCount={pagination.count}
            pageSize={pagination.pageSize}
            onPageChange={(p) => fetchDepartments(p)}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFormData({ name: '' }); setFormError(null); }}
        title="Add Department"
      >
        <form onSubmit={handleCreate}>
          <Input
            label="Department Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            error={formError ? getErrorMessage(formError, 'name') : null}
            required
            placeholder="e.g. Engineering"
          />
          {formError && !getErrorMessage(formError, 'name') && (
            <ErrorMessage error={formError} className="mb-4" />
          )}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); setFormData({ name: '' }); setFormError(null); }}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>Create Department</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Department"
        size="sm"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteConfirm?.name}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        {error && <ErrorMessage error={error} className="mb-4" />}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDelete(deleteConfirm.id)} loading={isDeleting === deleteConfirm?.id}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Departments;
