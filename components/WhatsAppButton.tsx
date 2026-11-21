
const WHATSAPP_NUMBER = '447827804920'; // +44 7827 804920
const PEARLS = 30;

export const WhatsAppButton = () => {
  const message = encodeURIComponent("Hi! I'm interested in Mari's Handmade candles.");
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-7 right-7 z-50 group"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />

      {/* Ring of pearls around the button, matching the site's pearl frames */}
      <svg
        viewBox="0 0 76 76"
        className="absolute -inset-[10px] w-[76px] h-[76px] pointer-events-none drop-shadow-[0_3px_6px_rgba(62,86,97,0.25)] transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wa-ivory" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F7F1EA" />
            <stop offset="100%" stopColor="#E6DACB" />
          </linearGradient>
        </defs>
        <circle cx="38" cy="38" r="33" fill="none" stroke="url(#wa-ivory)" strokeWidth="8" />
        <g fill="none" strokeLinecap="round" strokeDasharray={`0 ${(2 * Math.PI * 33) / PEARLS}`}>
          <circle cx="38" cy="38" r="33" stroke="rgba(140,105,75,0.45)" strokeWidth="5.4" transform="translate(0.4 0.7)" />
          <circle cx="38" cy="38" r="33" stroke="#EADBC8" strokeWidth="4.6" />
          <circle cx="38" cy="38" r="33" stroke="#FFFFFF" strokeWidth="1.9" transform="translate(-0.8 -0.9)" />
        </g>
      </svg>

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110">
        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 24 24"
          fill="white"
          className="w-7 h-7"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>

      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-800 text-sm font-medium px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Chat with us!
      </span>
    </a>
  );
};
