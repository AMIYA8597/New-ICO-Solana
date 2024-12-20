import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Navbar = () => {
  return (
    <nav className="bg-sky-950 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            
            {/* <img
              className="h-10 w-10 rounded-full"
              src="/placeholder.svg?height=40&width=40"
              alt="Logo"
            /> */}

            <img
              className="h-10 w-10 rounded-full"
              src="/JCK_and_JCKP.svg"
              alt="Logo"
              width="40"
              height="40"
            />

            <span className="ml-2 text-2xl font-semibold">Solana ICO Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/buy" className="hover:text-gray-200">Buy Tokens</Link>
            <Link to="/balance" className="hover:text-gray-200">Token Balance</Link>
            <WalletMultiButton className="!bg-sky-700 hover:!bg-sky-800" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

