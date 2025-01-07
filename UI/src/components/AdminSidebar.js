import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Users, RefreshCw, Power, Share2, BarChart3, Sliders, Home, DollarSign } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const adminRoutes = [
    // {
    //   name: 'Dashboard',
    //   path: '/admin',
    //   icon: Home
    // },
    {
      name: 'Initialize ICO',
      path: '/admin/initialize-ico',
      icon: DollarSign
    },
    {
      name: 'Manage Investors',
      path: '/admin/manage-investors',
      icon: Users
    },
    {
      name: 'Update Round',
      path: '/admin/update-round',
      icon: RefreshCw
    },
    {
      name: 'Update Parameters',
      path: '/admin/update-parameters',
      icon: Sliders
    },
    {
      name: 'Distribute Tokens',
      path: '/admin/distribute-tokens',
      icon: Share2
    },
    {
      name: 'ICO Analytics',
      path: '/admin/analytics',
      icon: BarChart3
    },
    {
      name: 'End ICO',
      path: '/admin/end-ico',
      icon: Power
    }
  ];

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-semibold text-gray-800">Admin Portal</span>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {adminRoutes.map((route) => {
              const isActive = location.pathname === route.path;
              return (
                <Link
                  key={route.name}
                  to={route.path}
                  className={`${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  <route.icon
                    className={`${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5 transition-colors`}
                  />
                  {route.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;

