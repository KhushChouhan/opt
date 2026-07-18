'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailSubject = `New Inquiry: ${subject}`;
    const emailBody = `Hello Hariyana Watch & Opticals team,

You have received a new contact inquiry from the website.

👤 CUSTOMER DETAILS:
------------------------------------------
Name: ${name}
Phone: ${phone}
Email: ${email}

✉️ MESSAGE:
------------------------------------------
${message}

------------------------------------------
Regards,
${name}
(Inquiry submitted via website Contact portal)`;

    const mailtoUrl = `mailto:hariyanaoptical49@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <form className="flex-1 flex flex-col justify-between gap-5 mt-4" onSubmit={handleSubmit}>
      <div className="space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="site-light-input w-full rounded-md border px-3.5 py-2.5 text-xs transition-colors focus:outline-none sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone"
              className="site-light-input w-full rounded-md border px-3.5 py-2.5 text-xs transition-colors focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="site-light-input w-full rounded-md border px-3.5 py-2.5 text-xs transition-colors focus:outline-none sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subject</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="site-light-input w-full rounded-md border px-3.5 py-2.5 text-xs transition-colors focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5 flex-1 flex flex-col">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Message</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help you?"
            className="site-light-input min-h-[160px] w-full flex-grow resize-none rounded-md border px-3.5 py-2.5 text-xs transition-colors focus:outline-none sm:text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="site-light-cta mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-lg transition-all sm:text-sm"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Submit Query</span>
      </button>
    </form>
  );
}
