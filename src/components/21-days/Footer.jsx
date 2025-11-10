import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              21 Days Fitness Challenge
            </h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Transform your body, mind, and life with our internationally acclaimed habit-building fitness program. Join 5000+ members who have already achieved remarkable results.
            </p>
            <button
              onClick={scrollToPricing}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-full transform hover:scale-105 transition-all duration-200"
            >
              Start Your Journey
            </button>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#trainers" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Our Trainers
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-5 h-5 text-orange-400" />
                <a href="mailto:info@21dayschallenge.com" className="hover:text-orange-400 transition-colors duration-200">
                  info@21dayschallenge.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-5 h-5 text-orange-400" />
                <a href="tel:+919876543210" className="hover:text-orange-400 transition-colors duration-200">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <span>India & UAE</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-500 p-2 rounded-full transition-colors duration-200"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 21 Days Fitness Challenge. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for your transformation</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-orange-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-orange-400 transition-colors duration-200">
                Terms of Service
              </a>
              <span>•</span>
              <a href="#" className="hover:text-orange-400 transition-colors duration-200">
                Refund Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-orange-400 transition-colors duration-200">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
