import SectionHeading from '../common/SectionHeading';
import TestimonialCard from '../zumba/TestimonialCard';

/**
 * Testimonials section showcasing customer feedback about yoga classes
 */
const Testimonials = () => {
  // Testimonials data
  const testimonials = [
    {
      quote: "UNIFITZ yoga has transformed my life! As a busy mom, I never thought I'd find time for self-care, but their flexible schedule and guided sessions have made it possible. I'm stronger, calmer, and more present for my family.",
      name: "Ananya Mehta",
      title: "Member for 8 months",
      avatar: "/yoga-avatar-1.jpg",
      rating: 5,
      variant: "blue"
    },
    {
      quote: "After trying several online yoga platforms, UNIFITZ stands apart with their personalized approach. The instructors remember your name and needs, making each session feel like a private class. My posture and flexibility have improved tremendously.",
      name: "Rohan Kapoor",
      title: "Member for 5 months",
      avatar: "/yoga-avatar-2.jpg",
      rating: 5,
      variant: "indigo"
    },
    {
      quote: "The family yoga sessions have been a wonderful way to bond with my children. It's amazing to see my 8-year-old learning mindfulness and breathing techniques that help her manage frustration. Priceless life skills from excellent instructors!",
      name: "Shalini Desai",
      title: "Member for 3 months",
      avatar: "/yoga-avatar-3.jpg",
      rating: 5,
      variant: "teal"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated decorative circles */}
      <div className="absolute top-40 left-20 w-12 h-12 bg-blue-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-60 right-40 w-16 h-16 bg-indigo-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-purple-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-teal-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          badge="Success Stories"
          badgeVariant="blue"
          title="What Our Yoga Community Says"
          highlight="Yoga Community"
          subtitle="Hear from practitioners who have transformed their lives through our online yoga classes"
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
        
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
            <span className="text-blue-300">4.9</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white">Average rating from 500+ members</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;