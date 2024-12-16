import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/">Solana ICO</Link>
        </div>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/buy" className="hover:text-gray-300">Buy Tokens</Link>
          <Link to="/balance" className="hover:text-gray-300">Balance</Link>
          <WalletMultiButton className="bg-blue-500 hover:bg-blue-600" />
        </nav>
      </div>
    </header>
  );
};

export default Header;

