import SectionHeading from '../common/SectionHeading';
import TestimonialCard from './TestimonialCard';

/**
 * Testimonials section showcasing customer feedback
 */
const Testimonials = () => {
  // Testimonials data
  const testimonials = [
    {
      quote: "I've tried many fitness programs, but UNIFITZ Zumba classes are on another level! The instructors are energetic, the music is fantastic, and I've lost 5kg in just 2 months while having fun!",
      name: "Priya Sharma",
      title: "Member for 3 months",
      avatar: "/avatar-1.jpg",
      rating: 5,
      variant: "pink"
    },
    {
      quote: "The family plan is perfect for us! My husband and I join with our teenage kids, and it's become our favorite family activity. The instructors make it fun for all ages and fitness levels.",
      name: "Neha Patel",
      title: "Member for 6 months",
      avatar: "/avatar-2.jpg",
      rating: 5,
      variant: "purple"
    },
    {
      quote: "As a working professional, I love that I can join Zumba classes from home without wasting time on commuting. The instructors are amazing and keep me motivated even on screen!",
      name: "Rajesh Kumar",
      title: "Member for 2 months",
      avatar: "/avatar-3.jpg",
      rating: 5,
      variant: "orange"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-purple-900 to-fuchsia-800 relative overflow-hidden">
      {/* Animated decorative circles */}
      <div className="absolute top-40 left-20 w-12 h-12 bg-pink-500 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-60 right-40 w-16 h-16 bg-yellow-400 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-purple-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-orange-500 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          badge="Our Dancers Love Us"
          badgeVariant="orange"
          title="What Our Zumba Family Says"
          highlight="Zumba Family"
          subtitle="Join hundreds of satisfied members who have transformed their fitness journey with our Zumba classes"
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
      </div>
    </section>
  );
};

export default Testimonials;