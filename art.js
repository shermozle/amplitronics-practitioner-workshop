const paths = {
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 cart:'<path d="M2 3h3l3 12h11l3-9H6M9 19h.01M18 19h.01"/><circle cx="9" cy="19" r="1"/><circle cx="18" cy="19" r="1"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 7 0 0 1 16 0v3"/>',
 pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 bolt:'<path d="m14 2-9 12h7l-2 8 9-12h-7z"/>',
 truck:'<path d="M2 5h12v12H2zM14 9h4l4 5v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
 shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6zM8 12l3 3 5-6"/>',
 return:'<path d="M4 9h10a7 7 0 1 1-6 11M4 9l5-5M4 9l5 5"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 cog:'<path d="m9 3 .8-1h4.4L15 5l3 .7 2-1 2 4-2 2v3l2 2-2 4-3-1-3 2-.8 2H9l-1-3-3-1-2 1-2-4 2-2v-3L1 8l2-4 3 1 3-2Z"/><circle cx="12" cy="12" r="3.5"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 close:'<path d="m5 5 14 14M19 5 5 19"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M11 19h2"/>',
 laptop:'<rect x="4" y="3" width="16" height="13" rx="1"/><path d="m4 16-3 4h22l-3-4"/>',
 game:'<path d="M7 6h10c4 0 7 14 3 14l-5-4H9l-5 4C0 20 3 6 7 6Z"/><path d="M6 10v5m-2-2h5m6-2h.1m3 3h.1"/>',
 headphones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="2" y="12" width="5" height="9" rx="2"/><rect x="17" y="12" width="5" height="9" rx="2"/>',
 cpu:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/><rect x="9" y="9" width="6" height="6"/>',
 disc:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M6 8a6 6 0 0 1 4-3m5 14a6 6 0 0 0 4-4"/>'
};
export const icon = (name,cls='') => `<svg class="icon ${cls}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.bolt}</svg>`;
let seq=0;
export function art(type,color='#9288af') {
 const id=`art${seq++}`;
 const defs=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#252333"/></linearGradient><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#15102d"/><stop offset=".5" stop-color="#8264bd"/><stop offset="1" stop-color="#c7f598"/></linearGradient><filter id="${id}f"><feDropShadow dx="0" dy="12" stdDeviation="8" flood-opacity=".16"/></filter></defs>`;
 const fill=`url(#${id})`, screen=`url(#${id}s)`;
 const shapes={
 phone:`<g transform="rotate(-13 150 110)"><rect x="101" y="17" width="99" height="183" rx="17" fill="${fill}" stroke="#d6d0df" stroke-width="2"/><rect x="107" y="23" width="87" height="171" rx="13" fill="${screen}"/><rect x="132" y="28" width="37" height="9" rx="5" fill="#191722"/><path d="M111 158c42-90 40 68 81-75" fill="none" stroke="#e6c9ff" stroke-opacity=".3" stroke-width="13"/></g>`,
 laptop:`<g transform="rotate(-7 150 110)"><rect x="51" y="31" width="196" height="132" rx="8" fill="${fill}" stroke="#bfc0c8" stroke-width="2"/><rect x="58" y="38" width="182" height="117" rx="3" fill="${screen}"/><path d="m51 164-25 26q124 14 249 0l-28-26Z" fill="#a5a5b4" stroke="#dddce4"/><path d="m127 167-5 16h58l-5-16" fill="#7c7a8c"/><path d="M26 190h249l-5 5H32Z" fill="#5b596c"/></g>`,
 game:`<g transform="rotate(-12 150 110)"><path d="M90 63h120c25 0 49 113 22 117-11 2-31-31-44-36h-76c-15 6-34 38-48 35-27-6-2-116 26-116Z" fill="${fill}" stroke="#b5b5ac" stroke-width="2"/><rect x="122" y="71" width="58" height="32" rx="7" fill="#3a3b3d"/><circle cx="116" cy="125" r="18" fill="#25272b"/><circle cx="181" cy="125" r="18" fill="#25272b"/><path d="M87 89v27m-13-14h27" stroke="#292b30" stroke-width="9" stroke-linecap="round"/><g fill="#d4ddc5"><circle cx="212" cy="91" r="5"/><circle cx="224" cy="103" r="5"/><circle cx="200" cy="103" r="5"/><circle cx="212" cy="115" r="5"/></g></g>`,
 headphones:`<g transform="rotate(-13 150 110)"><path d="M79 133V97a71 71 0 0 1 142 0v36" fill="none" stroke="#33313b" stroke-width="19"/><path d="M79 112V97a71 71 0 0 1 142 0v15" fill="none" stroke="${color}" stroke-width="13"/><rect x="61" y="112" width="53" height="84" rx="23" fill="${fill}" stroke="#dfd7cc" stroke-width="2"/><rect x="187" y="112" width="53" height="84" rx="23" fill="${fill}" stroke="#dfd7cc" stroke-width="2"/><path d="M100 126v56m101-56v56" stroke="#47434a" stroke-width="12" stroke-linecap="round"/></g>`,
 mouse:`<g transform="rotate(-18 150 110)"><path d="M92 90a58 66 0 0 1 116 0v63a58 47 0 0 1-116 0Z" fill="${fill}" stroke="#aaacb7" stroke-width="2"/><path d="M150 27v76M95 104h110" stroke="#302f3d"/><rect x="143" y="55" width="14" height="33" rx="7" fill="#20202b"/><path d="M115 172q35 20 71-2" stroke="#d8d0ee" opacity=".3" fill="none"/></g>`,
 cpu:`<g transform="rotate(-16 150 110)"><rect x="77" y="38" width="146" height="146" rx="8" fill="#303742" stroke="#8c8982" stroke-width="9"/><rect x="96" y="57" width="108" height="108" rx="5" fill="${fill}" stroke="#c8bfcf" stroke-width="3"/><text x="150" y="108" fill="#e9e5ef" text-anchor="middle" font-size="18" font-family="sans-serif">SILICA</text><text x="150" y="135" fill="#e9e5ef" text-anchor="middle" font-size="27" font-family="sans-serif">X9</text></g>`,
 console:`<g transform="rotate(-10 150 110)"><path d="M111 20q34 14 71-2l15 185q-45-13-94 0Z" fill="${fill}" stroke="#e8e7ed" stroke-width="4"/><path d="M144 26v168" stroke="#1c1d28" stroke-width="28"/><path d="M155 32v153" stroke="#9171f4" stroke-width="2"/><circle cx="155" cy="177" r="3" fill="#b9f37e"/></g>`,
 speaker:`<g transform="rotate(-10 150 110)"><rect x="89" y="35" width="124" height="160" rx="35" fill="${fill}" stroke="#b89d90" stroke-width="3"/><path d="M102 68h98M100 78h102M100 88h102M100 98h102M100 108h102M100 118h102M100 128h102M100 138h102M100 148h102M100 158h102M105 168h92" stroke="#e5bfad" opacity=".22" stroke-width="3"/><circle cx="152" cy="52" r="5" fill="#ead7cb"/></g>`,
 disc:`<g transform="rotate(-13 150 110)"><rect x="82" y="24" width="138" height="179" rx="5" fill="${fill}" stroke="#777284" stroke-width="3"/><rect x="88" y="30" width="126" height="17" fill="#b5f568"/><text x="151" y="42" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="bold">ORBIT STUDIOS</text><circle cx="151" cy="119" r="46" fill="${screen}"/><path d="m102 156 49-86 49 86Z" stroke="#c7b1fa" fill="none" stroke-width="2"/><text x="151" y="182" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12">PLAY SOMETHING GREAT</text></g>`
 };
 return `<svg class="product-art" viewBox="0 0 300 230" aria-hidden="true">${defs}<ellipse cx="150" cy="208" rx="89" ry="8" fill="#20202b" opacity=".05"/><g filter="url(#${id}f)">${shapes[type]||shapes.phone}</g></svg>`;
}
