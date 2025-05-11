import SectionHeading from '../common/SectionHeading';
import TestimonialCard from '../zumba/TestimonialCard';

/**
 * Testimonials section showcasing customer feedback about weight training classes
 */
const Testimonials = () => {
  // Testimonials data
  const testimonials = [
    {
      quote: "I was intimidated by weights before, but UNIFITZ made it approachable and effective. Their guidance on proper form changed everything, and I've gained strength I never thought possible while working out from home!",
      name: "Arjun Malhotra",
      title: "Member for 7 months",
      avatar: "/weight-avatar-1.jpg",
      rating: 5,
      variant: "emerald"
    },
    {
      quote: "As a busy professional, I couldn't fit gym time into my schedule. UNIFITZ's structured programs let me train efficiently at home with minimal equipment. I've seen better results in 3 months than I did with a year at my old gym.",
      name: "Divya Sharma",
      title: "Member for 4 months",
      avatar: "/weight-avatar-2.jpg",
      rating: 5,
      variant: "slate"
    },
    {
      quote: "The family plan has been incredible for us. My teenage sons and I train together, and my wife does her own program. The trainers are excellent at providing modifications for all of us. It's brought us closer while getting healthier.",
      name: "Rajiv Patel",
      title: "Member for 6 months",
      avatar: "/weight-avatar-3.jpg",
      rating: 5,
      variant: "teal"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-emerald-900 to-slate-900 relative overflow-hidden">
      {/* Animated decorative circles */}
      <div className="absolute top-40 left-20 w-12 h-12 bg-emerald-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-60 right-40 w-16 h-16 bg-teal-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-slate-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-gray-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          badge="Success Stories"
          badgeVariant="teal"
          title="What Our Members Are Saying"
          highlight="Members"
          subtitle="Hear from people who have transformed their bodies and built real strength with our weight training programs"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              quote={testimonial.quote}
              name={testimonial.name}
              title={testimonial.title}
              avatar={testimonial.avatar}
              rating={testimonial.rating}
              variant={testimonial.variant}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            />
          ))}
        </div>
        
        <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-8 bg-white/10 backdrop-blur-sm p-6 rounded-3xl">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-2xl font-bold text-white mb-2">75%</p>
            <p className="text-emerald-300 text-sm">Average strength increase</p>
          </div>
          
          <div className="w-px h-12 bg-white/20 hidden md:block"></div>
          
          <div className="flex flex-col items-center md:items-start">
            <p className="text-2xl font-bold text-white mb-2">90%</p>
            <p className="text-emerald-300 text-sm">Report improved energy</p>
          </div>
          
          <div className="w-px h-12 bg-white/20 hidden md:block"></div>
          
          <div className="flex flex-col items-center md:items-start">
            <p className="text-2xl font-bold text-white mb-2">88%</p>
            <p className="text-emerald-300 text-sm">Reduced back pain</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;