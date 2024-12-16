import React from 'react';
import { Link } from 'react-router-dom';
import IcoDetails from '../components/Icodetails';

import { Buffer } from "buffer/"; 
window.Buffer = Buffer;

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ICO Dashboard</h1>
      <IcoDetails />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/buy" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center">
          Buy Tokens
        </Link>
        <Link to="/balance" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-center">
          Check Balance
        </Link>
        <Link to="/manage-investors" className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-center">
          Manage Investors
        </Link>
        <Link to="/update-parameters" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-center">
          Update ICO Parameters
        </Link>
        <Link to="/distribute-tokens" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded text-center">
          Distribute Tokens
        </Link>
        <Link to="/end-ico" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-center">
          End ICO
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

