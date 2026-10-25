import { useState } from 'react';
import { Salad } from 'lucide-react';

// Hosts we know are unreliable placeholders (loremflickr 500s on every image —
// audit U-41). Treated as "no image" so cards don't wait on a failing request.
const BAD_HOSTS = /^https?:\/\/(www\.)?loremflickr\.com\//i;

// Recipe photo with a graceful fallback: missing, placeholder-host or failed
// images all render the salad icon in the same tinted slot.
export default function RecipeImage({ src, alt = '', iconClass = 'w-8 h-8 text-emerald-700', lazy = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed || BAD_HOSTS.test(src)) return <Salad className={iconClass} aria-hidden="true" />;
  return (
    <img src={src} alt={alt} loading={lazy ? 'lazy' : undefined} decoding="async"
      onError={() => setFailed(true)} className="w-full h-full object-cover" />
  );
}
