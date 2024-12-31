import { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Menu, X } from 'lucide-react';

const NavLink = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="text-gray-300 hover:text-orange-500 transition-colors font-medium block"
  >
    {children}
  </a>
);

NavLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 shadow-lg backdrop-blur-md transition-colors duration-300 ${
        isScrolled ? 'bg-transparent' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h1 className="text-orange-500 text-3xl font-extrabold tracking-wider">
            Unifitz
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <NavLink href="#programs">Programs</NavLink>
            <NavLink href="#schedule">Schedule</NavLink>
            <NavLink href="#trainers">Trainers</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300 hover:text-orange-500 transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 transition-transform duration-200 rotate-180" />
            ) : (
              <Menu className="w-6 h-6 transition-transform duration-200" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-black/90 shadow-lg py-6 space-y-4 text-center z-40">
            <NavLink href="#programs" onClick={() => setIsMenuOpen(false)}>
              Programs
            </NavLink>
            <NavLink href="#schedule" onClick={() => setIsMenuOpen(false)}>
              Schedule
            </NavLink>
            <NavLink href="#trainers" onClick={() => setIsMenuOpen(false)}>
              Trainers
            </NavLink>
            <NavLink href="#contact" onClick={() => setIsMenuOpen(false)}>
              Contact
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
