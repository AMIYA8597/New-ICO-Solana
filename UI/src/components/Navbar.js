import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdminWallet } from '../utils/admin-check';
import { APP_NAME } from '../utils/constants';

const Navbar = () => {
  const location = useLocation();
  const { publicKey } = useWallet();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'ICO Details', path: '/ico-details' },
    { name: 'Buy Tokens', path: '/buy' },
    { name: 'Token Balance', path: '/balance' },
  ];

  const adminItems = [
    { name: 'Manage Investors', path: '/manage-investors' },
    { name: 'Update Parameters', path: '/update-parameters' },
    { name: 'Distribute Tokens', path: '/distribute-tokens' },
    { name: 'End ICO', path: '/end-ico' },
  ];

  const isAdmin = publicKey ? isAdminWallet(publicKey) : false;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                {APP_NAME}
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
              {isAdmin && (
                <div className="relative group">
                  <button className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Admin
                  </button>
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition ease-out duration-100">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {adminItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

