import { useState, useEffect } from 'react';
import { Check, Shield, Zap, Gift, CreditCard } from 'lucide-react';


const Pricing = () => {
  const [currency, setCurrency] = useState<'INR' | 'AED'>('INR');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCountryChange = (country) => {
    setFormData({ ...formData, country });
    setCurrency(country === 'UAE' ? 'AED' : 'INR');
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);

    const amount = currency === 'INR' ? 21 : 1;
    const amountInPaise = currency === 'INR' ? amount * 100 : amount * 100;

    const options = {
      key: 'rzp_test_1234567890',
      amount: amountInPaise,
      currency: currency,
      name: '21 Days Fitness Challenge',
      description: 'Habit Building Session',
      image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=200',
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#f97316'
      },
      handler: function (response) {
        alert('Payment successful! Welcome to the 21 Days Fitness Challenge. Check your email for joining instructions.');
        console.log('Payment ID:', response.razorpay_payment_id);
        setIsProcessing(false);
        setFormData({ name: '', email: '', phone: '', country: 'India' });
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    if (window.Razorpay) {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } else {
      alert('Payment gateway not loaded. Please refresh and try again.');
      setIsProcessing(false);
    }
  };

  const features = [
    '21 Days of Expert-Led Sessions',
    'Yoga, Zumba & NLP Training',
    'Access to 4 International Trainers',
    'Daily Live Interactive Classes',
    'Personalized Workout Plans',
    'Nutrition & Diet Guidelines',
    'Progress Tracking Dashboard',
    'Private Community Access',
    'Lifetime Recording Access',
    'Certificate of Completion',
    '24/7 WhatsApp Support',
    '100% Money-Back Guarantee'
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold mb-4 animate-pulse">
            <Gift className="w-5 h-5" />
            Special Launch Offer - 95% OFF
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Transform Your Life for Just {currency === 'INR' ? '₹21' : '1 AED'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Limited time offer: Get access to world-class trainers at an unbeatable price
          </p>
          <div className="mt-4 text-gray-500">
            <span className="line-through text-2xl">₹999</span>
            <span className="text-4xl font-bold text-orange-600 ml-4">
              {currency === 'INR' ? '₹21' : '1 AED'}
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-500">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 text-center">
              <h3 className="text-3xl font-bold mb-2">21 Days Fitness Challenge</h3>
              <p className="text-lg opacity-90">Complete Transformation Package</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 flex-shrink-0 mt-1">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
                  <Shield className="w-16 h-16 text-blue-600" />
                  <div>
                    <h4 className="font-bold text-xl text-gray-900 mb-2">
                      100% Money-Back Guarantee
                    </h4>
                    <p className="text-gray-600">
                      Not satisfied? Get a full refund within 7 days. No questions asked. Your success is our priority.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                    placeholder="+91 1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                  >
                    <option value="India">India (₹21)</option>
                    <option value="UAE">UAE (1 AED)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-xl py-5 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Join Now - Pay {currency === 'INR' ? '₹21' : '1 AED'}
                      <Zap className="w-6 h-6" />
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Secure payment powered by Razorpay
                </div>
              </form>

              <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Instant Access After Payment
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Get immediate access to the community, workout plans, and all resources. Your transformation journey starts the moment you join!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-600">
            <p className="mb-2">Trusted by 5000+ members • Rated 4.9/5</p>
            <div className="flex justify-center gap-4 text-sm">
              <span>✓ SSL Secured</span>
              <span>✓ 100% Safe</span>
              <span>✓ Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
