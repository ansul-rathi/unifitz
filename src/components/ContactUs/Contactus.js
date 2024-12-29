import React, { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      setError("All fields are required.");
      return;
    }

    // Simulate form submission
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setError("");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 h-[500px] md:h-[600px] flex items-center justify-center">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-12 w-full">
          {/* Left Side - Image or Info */}
          <div className="flex-1 h-full">
            <img
              src="/contactUs/contactUs.png"
              alt="Contact Us"
              className="rounded-lg shadow-lg h-full object-cover w-full"
            />
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 max-w-lg w-full h-full">
            {submitted && (
              <p className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                Thank you for your message! We'll get back to you soon.
              </p>
            )}
            {error && (
              <p className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
                {error}
              </p>
            )}
            <form
              onSubmit={handleSubmit}
              className="bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col justify-between"
            >
              <div>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message:
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-orange-500"
                    placeholder="Write your message"
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
