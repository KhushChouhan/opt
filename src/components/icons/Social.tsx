import React from 'react';

type IconProps = { className?: string };

export function Instagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Facebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Twitter({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.24 2H21.5l-7.13 8.15L22.75 22h-6.56l-5.14-6.72L5.18 22H1.92l7.62-8.71L1.25 2h6.72l4.65 6.15L18.24 2zm-1.15 18h1.81L7.0 3.9H5.06L17.09 20z" />
    </svg>
  );
}

export function WhatsApp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.459 5.407 1.461 5.432.003 9.85-4.416 9.854-9.853.002-2.634-1.02-5.11-2.88-6.972C17.155 1.928 14.673.906 12.01.906 6.574.906 2.153 5.325 2.15 10.763c-.001 1.928.504 3.812 1.468 5.418L2.63 20.72l4.63-1.214c-.001.001 0 0 0 0zM17.175 14.39c-.28-.14-1.65-.815-1.907-.908-.256-.094-.443-.14-.63.14-.187.28-.724.908-.887 1.093-.164.187-.327.21-.607.07-.28-.14-1.18-.435-2.25-1.39-.83-.74-1.39-1.65-1.55-1.93-.164-.28-.018-.43.122-.57.126-.127.28-.328.42-.49.14-.164.187-.28.28-.467.094-.187.047-.35-.023-.49-.07-.14-.63-1.517-.863-2.08-.228-.546-.46-.472-.63-.48-.164-.009-.35-.01-.537-.01-.187 0-.49.07-.747.35-.257.28-.98.958-.98 2.337 0 1.378 1.004 2.71 1.144 2.897.14.187 1.977 3.018 4.79 4.23.67.288 1.19.46 1.597.59.673.214 1.287.184 1.77.11.54-.08 1.65-.674 1.883-1.326.234-.654.234-1.214.164-1.326-.07-.11-.257-.187-.538-.327z" />
    </svg>
  );
}

export function Youtube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}
