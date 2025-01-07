import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white shadow-md mt-8">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Solana ICO Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;







































// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Github, Twitter, Facebook } from 'lucide-react';

// const Footer = () => {
//   return (
//     <footer className="bg-gray-800 text-white">
//       <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div>
//             <h3 className="text-lg font-semibold mb-4">About Solana ICO</h3>
//             <p className="text-gray-400">
//               Empowering the future of decentralized finance through our innovative Solana-based ICO platform.
//             </p>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
//             <ul className="space-y-2">
//               <li>
//                 <Link to="/" className="text-gray-400 hover:text-white transition">
//                   Home
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/ico-details" className="text-gray-400 hover:text-white transition">
//                   ICO Details
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/buy" className="text-gray-400 hover:text-white transition">
//                   Buy Tokens
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/balance" className="text-gray-400 hover:text-white transition">
//                   Token Balance
//                 </Link>
//               </li>
//             </ul>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
//             <div className="flex space-x-4">
//               <a
//                 href="https://github.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-400 hover:text-white transition"
//               >
//                 <Github className="h-6 w-6" />
//               </a>
//               <a
//                 href="https://twitter.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-400 hover:text-white transition"
//               >
//                 <Twitter className="h-6 w-6" />
//               </a>
//               <a
//                 href="https://facebook.com"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-gray-400 hover:text-white transition"
//               >
//                 <Facebook className="h-6 w-6" />
//               </a>
//             </div>
//           </div>
//         </div>
//         <div className="mt-8 pt-8 border-t border-gray-700 text-center">
//           <p className="text-gray-400">
//             &copy; {new Date().getFullYear()} Solana ICO. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

