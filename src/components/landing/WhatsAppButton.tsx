import { FC } from 'react';
import WhatsAppIcon from './WhatsAppIcon';

const WhatsAppButton: FC = () => (
  <a
    href="https://wa.me/yournumber?text=Hi,%20I%20want%20to%20join%20Unifitz%20free%20trial"
    target="_blank"
    rel="noreferrer"
    className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.7)] active:scale-95 transition-all group"
    aria-label="Chat on WhatsApp"
  >
    <WhatsAppIcon size={30} className="text-white" />
    <div className="absolute right-full mr-4 bg-white text-black py-2 px-4 rounded-xl text-sm font-jakarta font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
      Chat with us on WhatsApp
    </div>
  </a>
);

export default WhatsAppButton;
