// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { Home, DollarSign, Users, RefreshCw, Power, Settings, Share } from 'lucide-react';

// const Sidebar = () => {
//   const location = useLocation();

//   const isActive = (path) => location.pathname === path;

//   const navItems = [
//     { name: 'Dashboard', path: '/admin', icon: Home },
//     { name: 'Initialize ICO', path: '/admin/initialize-ico', icon: DollarSign },
//     { name: 'Manage Investors', path: '/admin/manage-investors', icon: Users },
//     { name: 'Update Round', path: '/admin/update-round', icon: RefreshCw },
//     { name: 'Update Parameters', path: '/admin/update-parameters', icon: Settings },
//     { name: 'Distribute Tokens', path: '/admin/distribute-tokens', icon: Share },
//     { name: 'End ICO', path: '/admin/end-ico', icon: Power },
//   ];

//   return (

    
//     <div className="flex flex-col w-64 bg-white shadow-md">
//       <div className="flex items-center justify-center h-20 shadow-md">
//         {/* <h1 className="text-3xl font-bold text-blue-600">Admin Panel</h1> */}
//       </div>
//       <ul className="flex flex-col py-4">
//         {navItems.map((item) => (
//           <li key={item.name}>
//             <Link
//               to={item.path}
//               className={`flex flex-row items-center h-12 transform hover:translate-x-2 transition-transform ease-in duration-200 ${
//                 isActive(item.path)
//                   ? 'text-blue-500 border-r-4 border-blue-500 bg-blue-50'
//                   : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
//               }`}
//             >
//               <span className="inline-flex items-center justify-center h-12 w-12 text-lg text-gray-400">
//                 <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-blue-500' : ''}`} />
//               </span>
//               <span className="text-sm font-medium">{item.name}</span>
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Sidebar;

