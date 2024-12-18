import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center ">
              <img
                className="h-8 w-8 rounded-full"
                src="/placeholder.svg?height=32&width=32"
                alt="Logo"
              />
              <span className="ml-2 text-xl font-semibold ">ICO Dashboard</span>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              to="/buy"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Buy Tokens
            </Link>
            <Link
              to="/balance"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Token Balance
            </Link>
            <div className="relative ml-4">
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

