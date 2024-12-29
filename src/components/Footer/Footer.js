import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 pt-10">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-orange-500 mb-4">Unifitz</h3>
            <p className="text-gray-400 leading-relaxed">
              Transform your life through movement. Join our fitness community and discover the best version of yourself.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-500">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#programs" className="hover:text-white transition-colors">
                  Programs
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-white transition-colors">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#bmi" className="hover:text-white transition-colors">
                  BMI Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-500">Our Programs</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Zumba Classes
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Yoga Sessions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Bodyweight Training
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Personal Training
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-orange-500">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-orange-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-orange-500" />
                <span>info@unifitz.com</span>
              </li>
              <li className="flex items-center">
                <MapPin size={20} className="mr-2 text-orange-500" />
                <span>123 Fitness Street, Gym City, ST 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Unifitz. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
