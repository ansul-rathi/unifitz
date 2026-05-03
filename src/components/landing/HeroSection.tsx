import { FC } from 'react';
import WhatsAppIcon from './WhatsAppIcon';

const HeroSection: FC = () => (
  <section
    id="workouts"
    className="relative min-h-[921px] flex items-center overflow-hidden bg-[#1A0F2E] px-6 lg:px-xl"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent pointer-events-none" />
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full py-20 lg:py-0">
      <div>
        <span className="inline-block px-4 py-1 rounded-full bg-primary-container/10 text-primary-fixed border border-primary-container/20 font-lexend text-[10px] font-bold tracking-widest uppercase mb-6">
          Energizing Zumba Sessions
        </span>
        <h1 className="font-lexend text-h1 mb-6 text-white leading-tight">
          Dance Your Way to <span className="text-primary-container">Fitness</span>
        </h1>
        <p className="font-jakarta text-body-lg text-on-surface-variant mb-10 max-w-lg">
          Fun. Energy. Fat Loss. All from the comfort of your home. Transform your routine into a daily dance party designed for women aged 30–50.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-primary-container text-white px-8 py-4 rounded-full font-lexend text-sm font-bold tracking-widest uppercase glow-pink hover:brightness-110 transition-all flex items-center justify-center gap-2">
            Join Free Trial
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
          <a
            href="https://wa.me/yournumber?text=Hi,%20I%20want%20to%20join%20Unifitz%20free%20trial"
            target="_blank"
            rel="noreferrer"
            className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-lexend text-sm font-bold tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            WhatsApp Us
            <WhatsAppIcon size={18} />
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 bg-primary-container/20 blur-[100px] rounded-full" />
        <img
          className="rounded-3xl relative z-10 w-full object-cover aspect-[4/5] shadow-2xl"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLMMzQ8Ye0Iz_EGZql8bijblji-zpJs7rLAYgqJpk84osQPcnzVo3Wvo9vPezuk933JEHKO_z4I2ep5dO0g9wZodNDb3ZtOyMjkpSYXJaLPB51fmrItFYA84g4T5fxKZU_h5uR0KGXI9D3rwwhHPLgnwWz0Qy5BsQAMGLmOOv3JSoVtdGn0ettX-QIjFLhWVdB6PCabSw6iichI1ORJ24eRqyKV8IgX_Aa-o3G8DxtuHjjeiEt6h6AxGAsczICSy1fOkJEBvaHdPwz"
          alt="Joyful woman dancing Zumba in vibrant fitness wear"
        />
      </div>
    </div>
  </section>
);

export default HeroSection;
