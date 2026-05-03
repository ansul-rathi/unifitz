import { FC } from 'react';

const StrengthSection: FC = () => (
  <section className="bg-[#0B0F1A] py-xl px-6 lg:px-xl relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary-container/10 blur-[150px] rounded-full" />
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="order-2 lg:order-1">
        <img
          className="rounded-3xl w-full aspect-video lg:aspect-square object-cover shadow-[0_0_50px_rgba(0,212,255,0.2)]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwK4QczIHnq9kQ7Tps9H9WeY0IIeN0Bz1LIp8DoXZ3NtqTfsc8pQS6x4eDTUrcXssSZryBI636cqGeeM3hpezpYbbX4Q6g6DcxOcluPxjdfiJEWMEFXuPvj3aj1_1fZRdxqMZFvcpRJWn-P4E4JiB8w4Zmyy2rMRINrgfGubU8nBjn3LH9OJ9z4DC6j6BOwgJHOSi-rBKAwefqSDdjfHVR7a7Tr2n1FpBhEkUytnpV-YUQ2LFzyTrDFy6YzukCdyaAymMyooDhqbbz"
          alt="Fit woman performing strength training with kettlebells"
        />
      </div>
      <div className="order-1 lg:order-2">
        <h2 className="font-lexend text-h1 mb-6 text-white">
          Build Strength. <span className="text-secondary-container">Transform Your Body.</span>
        </h2>
        <p className="font-jakarta text-body-lg text-white/70 mb-8">
          Functional strength training tailored for the metabolic needs of women. Tone your muscles and boost your metabolism with expert-led sessions.
        </p>
        <ul className="space-y-4 mb-10">
          {[
            'No heavy equipment needed at home',
            'Metabolic conditioning for effective fat loss',
            'Joint-friendly exercises for long-term health',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-white/90 font-jakarta">
              <span className="material-symbols-outlined text-secondary-container">check_circle</span>
              {item}
            </li>
          ))}
        </ul>
        <button className="bg-secondary-container text-[#001f27] px-10 py-4 rounded-full font-lexend text-sm font-bold tracking-widest uppercase glow-blue hover:brightness-110 transition-all">
          Explore Program
        </button>
      </div>
    </div>
  </section>
);

export default StrengthSection;
