import { useState, useEffect } from "react";
import { Mail, User, MessageSquare, Calendar, Users } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    age: "",
    gender: "",
    message: "" 
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Initialize EmailJS with your public key
    emailjs.init("WmCbf530e0JD66Zz_");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (formData.age < 16 || formData.age > 100) {
      newErrors.age = "Age must be between 16 and 100";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSending(true);
      try {
        await emailjs.send(
          'service_b87y22v', // Replace with your EmailJS service ID
          'template_6phfvv7', // Replace with your EmailJS template ID
          {
            to_email: 'theunifitz@gmail.com',
            from_name: formData.name,
            from_email: formData.email,
            age: formData.age,
            gender: formData.gender,
            message: formData.message
          }
        );
        
        setSubmitted(true);
        setFormData({ name: "", email: "", age: "", gender: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } catch (error) {
        console.error('Error sending email:', error);
        setErrors({ submit: 'Failed to send message. Please try again.' });
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <section id="contact" className="bg-black text-white py-16">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-12 w-full">
          {/* Left Side - Image */}
          <div className="flex-1 h-full hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg opacity-20 blur-2xl" />
            <img
              src="/contactUs/contactUs.png"
              alt="Contact Us"
              className="rounded-lg shadow-lg h-full object-cover w-full border border-yellow-500/30"
            />
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 max-w-lg w-full">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Get in Touch
            </h2>
            
            {submitted && (
              <div className="bg-green-900/50 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
                Thank you for your message! We will be in touch soon.
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="h-5 w-5 text-yellow-500" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg border ${
                      errors.name ? 'border-red-500' : 'border-yellow-500/30'
                    } focus:border-yellow-500 focus:outline-none transition-colors`}
                    placeholder="Your Name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="h-5 w-5 text-yellow-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-yellow-500/30'
                    } focus:border-yellow-500 focus:outline-none transition-colors`}
                    placeholder="Your Email"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Calendar className="h-5 w-5 text-yellow-500" />
                    </div>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg border ${
                        errors.age ? 'border-red-500' : 'border-yellow-500/30'
                      } focus:border-yellow-500 focus:outline-none transition-colors`}
                      placeholder="Age"
                    />
                  </div>
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Users className="h-5 w-5 text-yellow-500" />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg border ${
                        errors.gender ? 'border-red-500' : 'border-yellow-500/30'
                      } focus:border-yellow-500 focus:outline-none transition-colors`}
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute left-3 top-3">
                    <MessageSquare className="h-5 w-5 text-yellow-500" />
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg border ${
                      errors.message ? 'border-red-500' : 'border-yellow-500/30'
                    } focus:border-yellow-500 focus:outline-none transition-colors`}
                    placeholder="Your Message"
                  ></textarea>
                </div>
                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={sending}
                className={`w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-400 hover:to-yellow-500 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 ${
                  sending ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;