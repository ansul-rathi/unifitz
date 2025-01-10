import Slider from "react-slick";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      feedback:
        "Zumba classes are so fun and energetic! I've never felt this confident and fit. Highly recommend to anyone looking to enjoy their workouts.",
      rating: 5,
      image: "path-to-sarah-image.jpg", // Replace with actual image path
    },
    {
      name: "Michael Brown",
      feedback:
        "The yoga sessions have helped me achieve a level of calm I didn’t think was possible. It's been transformative for both my body and mind.",
      rating: 4,
      image: "path-to-michael-image.jpg", // Replace with actual image path
    },
    {
      name: "Emily Davis",
      feedback:
        "Weight training here has been amazing! The personalized approach helped me achieve my strength goals much faster than I expected.",
      rating: 5,
      image: "path-to-emily-image.jpg", // Replace with actual image path
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section className="bg-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          What Our Clients Say
        </h2>
        <Slider {...settings}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-100 shadow-lg rounded-lg p-6 text-center"
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {testimonial.name}
              </h3>
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < testimonial.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-600 text-sm">{testimonial.feedback}</p>
            </div>
          ))}
        </Slider>
        <div className="text-center mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700">
            See More Testimonials
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
