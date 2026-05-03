import { FC } from 'react';

const coaches = [
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVxCFY4p10LdqGBM_izHZsREKeNwz-zkOYjOsRozUDqgyGeWlo349kePVmfRPq8678TO3sYEHwvW4EJKuPb-JEB0Vm-x1qUzAkESh0Nb1ijJszqavEe14oJOY8U5UzH0PCbMa9rRd6CNWaS2QHuUoRzVuB5vN0b26-JbSxY6p2fw-VVvDBtatZrqBEvSAL3UHBQ2UxvDisjxHfb5-6mVDkInX-I111ecVH-ShrGpowxGNk3GnQyY-wJiyJ0WnruQ2jHD0faJAnhwBF',
    name: 'Ansul Rathi',
    role: 'Founder & Head Coach',
    roleColor: 'text-primary',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpj8BwO_QzMC7RgehZiKT-ftzS5UjVD_aid7ZHMr8hKucM9ukCnL_XfMUbcP1-EkZ2ZLgidPX9LIAyBb_cuqfZylW7O8z8JmV0eUW_p3DrIBiVYe7VVFkbTFOj4zCb-krpxchsZ9yrwxZb8GYI_GoSKZjGENoK9O7_C7jepsaseQzPviTauaWcWLyo-qQ3LxxFnwsk8qxBxEkNdeibJRfBGzSLo4qkeniNNCRtqvf7utXIBFllsveLfYbpTq1StMdhPK1vz1RisbuK',
    name: 'Mehak',
    role: 'Yoga Specialist',
    roleColor: 'text-tertiary-container',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1i3zG9Z2OqACfUBZj3lDfMPauxKr6tc1xDnK9NQyPZhdRq1fv6Jfj1ofPfY0bJ8nbGI6O4LE3OIgC33JrOU-Y_0X02bjccWWCkE0E4G7YX4Ykxd4O-atTmVbYOj0b5A59xm6esnosna9EOWZCHPe-_ucE4uwtLXLR-duIYf0Xvhsq5tvbHf29fsPGi8guzmiYpU6gAnrwJYG8pTn-gVQAXgUmRVOxn8jaTy7H1-7lM0okAopz-wiiTVuQ1xOfjIlVvCozbZyj6BVB',
    name: 'Asha',
    role: 'Meditation Coach',
    roleColor: 'text-tertiary-container',
  },
  {
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_y5QoK8wPvAT0Zbq_bls99Ajl5LIDMxPrLdeS6FHrtqhjUwhBwZG0luRuNG1NtTfGNvZX6WhMen8bi3lq58pS4nY9TROSo45XBFFMnfsrEOW-Z9w8ZmVJYRB_GZuRBnmFZxvD6FHoCxnD_nZFKqmyaeiqKowjhqc3yXAMgRj-SKUMKmHJNIzjgBX-I1vbIV3U5D0d3fpYJU7iNkTA92ck3m-z57V02QcMkQIl_xwJGEptCMxgku652FK68-VRnIZE0iMxnPu0kIv',
    name: 'Neha',
    role: 'Reiki Practitioner',
    roleColor: 'text-primary',
  },
];

const CoachesSection: FC = () => (
  <section id="coaches" className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-surface">
    <div className="max-w-7xl mx-auto mb-8 sm:mb-16">
      <h2 className="font-lexend text-2xl sm:text-3xl lg:text-h1 font-bold mb-2 text-on-surface">Meet Your Mentors</h2>
      <p className="font-jakarta text-sm sm:text-base text-on-surface-variant">Expert guidance for every aspect of your wellbeing.</p>
    </div>
    <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
      {coaches.map((coach) => (
        <div key={coach.name} className="group">
          <div className="rounded-xl sm:rounded-[2rem] overflow-hidden mb-3 sm:mb-6">
            <img
              className="w-full aspect-square sm:aspect-[3/4] object-cover group-hover:scale-110 transition-transform duration-500"
              src={coach.img}
              alt={`${coach.name} - ${coach.role} at Unifitz`}
              loading="lazy"
              decoding="async"
            />
          </div>
          <h4 className="font-lexend text-sm sm:text-xl font-semibold mb-0.5 sm:mb-1 text-on-surface">{coach.name}</h4>
          <p className={`${coach.roleColor} font-lexend text-[9px] sm:text-xs font-bold tracking-widest uppercase`}>{coach.role}</p>
        </div>
      ))}
    </div>
  </section>
);

export default CoachesSection;
