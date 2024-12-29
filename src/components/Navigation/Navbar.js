// src/components/Navigation/Navbar.js
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NavLink = ({ href, children }) => (
  <a
    href={href}
    className="text-gray-300 hover:text-orange-500 transition-colors font-medium"
  >
    {children}
  </a>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-black/80 fixed w-full z-50 shadow-lg backdrop-blur-md">
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
