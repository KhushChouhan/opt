'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    // Enable native smooth scrolling on the html element
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
    
    return () => {
      html.style.scrollBehavior = '';
    };
  }, []);

  return null;
}
