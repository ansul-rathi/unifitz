/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Instagram, MapPin, Send, CheckCircle, ArrowRight } from 'lucide-react';
// We don't need EmailJS anymore since we're using WhatsApp
// import emailjs from '@emailjs/browser';
import Navbar from '../components/Navigation/Header';
import Button from '../components/common/Button';
import PropTypes from 'prop-types';

const ContactUs = () => {
  // Form state
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
    subject: 'General Inquiry',
  });
  
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    submitted: false,
    error: null
  });

  // Floating labels animation
  const [focused, setFocused] = useState({
    name: false,
    email: false,
    message: false,
  });

  // Ref for the form
  const form = useRef();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle focus/blur for floating labels
  const handleFocus = (field) => {
    setFocused((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleBlur = (field) => {
    if (!formState[field]) {
      setFocused((prev) => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  // Handle form submission - using WhatsApp instead of EmailJS
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, submitted: false, error: null });

    try {
      // Format the message for WhatsApp
      const formattedMessage = encodeURIComponent(
        `*New Contact Form Submission*\n\n` +
        `*Subject:* ${formState.subject}\n` +
        `*Name:* ${formState.name}\n` + 
        `*Email:* ${formState.email}\n\n` +
        `*Message:*\n${formState.message}`
      );

      // WhatsApp business number - replace with your UNIFITZ number
      const whatsappNumber = "917387846841"; // Format: country code + number (no + or spaces)
      
      // Create WhatsApp link
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${formattedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappLink, '_blank');
      
      // Update form status
      setFormStatus({ submitting: false, submitted: true, error: null });
      
      // Reset form
      setFormState({ name: '', email: '', message: '', subject: 'General Inquiry' });
      setFocused({ name: false, email: false, message: false });
    } catch (error) {
      console.error(error);
      setFormStatus({ submitting: false, submitted: false, error: 'Failed to send message. Please try again.' });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Contact card data
  const contactCards = [
    {
      title: "Call Us",
      icon: <Phone className="h-6 w-6 text-white" />,
      info: "+91 7387846841",
      color: "from-pink-500 to-purple-500",
      action: "tel:+917387846841",
      actionText: "Call Now"
    },
    {
      title: "Email Us",
      icon: <Mail className="h-6 w-6 text-white" />,
      info: "theunifitz@gmail.com",
      color: "from-purple-500 to-blue-500",
      action: "mailto:theunifitz@gmail.com",
      actionText: "Send Email"
    },
    {
      title: "Follow Us",
      icon: <Instagram className="h-6 w-6 text-white" />,
      info: "@unifitz.in",
      color: "from-orange-500 to-pink-500",
      action: "https://instagram.com/unifitz.in",
      actionText: "Visit Instagram"
    },
  ];

  // Inquiry options
  const inquiryOptions = [
    "General Inquiry",
    "Membership Questions",
    "Schedule a Demo",
    "Technical Support",
    "Partnership Opportunities"
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-violet-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background decorative elements - NO SVG PATTERN */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-bl-[100px] -z-10"></div>
        <div className="absolute -top-24 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-purple-400 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full filter blur-3xl opacity-20 -z-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <span className="text-pink-300 font-medium mr-2">Let's Connect</span>
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                <span className="text-white">Get in </span>
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-transparent bg-clip-text">Touch</span>
              </h1>

              <p className="text-xl text-gray-200 mb-10">
                Have questions about our fitness programs? Want to learn more about how UNIFITZ can transform your family's wellness journey? We'd love to hear from you!
              </p>

              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <a 
                  href="#contact-form" 
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <ArrowRight className="w-6 h-6 animate-pulse" />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Options Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactCards.map((card, index) => (
              <motion.div
                key={card.title}
                className="group"
                variants={itemVariants}
              >
                <div className="relative h-full bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg">
                  {/* Background gradient circle */}
                  <div className={`absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-gradient-to-r ${card.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r ${card.color} mb-6`}>
                      {card.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-lg text-gray-300 mb-6">{card.info}</p>
                    
                    <a 
                      href={card.action} 
                      target={card.title === "Follow Us" ? "_blank" : "_self"} 
                      rel={card.title === "Follow Us" ? "noreferrer" : ""}
                      className="inline-flex items-center text-white group-hover:text-pink-300 font-medium transition-colors"
                    >
                      {card.actionText} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section id="contact-form" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-purple-900 -z-10"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full filter blur-3xl opacity-20 -z-5"></div>
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full filter blur-3xl opacity-20 -z-5"></div>
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            <motion.div 
              className="lg:w-7/12 relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 lg:p-12 relative overflow-hidden">
                {/* Interactive elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full -z-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/30 to-purple-500/30 rounded-full -z-10 blur-xl"></div>
                
                <div className="relative">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Send us a message</h2>
                  <p className="text-gray-300 mb-8">Fill out the form below and we'll connect you with us via WhatsApp to discuss your needs.</p>
                  
                  {formStatus.submitted ? (
                    <motion.div 
                      className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="inline-flex items-center justify-center p-3 bg-green-500 rounded-full mb-4">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Message Ready!</h3>
                      <p className="text-gray-300 mb-6">Your message has been formatted and opened in WhatsApp. Please review and send it to complete your inquiry.</p>
                      <Button 
                        onClick={() => setFormStatus({submitted: false, submitting: false, error: null})}
                        variant="outline"
                        size="md"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                      {/* Subject Selection */}
                      <div>
                        <label htmlFor="subject" className="block text-gray-300 mb-2 font-medium">
                          What can we help you with?
                        </label>
                        <select 
                          name="subject" 
                          id="subject"
                          value={formState.subject}
                          onChange={handleChange}
                          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-pink-400 focus:outline-none transition-colors"
                        >
                          {inquiryOptions.map((option) => (
                            <option key={option} value={option} className="bg-purple-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Name Field */}
                      <div className="relative">
                        <input 
                          type="text" 
                          id="name"
                          name="name"
                          value={formState.name}
                          onChange={handleChange}
                          onFocus={() => handleFocus('name')}
                          onBlur={() => handleBlur('name')}
                          required
                          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-pink-400 focus:outline-none transition-colors peer"
                        />
                        <label 
                          htmlFor="name"
                          className={`absolute left-4 transition-all duration-200 ${
                            focused.name 
                              ? '-top-5 text-pink-300 text-sm' 
                              : 'top-3 text-gray-400'
                          }`}
                        >
                          Your Name
                        </label>
                      </div>
                      
                      {/* Email Field */}
                      <div className="relative">
                        <input 
                          type="email" 
                          id="email"
                          name="email"
                          value={formState.email}
                          onChange={handleChange}
                          onFocus={() => handleFocus('email')}
                          onBlur={() => handleBlur('email')}
                          required
                          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-pink-400 focus:outline-none transition-colors peer"
                        />
                        <label 
                          htmlFor="email"
                          className={`absolute left-4 transition-all duration-200 ${
                            focused.email 
                              ? '-top-5 text-pink-300 text-sm' 
                              : 'top-3 text-gray-400'
                          }`}
                        >
                          Your Email
                        </label>
                      </div>
                      
                      {/* Message Field */}
                      <div className="relative">
                        <textarea 
                          id="message"
                          name="message"
                          value={formState.message}
                          onChange={handleChange}
                          onFocus={() => handleFocus('message')}
                          onBlur={() => handleBlur('message')}
                          required
                          rows={4}
                          className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white focus:border-pink-400 focus:outline-none transition-colors peer"
                        />
                        <label 
                          htmlFor="message"
                          className={`absolute left-4 transition-all duration-200 ${
                            focused.message 
                              ? '-top-5 text-pink-300 text-sm' 
                              : 'top-3 text-gray-400'
                          }`}
                        >
                          Your Message
                        </label>
                      </div>
                      
                      {/* Error Message */}
                      {formStatus.error && (
                        <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 text-red-300">
                          {formStatus.error}
                        </div>
                      )}
                      
                      {/* Submit Button */}
                      <div>
                        <Button 
                          type="submit"
                          variant="primary" 
                          size="lg" 
                          icon={formStatus.submitting ? null : <Send />}
                          iconPosition="right"
                          disabled={formStatus.submitting}
                          className="w-full"
                        >
                          {formStatus.submitting ? 'Preparing...' : 'Connect via WhatsApp'}
                        </Button>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Clicking will open WhatsApp with your message ready to send
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-5/12"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-full flex flex-col">
                {/* Location Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 mb-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg p-2 mr-4">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Virtual Location</h3>
                      <p className="text-gray-300">
                        UNIFITZ is an online platform. Join our fitness community from anywhere in India!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Map/Image Container */}
                <div className="relative flex-grow rounded-3xl overflow-hidden border-2 border-white/20 p-1">
                  {/* Replace with an actual map if you have a physical location */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900"></div>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-full p-6 mb-6">
                      <img 
                        src="/logo-light.png" 
                        alt="UNIFITZ Logo" 
                        className="w-20 h-20"
                      />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Experience Fitness <span className="text-pink-400">Anywhere</span>
                    </h3>
                    
                    <p className="text-gray-300 mb-6">
                      Join our live classes from the comfort of your home. No commute, no hassle – just 21 minutes of focused fitness for the whole family.
                    </p>
                    
                    <div className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <Instagram className="h-5 w-5 text-pink-400 mr-2" />
                      <span className="text-white font-medium">@unifitz.in</span>
                    </div>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-1/4 left-0 w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-3xl opacity-20"></div>
                  <div className="absolute bottom-1/4 right-0 w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl opacity-20"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-indigo-900 -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">Questions</span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Can't find the answer you're looking for? Reach out to our team.
            </motion.p>
          </div>
          
          {/* FAQ Accordion - You can implement actual accordion functionality if needed */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
            <FaqItem 
              question="How do I join a live class?" 
              answer="After subscribing to UNIFITZ, you'll receive access to our member portal where you can see the schedule of upcoming live classes. Simply click the 'Join Class' button at the scheduled time to enter our Zoom session. You'll receive email reminders 15 minutes before each class begins."
            />
            
            <FaqItem 
              question="What equipment do I need for the classes?" 
              answer="Most of our classes require minimal or no equipment. For dance fitness and yoga, you'll just need comfortable clothing and a small clear space. Weight training classes may suggest light dumbbells, but we always provide bodyweight alternatives. We focus on making fitness accessible with whatever you have at home."
            />
            
            <FaqItem 
              question="Can my whole family join with one subscription?" 
              answer="Absolutely! One of the core benefits of UNIFITZ is that a single subscription covers your entire household. We encourage families to workout together – it's a great way to stay motivated and make fitness a fun family activity."
            />
            
            <FaqItem 
              question="How long are the workout sessions?" 
              answer="All our sessions are designed to be exactly 21 minutes long. We've found this to be the sweet spot – long enough to deliver real results, but short enough to fit into even the busiest schedules. This focused approach helps maintain consistency, which is key to seeing results."
            />
            
            <FaqItem 
              question="Can I access recorded classes if I miss a live session?" 
              answer="Yes! All our live sessions are recorded and added to our on-demand library within 24 hours. This way, you never have to miss a workout, even if you can't make the live class. Our on-demand library also includes exclusive pre-recorded content for even more workout options."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-700 opacity-90 -z-10"></div>
        
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-20 -z-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to <span className="text-yellow-300">Transform</span> Your Fitness Journey?
              </h2>
              
              <p className="text-xl text-white mb-10 max-w-3xl mx-auto">
                Start your 21-minute daily workout routine and join thousands of families already experiencing the UNIFITZ difference.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  to="/plans" 
                  variant="white" 
                  size="lg"
                >
                  View Our Plans
                </Button>
                
                <Button 
                  to="/enroll" 
                  variant="primary" 
                  size="lg" 
                  icon={<ArrowRight />} 
                  iconPosition="right"
                >
                  Start Your Journey Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

// FAQ Item Component
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <button 
        className="w-full px-6 py-5 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-medium text-white">{question}</h3>
        <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ArrowRight className={`h-4 w-4 text-pink-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-gray-300">
          {answer}
        </div>
      </div>
    </motion.div>
  );
};

export default ContactUs;


FaqItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired
};

