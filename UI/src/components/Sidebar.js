import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdminWallet } from '../utils/admin-check';
import { Home, CreditCard, Wallet, Users, Settings, Share2, Power, PlusCircle } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { publicKey } = useWallet();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Buy Tokens', href: '/buy', icon: CreditCard },
    { name: 'Token Balance', href: '/balance', icon: Wallet },
  ];

  const adminNavigation = [
    { name: 'Initialize ICO', href: '/initialize-ico', icon: PlusCircle },
    { name: 'Manage Investors', href: '/manage-investors', icon: Users },
    { name: 'Update Parameters', href: '/update-parameters', icon: Settings },
    { name: 'Distribute Tokens', href: '/distribute-tokens', icon: Share2 },
    { name: 'End ICO', href: '/end-ico', icon: Power },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r">
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <Icon className={`${
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                } mr-3 flex-shrink-0 h-6 w-6`} />
                {item.name}
              </Link>
            );
          })}

          {isAdminWallet(publicKey) && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-sm text-gray-500">Admin</span>
                </div>
              </div>

              {adminNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <Icon className={`${
                      isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`} />
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

