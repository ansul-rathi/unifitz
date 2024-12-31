import { useState } from 'react';
import { Mail, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

const Footer = () => {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection((prevSection) => (prevSection === section ? null : section));
  };

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
          </div>

          {/* Collapsible Sections */}
          <div>
            <div
              className="flex justify-between items-center cursor-pointer mb-2 md:mb-0"
              onClick={() => toggleSection('quickLinks')}
            >
              <h4 className="text-lg font-semibold text-orange-500">Quick Links</h4>
              {openSection === 'quickLinks' ? (
                <ChevronUp className="text-orange-500" />
              ) : (
                <ChevronDown className="text-orange-500" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSection === 'quickLinks' ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <ul className="space-y-2 mt-2">
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
          </div>

          <div>
            <div
              className="flex justify-between items-center cursor-pointer mb-2 md:mb-0"
              onClick={() => toggleSection('programs')}
            >
              <h4 className="text-lg font-semibold text-orange-500">Our Programs</h4>
              {openSection === 'programs' ? (
                <ChevronUp className="text-orange-500" />
              ) : (
                <ChevronDown className="text-orange-500" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSection === 'programs' ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <ul className="space-y-2 mt-2">
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
          </div>

          <div>
            <div
              className="flex justify-between items-center cursor-pointer mb-2 md:mb-0"
              onClick={() => toggleSection('contact')}
            >
              <h4 className="text-lg font-semibold text-orange-500">Contact Us</h4>
              {openSection === 'contact' ? (
                <ChevronUp className="text-orange-500" />
              ) : (
                <ChevronDown className="text-orange-500" />
              )}
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openSection === 'contact' ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <ul className="space-y-4 mt-2">
                <li className="flex items-center">
                  <Phone size={20} className="mr-2 text-orange-500" />
                  <span>+91 8107505074</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="mr-2 text-orange-500" />
                  <span>info@unifitz.com</span>
                </li>
                <li className="flex items-center">
                  <MapPin size={20} className="mr-2 text-orange-500" />
                  <span>Unifitz, Jaipur</span>
                </li>
              </ul>
            </div>
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
