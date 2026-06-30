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
              className="w-full bg-[#050c14]/80 border border-gray-800 rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c7a14e] transition-colors"
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
              className="w-full bg-[#050c14]/80 border border-gray-800 rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c7a14e] transition-colors"
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
              className="w-full bg-[#050c14]/80 border border-gray-800 rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c7a14e] transition-colors"
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
              className="w-full bg-[#050c14]/80 border border-gray-800 rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c7a14e] transition-colors"
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
            className="w-full flex-grow min-h-[160px] bg-[#050c14]/80 border border-gray-800 rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#c7a14e] transition-colors resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-[#c7a14e] to-[#9e782f] text-[#050c14] py-3.5 px-6 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-4"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Submit Query</span>
      </button>
    </form>
  );
}
