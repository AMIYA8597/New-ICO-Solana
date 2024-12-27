import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdminWallet } from '../utils/admin-check';

const Sidebar = () => {
  const location = useLocation();
  const { publicKey } = useWallet();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Buy Tokens', href: '/buy', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Token Balance', href: '/balance', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  ];

  const adminNavigation = [
    { name: 'Manage Investors', href: '/manage-investors', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Update ICO Parameters', href: '/update-parameters', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Distribute Tokens', href: '/distribute-tokens', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { name: 'End ICO', href: '/end-ico', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  const NavItem = ({ item, isAdmin = false }) => (
    <Link
      to={item.href}
      className={`${
        location.pathname === item.href
          ? 'bg-primary-100 text-primary-900'
          : 'text-gray-600 hover:bg-primary-50 hover:text-primary-900'
      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out`}
    >
      <svg
        className={`${
          location.pathname === item.href ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'
        } mr-3 flex-shrink-0 h-6 w-6 transition-colors duration-150 ease-in-out`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
      </svg>
      {item.name}
    </Link>
  );

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              {isAdminWallet(publicKey) && (
                <>
                  <div className="mt-8 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavigation.map((item) => (
                    <NavItem key={item.name} item={item} isAdmin />
                  ))}
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

