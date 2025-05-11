/* eslint-disable react/prop-types */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../common/Button';

/**
 * Header component for site navigation
 * 
 * @param {Object} props - Component props
 * @param {Array} props.navItems - Navigation items
 * @param {boolean} props.transparent - Whether header should be transparent initially
 * @param {boolean} props.fixed - Whether header should be fixed to top
 */
const Header = ({
  navItems = [
    { name: 'Home', path: '/' },
    { name: 'Programs', path: '/programs' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ],
  transparent = true,
  fixed = true,
  ...rest
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for transparent header
  useEffect(() => {
    if (!transparent) return;

    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const headerClass = `
    w-full ${fixed ? 'fixed' : 'relative'} top-0 left-0 z-50
    transition-all duration-300 py-4 md:py-6
    ${scrolled || !transparent || isMenuOpen 
      ? 'bg-purple-900/90 backdrop-blur-md shadow-lg' 
      : 'bg-transparent'}
  `;

  return (
    <header className={headerClass} {...rest}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {/* <img src="/logo.png" alt="UNIFITZ" className="h-12 mr-3" /> */}
            <span className="text-2xl font-bold text-white">UNIFITZ</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              className="text-white hover:text-yellow-300 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Join Button */}
        <div className="hidden md:block">
          <Button to="/join" variant="primary" size="md">
            Join Now
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-purple-900/95 backdrop-blur-md shadow-lg py-4">
          <nav className="container mx-auto px-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="text-white hover:text-yellow-300 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button to="/join" variant="primary" size="md" fullWidth>
              Join Now
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;