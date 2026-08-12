import React from "react";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
};

export function FooterDoodles() {
  return <div className="footer-doodles" aria-hidden="true">
    <svg className="footer-doodle footer-dino" viewBox="0 0 300 250">
      <path {...strokeProps} d="M26 190c30-7 49-25 54-52 6-35-5-74 15-99 17-21 52-21 74-3 16 13 22 33 29 52 11 28 29 45 69 48-20 11-42 13-63 7-4 34-23 61-55 72-31 10-70 4-89-17" />
      <path {...strokeProps} d="m101 38 13-25 16 23 18-25 12 30m-61 52c13 5 26 5 38-2m-8-27 1 1m37 13 1 1m-88 70-34-8m37 32-29 23m121-53 35 22m-52 26 16 35" />
      <path {...strokeProps} className="footer-dino-arm" d="M176 115c19 4 32 14 42 31l-24 2" />
    </svg>

    <svg className="footer-doodle footer-smiley" viewBox="0 0 210 210">
      <path {...strokeProps} d="M105 12c53 0 92 39 92 92s-39 94-92 94-93-41-93-94 40-92 93-92Z" />
      <path {...strokeProps} className="footer-eye footer-eye-left" d="m60 72 16 15m0-15L60 87" />
      <path {...strokeProps} className="footer-eye footer-eye-right" d="m134 72 16 15m0-15-16 15" />
      <path {...strokeProps} d="M55 124c23 33 73 37 101 0-10 7-22 8-31 2-11 11-26 10-36-1-10 7-23 7-34-1Z" />
    </svg>

    <svg className="footer-doodle footer-robot" viewBox="0 0 260 260">
      <path {...strokeProps} d="M130 37V15m-13 0h26M48 79c0-16 13-29 29-29h106c16 0 29 13 29 29v112c0 16-13 29-29 29H77c-16 0-29-13-29-29V79Z" />
      <path {...strokeProps} d="M28 111H13v55h35m164-55h34v55h-34M78 101c0-15 10-26 24-26s24 11 24 26-10 27-24 27-24-12-24-27Zm56 0c0-15 10-26 24-26s24 11 24 26-10 27-24 27-24-12-24-27Z" />
      <path {...strokeProps} className="footer-robot-mouth" d="M84 166c28 18 62 18 91 0M91 185h78" />
      <path {...strokeProps} d="m71 224-10 25m128-25 10 25" />
    </svg>

    <svg className="footer-doodle footer-spark" viewBox="0 0 170 170">
      <path {...strokeProps} d="m86 8 12 51 45-25-27 45 49 10-50 11 25 44-43-26-12 49-10-49-45 26 27-45L8 88l49-10-25-44 44 25L86 8Z" />
      <circle cx="85" cy="88" r="17" fill="currentColor" />
    </svg>

    <svg className="footer-doodle footer-mini-face" viewBox="0 0 150 130">
      <path {...strokeProps} d="M17 68c0-37 24-57 59-57 36 0 58 21 58 57 0 35-22 51-58 51-35 0-59-17-59-51Z" />
      <circle cx="52" cy="62" r="7" fill="currentColor" />
      <circle cx="99" cy="62" r="7" fill="currentColor" />
      <path {...strokeProps} className="footer-mini-mouth" d="M51 87c15 9 34 9 49 0" />
      <path {...strokeProps} d="m32 18-13-15m99 16 13-15" />
    </svg>
  </div>;
}

export function SocialIcon({ name }) {
  if (name === "Instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" className="social-dot"/></svg>;
  if (name === "Behance") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h7c3 0 4.7 1.5 4.7 4 0 1.5-.7 2.7-2 3.3 1.8.5 2.8 1.8 2.8 3.8 0 3-2.1 4.9-5.6 4.9H3V5Zm4 6h2.5c1.2 0 1.9-.6 1.9-1.7 0-1-.7-1.6-1.9-1.6H7V11Zm0 7.2h2.8c1.5 0 2.3-.7 2.3-2 0-1.2-.8-1.9-2.3-1.9H7v3.9ZM16 7h5v2h-5V7Zm5.8 9.5h-4.6c.1 1.5.9 2.3 2.2 2.3 1 0 1.7-.4 2-1.1h3.1c-.7 2.4-2.5 3.7-5.1 3.7-3.5 0-5.6-2.2-5.6-5.7 0-3.4 2.2-5.8 5.5-5.8 3.6 0 5.4 2.7 5.1 6.6h-2.6Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5H2V21h3V8.5ZM3.5 3A1.8 1.8 0 1 0 3.5 6.6 1.8 1.8 0 0 0 3.5 3ZM9 8.5H6V21h3v-6.2c0-2.2.8-3.7 2.8-3.7 1.8 0 2.2 1.4 2.2 3.5V21h3v-7.2c0-3.5-1.7-5.7-4.8-5.7-1.7 0-2.8.8-3.2 1.6V8.5Z"/></svg>;
}
