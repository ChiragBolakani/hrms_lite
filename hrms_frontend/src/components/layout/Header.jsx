import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/departments': 'Departments',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
};

const pageDescriptions = {
  '/departments': 'Manage your organization departments',
  '/employees': 'Manage employee records',
  '/attendance': 'Track and manage attendance',
};

const Header = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const description = pageDescriptions[location.pathname] || '';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
