'use client';

import React from 'react';

export default function WhatsAppButton() {
  const phoneNumber = '919828207999';
  const defaultText = encodeURIComponent(
    "Hello Hariyana Watch & Opticals, I visited your website and would like to inquire about your products."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20ba5a] transition-all duration-300 transform hover:scale-110 active:scale-95 group"
      aria-label="Contact Hariyana Watch & Opticals on WhatsApp"
    >
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-8 h-8 text-white fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.407 1.461 5.432.003 9.85-4.416 9.854-9.853.002-2.634-1.02-5.11-2.88-6.972C17.155 1.928 14.673.906 12.01.906 6.574.906 2.153 5.325 2.15 10.763c-.001 1.928.504 3.812 1.468 5.418L2.63 20.72l4.63-1.214c-.001.001 0 0 0 0zM17.175 14.39c-.28-.14-1.65-.815-1.907-.908-.256-.094-.443-.14-.63.14-.187.28-.724.908-.887 1.093-.164.187-.327.21-.607.07-.28-.14-1.18-.435-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.164-.28-.018-.43.122-.57.126-.127.28-.328.42-.49.14-.164.187-.28.28-.467.094-.187.047-.35-.023-.49-.07-.14-.63-1.517-.863-2.08-.228-.546-.46-.472-.63-.48-.164-.009-.35-.01-.537-.01-.187 0-.49.07-.747.35-.257.28-.98.958-.98 2.337 0 1.378 1.004 2.71 1.144 2.897.14.187 1.977 3.018 4.79 4.23.67.288 1.19.46 1.597.59.673.214 1.287.184 1.77.11.54-.08 1.65-.674 1.883-1.326.234-.654.234-1.214.164-1.326-.07-.11-.257-.187-.538-.327z" />
      </svg>
      {/* Tooltip */}
      <span className="absolute right-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-[#112240] text-[#f3f4f6] text-xs font-semibold py-2 px-3 rounded shadow-md border border-[#C9A84C]/30 whitespace-nowrap">
        Chat with us!
      </span>
    </a>
  );
}
