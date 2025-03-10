import { Link, useLocation } from "react-router-dom"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "ICO Details", path: "/ico-details" },
    { name: "Buy Tokens", path: "/buy" },
    { name: "Token Balance", path: "/balance" },
    { name: "Staking", path: "/staking" },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Solana ICO
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? "border-blue-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar










































// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// const Navbar = () => {
//   const location = useLocation();

//   const navItems = [
//     { name: 'Dashboard', path: '/' },
//     { name: 'ICO Details', path: '/ico-details' },
//     { name: 'Buy Tokens', path: '/buy' },
//     { name: 'Token Balance', path: '/balance' },
//   ];

//   const isActive = (path) => location.pathname === path;

//   return (
//     <nav className="bg-white shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex">
//             <div className="flex-shrink-0 flex items-center">
//               <Link to="/" className="text-2xl font-bold text-blue-600">
//                 Solana ICO
//               </Link>
//             </div>
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               {navItems.map((item) => (
//                 <Link
//                   key={item.name}
//                   to={item.path}
//                   className={`${
//                     isActive(item.path)
//                       ? 'border-blue-500 text-gray-900'
//                       : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
//                   } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//           </div>
//           <div className="hidden sm:ml-6 sm:flex sm:items-center">
//             <WalletMultiButton className="!bg-blue-500 hover:!bg-blue-600" />
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

