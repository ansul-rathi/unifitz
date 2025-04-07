/* eslint-disable react/prop-types */
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

/**
 * Footer component with site links and information
 * 
 * @param {Object} props - Component props
 * @param {Array} props.programs - Program links for footer
 * @param {Array} props.companyLinks - Company page links
 * @param {Object} props.contactInfo - Contact information
 * @param {Array} props.socialLinks - Social media links
 */
const Footer = ({
  programs = [
    { name: 'Home Fitness', path: '/' },
    { name: 'Zumba', path: '/zumba' },
    { name: 'Yoga', path: '/yoga' },
    { name: 'HIIT', path: '/hiit' },
    { name: 'Strength Training', path: '/strength' }
  ],
  companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Our Instructors', path: '/instructors' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact Us', path: '/contact' }
  ],
  contactInfo = {
    email: 'info@unifitz.in',
    phone: '+91 9876543210',
    location: 'Online Classes - Join from Anywhere'
  },
  socialLinks = [
    { name: 'Facebook', icon: <Facebook />, url: '#' },
    { name: 'Instagram', icon: <Instagram />, url: '#' },
    { name: 'Twitter', icon: <Twitter />, url: '#' },
    { name: 'LinkedIn', icon: <Linkedin />, url: '#' }
  ],
  ...rest
}) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-purple-950 to-black py-20 relative overflow-hidden" {...rest}>
      {/* Decorative top border */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo and company info */}
          <div>
            <div className="flex items-center mb-6">
              <img src="/logo.png" alt="UNIFITZ" className="h-12 mr-3" />
              <span className="text-2xl font-bold text-white">UNIFITZ</span>
            </div>
            <p className="text-gray-400 mb-6">
              Transform your fitness journey with your entire family at UNIFITZ. 
              Experience premium online fitness training from the comfort of your home.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name} 
                  href={social.url} 
                  aria-label={social.name}
                  className="text-gray-400 hover:text-pink-500 transition-colors"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Programs links */}
          <div>
            <h3 className="text-lg font-bold text-pink-400 mb-6">Programs</h3>
            <ul className="space-y-4">
              {programs.map((program) => (
                <li key={program.name}>
                  <Link 
                    to={program.path} 
                    className={`${program.name === 'Zumba' ? 'text-white font-medium' : 'text-gray-300'} hover:text-pink-400 transition-colors`}
                  >
                    {program.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h3 className="text-lg font-bold text-purple-400 mb-6">Company</h3>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact information */}
          <div>
            <h3 className="text-lg font-bold text-orange-400 mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="h-6 w-6 text-orange-400 mr-3 mt-0.5" />
                <span className="text-gray-300">{contactInfo.email}</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-6 w-6 text-orange-400 mr-3 mt-0.5" />
                <span className="text-gray-300">{contactInfo.phone}</span>
              </li>
              <li className="flex items-start">
                <MapPin className="h-6 w-6 text-orange-400 mr-3 mt-0.5" />
                <span className="text-gray-300">{contactInfo.location}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright and legal links */}
        <div className="pt-10 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© {currentYear} UNIFITZ. All rights reserved.</p>
            <div className="flex space-x-8">
              <Link to="/terms" className="text-gray-400 hover:text-pink-400 transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;