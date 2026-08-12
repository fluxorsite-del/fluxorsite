import React from "react";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" };

export default function MenuDoodles({ active }) {
  return <div className={`menu-art${active ? ` is-${active}` : ""}`} aria-hidden="true">
    <svg className="menu-doodle menu-dino" viewBox="0 0 240 210"><path {...line} d="M20 170c31-5 48-25 50-55 2-36-8-72 19-92 22-16 55-10 70 13 12 18 9 44 24 60 10 11 23 17 40 17-20 19-43 21-65 9-5 34-25 57-55 65-27 7-59 0-73-17Z"/><path {...line} d="m92 24 12-20 14 22 18-19 8 27m-54 42c13 6 26 6 38 0m-1-23h1m30 10h1m-88 56-36-5m41 29-25 29m102-48 27 24"/><path {...line} className="menu-dino-arm" d="m151 94 35 19-25 12"/></svg>
    <svg className="menu-doodle menu-eye" viewBox="0 0 220 150"><path {...line} d="M10 76c23-38 57-58 100-58s78 20 100 58c-22 38-57 58-100 58S33 114 10 76Z"/><circle className="menu-pupil" cx="110" cy="76" r="27" fill="currentColor"/><circle cx="101" cy="67" r="7" fill="#0b0710"/></svg>
    <svg className="menu-doodle menu-orbit" viewBox="0 0 210 210"><circle {...line} cx="105" cy="105" r="28"/><ellipse {...line} cx="105" cy="105" rx="90" ry="37" transform="rotate(28 105 105)"/><ellipse {...line} cx="105" cy="105" rx="90" ry="37" transform="rotate(-28 105 105)"/><circle className="menu-orbit-dot" cx="186" cy="79" r="9" fill="currentColor"/></svg>
    <svg className="menu-doodle menu-bot" viewBox="0 0 210 220"><path {...line} d="M105 34V12m-13 0h26M37 68c0-14 12-25 26-25h84c14 0 26 11 26 25v96c0 14-12 26-26 26H63c-14 0-26-12-26-26V68Z"/><path {...line} d="M18 91H7v53h30m136-53h30v53h-30M65 94c0-14 9-24 21-24s21 10 21 24-9 24-21 24-21-10-21-24Zm42 0c0-14 9-24 21-24s21 10 21 24-9 24-21 24-21-10-21-24Z"/><path {...line} className="menu-bot-mouth" d="M69 146c23 16 49 16 72 0"/></svg>
    <span className="menu-art-caption">MOVA O PONTEIRO<br />ESCOLHA UM DESTINO</span>
  </div>;
}
