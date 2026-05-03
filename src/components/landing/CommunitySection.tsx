import { FC } from 'react';

const avatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFihwy6vW7wY8wVKZ50gf03e6Q-wc5YxewYzdFN53kSDwXNIkW7cUtQs3TJG4R-4YuUw4wA56mWjy5-jfa69yh5t9dgimpmOuZvpVbxAYe8NzkSA7zPnEl2Ux3A8-6UfghIH00NPGbnNoNi7roizQq9M3jbTLYdD8IxQrTonhMWirHPzcmnYgCdjWmsBtdOHQ5twQE9uuZBz8Y43ZBJ25QMdnNaz2lc4QnMCVgIFlhmYST8qgIrsVMdNnNhMPn8f2tKIp_jFHoxoNF',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAvycqYPJIGgrS7EjAbkiO25o2fv1H72XnQ1D4IDU69ICT-pd7cR14Ip1RoOgVI4fQn40NaqxrT_iAasNMF-zXNDebq62Xyac71P7ejH___pkEsCglUCEEn5IbdR_mEG6OiVeg-WOFyD1ZwCzkc2LwCMDjCplRlR8lln4aJzF1pcfIBRchB9Wgw1_gd1BSUQi7w9NQAqUolM_5HFCbxX_V1cjRO0pXl1XgOdGOnQhjiZBbAcZslZWit6aOoU2aDI7s4BdfwP1VjG2NJ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCAZojMU9kep2V20I1cfjaOHX13fFXf6cbqVqj-a7M7nYPfv-DFoq3ZFI6TM14PrNwmMYPTuaKFK0vOVxZtiszQBPrSyyjBLuN9uoUOWWeoItySIC4bXSZezJ8rmZSiHtSmi6BjmliLq1kqLjTbO-x1YFrKQqr9B75NDSAMFaq3BXZIRa4FvO9FRGpmLc1XLp5Q-vtPkL7oyHoTajQ1SN5OnxAXZH688dJO96__uTEhtlW73L3qjeGcBY0PuiOncT8bQNROUCWngRRk',
];

const CommunitySection: FC = () => (
  <section id="community" className="py-12 sm:py-xl px-4 sm:px-6 lg:px-xl bg-gradient-to-b from-surface to-[#1A0F2E]">
    <div className="max-w-7xl mx-auto rounded-2xl sm:rounded-[3rem] overflow-hidden relative min-h-[360px] sm:min-h-[500px] flex items-end sm:items-center p-6 sm:p-12 lg:p-20">
      {/* bg image */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-30"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8kKDDTYM4IpT25SqjSLErSpwL5cerP157xJMZA5KVIyc1gs27eqAyFP33ffsroIJAISnkR5DI3JF3jZsShUL4ZXSyDLv-ve2QJb8Lv8wF3iBEiZBLhWEFy7vjN7Y5SJVqzq3U2Vk5sy4BIFd8eb37tZdbb5YyyOpWFt6jY4NXCNs7PhIuSgfuUv66X8v3Gi3HhUVSC5PR7vuwKS2FTqz_IJNWlzhT780SqskEBeylGeVTnBX0lonPYeU4q7XKGbJyw3x_sw75z-2t"
          alt="Women celebrating fitness together"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#1A0F2E] via-[#1A0F2E]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-xl">
        <h2 className="font-lexend text-2xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-6 leading-tight text-white">
          You&apos;re not joining a class.<br />
          <span className="text-primary-container">You&apos;re joining a family.</span>
        </h2>
        <p className="font-jakarta text-sm sm:text-lg text-on-surface-variant mb-5 sm:mb-10">
          Connect with thousands of women on the same journey. Share recipes, celebrate wins, find your tribe.
        </p>

        {/* avatars */}
        <div className="flex -space-x-3 mb-4 sm:mb-8">
          {avatars.map((src, i) => (
            <img key={i} alt="Unifitz community member" className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-[#1A0F2E] object-cover" src={src} loading="lazy" decoding="async" />
          ))}
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary-container flex items-center justify-center text-[9px] sm:text-[10px] font-bold border-2 border-[#1A0F2E] text-white font-lexend">
            5k+
          </div>
        </div>

        <button className="bg-primary-container text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-lexend text-xs sm:text-sm font-bold tracking-widest uppercase glow-pink hover:brightness-110 transition-all">
          Join the Community
        </button>
      </div>
    </div>
  </section>
);

export default CommunitySection;
