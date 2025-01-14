import { Mail, Phone, MapPin, Dumbbell, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 border-t border-yellow-500/20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="lg:pr-8">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="text-yellow-500" size={24} />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                UNIFITZ
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Where Strength Meets Style. Join our fitness community and discover the perfect blend of power and sophistication.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                <Facebook size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-500 mb-4">Quick Links</h4>
            <div className="grid grid-cols-2 gap-4">
              <a href="#programs" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Programs
              </a>
              <a href="#about" className="text-gray-400 hover:text-yellow-500 transition-colors">
                About Us
              </a>
              <a href="#trainers" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Trainers
              </a>
              <a href="#membership" className="text-gray-400 hover:text-yellow-500 transition-colors">
                Membership
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-yellow-500 mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center group">
                <Phone size={20} className="mr-3 text-yellow-500" />
                <span className="text-gray-400">+91 8107505074</span>
              </li>
              <li className="flex items-center group">
                <Mail size={20} className="mr-3 text-yellow-500" />
                <span className="text-gray-400">info@unifitz.com</span>
              </li>
              <li className="flex items-center group">
                <MapPin size={20} className="mr-3 text-yellow-500" />
                <span className="text-gray-400">Unifitz, Jaipur</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-yellow-500/20 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} UNIFITZ. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 lg:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;