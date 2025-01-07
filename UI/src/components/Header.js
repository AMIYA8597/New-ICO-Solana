import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdminWallet } from '../utils/admin-check';

const Header = () => {
  const { publicKey } = useWallet();

  return (
    <header className="bg-white shadow-md">
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1"> */}
            {/* <a href="/" className="text-2xl font-bold text-blue-600">
              Solana ICO Admin
            </a> */}
          {/* </div> */}
          {/* <div className="flex items-center justify-end md:flex-1 lg:w-0">
            {isAdminWallet(publicKey) && (
              <span className="mr-4 text-sm font-medium text-gray-500">Admin</span>
            )}
            <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600" />
          </div> */}
        {/* </div>
      </div> */}
    </header>
  );
};

export default Header;

