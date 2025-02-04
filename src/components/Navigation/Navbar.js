/* eslint-disable import/no-unused-modules */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import ContactForm from './ContactForm'; // Make sure to import your ContactForm component

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  // const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-md shadow-lg py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4">
          <Link className="flex justify-between items-center" to={'/'}>
            {/* Logo Section */}
            <div className="flex items-center gap-2">
              <img 
                src='../../../logo/logo4.png' 
                alt="UNIFITZ Logo"
                className="h-16 w-16 object-contain"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                UNIFITZ
              </h1>
            </div>

            {/* Join Now Button */}
            {/* <button 
              onClick={() => setIsContactOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold rounded-lg 
                hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
              Join Now
            </button> */}
          </Link>
        </div>
      </nav>

      {/* Contact Form Modal */}
      {/* <ContactForm 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      /> */}
    </>
  );
};

export default Navbar;

// import { useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
// import { Menu, X } from 'lucide-react';

// const NavLink = ({ href, children, onClick }) => (
//   <a
//     href={href}
//     onClick={onClick}
//     className="text-gray-300 hover:text-yellow-500 transition-colors duration-300 font-medium relative group"
//   >
//     {children}
//     <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
//   </a>
// );

// NavLink.propTypes = {
//   href: PropTypes.string.isRequired,
//   children: PropTypes.node.isRequired,
//   onClick: PropTypes.func,
// };

// const Navbar = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <nav
//       className={`fixed w-full z-50 transition-all duration-300 ${
//         isScrolled 
//           ? 'bg-black/95 backdrop-blur-md shadow-lg py-2' 
//           : 'bg-transparent py-4'
//       }`}
//     >
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center">
//           {/* Logo Section */}
//           <div className="flex items-center gap-2">
//             <img 
//               src='../../../logo/logo4.png' 
//               alt="UNIFITZ Logo"
//               className="h-16 w-16 object-contain"
//             />
//             <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
//               UNIFITZ
//             </h1>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center gap-8">
//             <NavLink href="#programs">Programs</NavLink>
//             <NavLink href="#schedule">Schedule</NavLink>
//             <NavLink href="#trainers">Trainers</NavLink>
//             <NavLink href="#contact">Contact</NavLink>
//             <button className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105">
//               Join Now
//             </button>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden text-yellow-500 hover:text-yellow-400 transition-all p-2"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             aria-label="Toggle Menu"
//           >
//             {isMenuOpen ? (
//               <X className="w-6 h-6 transition-transform duration-300 rotate-180" />
//             ) : (
//               <Menu className="w-6 h-6 transition-transform duration-300" />
//             )}
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md shadow-lg border-t border-yellow-500/20">
//             <div className="container mx-auto py-6 space-y-6 flex flex-col items-center">
//               <NavLink href="#programs" onClick={() => setIsMenuOpen(false)}>
//                 Programs
//               </NavLink>
//               <NavLink href="#schedule" onClick={() => setIsMenuOpen(false)}>
//                 Schedule
//               </NavLink>
//               <NavLink href="#trainers" onClick={() => setIsMenuOpen(false)}>
//                 Trainers
//               </NavLink>
//               <NavLink href="#contact" onClick={() => setIsMenuOpen(false)}>
//                 Contact
//               </NavLink>
//               <button className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300 w-32">
//                 Join Now
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;