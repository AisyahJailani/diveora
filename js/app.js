/* DIVEORA - core: auth, settings, theme, greeting, shared layout (side panel/top bar/footer), notifications */
let PAGE=document.body.dataset.page;
let user=sessionStorage.getItem("de_user"); // logged-in username (null when logged out)
const root=document.documentElement;
/* ---- Listener tracking: listeners added on document/window by a page are removed when another page opens ----
   (pages are switched without reloading, so old listeners must not pile up). TRACK is false while the shared layout is built. */
let TRACK=false;const PAGE_L=[];
["document","window"].forEach(n=>{const t=n==="document"?document:window,orig=t.addEventListener;
  t.addEventListener=function(type,fn,opt){if(TRACK)PAGE_L.push([t,type,fn,opt]);return orig.call(t,type,fn,opt)}});
const USERS={aisyah:"Ims@566"}; // hardcoded login (username: aisyah, password: Ims@566 - case-sensitive)
/* ---- Saved settings (display name, notification badge), kept in localStorage ---- */
let SET={name:"Aisyah",notify:true};
try{Object.assign(SET,JSON.parse(localStorage.getItem("de_settings"))||{})}catch(e){}
const saveSet=()=>{try{localStorage.setItem("de_settings",JSON.stringify(SET))}catch(e){}};
let NAME=SET.name; // name shown in the dashboard greeting
const initials=n=>n.trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase()||"A";
/* System details shown in the footer and Settings page (edit these values) */
const USER_EMAIL="aisyah24@gmail.com"; // e-mail shown when the user clicks the avatar / name in the top bar
const META={system:"DIVEORA Car Rental Management System",version:"1.0",updated:"9 Nov 2026"};
const $=s=>document.querySelector(s);
const RM=n=>"RM "+Number(n).toLocaleString("en-MY");
/* Shows the display name and initials in the top bar */
function paintUser(){const a=$("#uAv"),n=$("#uName");if(a)a.textContent=initials(SET.name);if(n)n.textContent=SET.name;const m=$("#uMail");if(m)m.textContent=USER_EMAIL}

/* ---- Greeting based on the time of day ---- */
function greeting(){const h=new Date().getHours();
  return h<12?["Good morning","bi-sun-fill"]:h<18?["Good afternoon","bi-brightness-high-fill"]:["Good evening","bi-moon-stars-fill"]}

/* ---- Theme (light / dark), remembered in localStorage ---- */
function setTheme(t){
  root.setAttribute("data-bs-theme",t);
  try{localStorage.setItem("de_theme",t)}catch(e){}
  document.querySelectorAll(".themeIcon").forEach(i=>i.className="themeIcon bi "+(t==="dark"?"bi-sun-fill":"bi-moon-stars-fill"));
  document.dispatchEvent(new Event("themechange")); // charts redraw with new colours
}
const toggleTheme=()=>setTheme(root.getAttribute("data-bs-theme")==="dark"?"light":"dark");

/* ---- Toast message ---- */
function toast(msg){const t=document.createElement("div");t.className="de-toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2500)}

/* ---- Notifications: built from real booking events and shared by every page ---- */
const NKEY="de_nstate"; // read / cleared state is saved in the browser so it stays the same on every page
let NS={read:[],gone:[],pushed:[]};
try{const s=JSON.parse(localStorage.getItem(NKEY));if(s&&Array.isArray(s.read)&&Array.isArray(s.gone)&&Array.isArray(s.pushed))NS=s}catch(e){}
const saveNS=()=>{try{localStorage.setItem(NKEY,JSON.stringify(NS))}catch(e){}};
const dayDiff=d=>Math.round((d-TODAY)/DAY);
const shortDate=d=>d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
const inDays=n=>n===1?"tomorrow":"in "+n+" days";

/* Creates the notification list from the booking data:
   returns, pick-ups, new bookings, pending payments, payments received, cancellations and maintenance */
function eventNotes(){
  const L=[],asc=(a,b)=>a.start-b.start,ok=BOOKINGS.filter(b=>b.status!=="Cancelled");
  // 1. Cars due back soon (today, tomorrow or within 3 days)
  ok.filter(b=>{const n=dayDiff(b.ret);return n>=0&&n<=3&&(b.status==="Active"||n===0)}).slice(0,2).forEach(b=>{
    const n=dayDiff(b.ret),when=n===0?"today":n===1?"tomorrow":"in "+n+" days";
    L.push({key:"ret-"+b.id,i:"bi-alarm-fill",t:`${b.car.name} is due for return ${when}`,time:`${when[0].toUpperCase()+when.slice(1)}, ${b.retT}`,
      d:`${b.customer} will return the ${b.car.name} (${b.car.plate}) ${when} at ${b.retT} at the ${b.loc} branch. Check the fuel level and any damage when it arrives.`});
  });
  // 2. Customers who just picked up a car
  BOOKINGS.filter(b=>b.status==="Active"&&dayDiff(b.start)>=-1).slice(0,2).forEach(b=>{
    L.push({key:"act-"+b.id,i:"bi-key-fill",t:`Booking ${b.id} is now active`,time:`${dayDiff(b.start)===0?"Today":"Yesterday"}, ${b.pickT}`,
      d:`${b.customer} picked up the ${b.car.name} at the ${b.loc} branch. Remind the customer to return it on ${shortDate(b.ret)} at ${b.retT}.`});
  });
  // 3. New bookings coming up
  BOOKINGS.filter(b=>b.status==="Upcoming").sort(asc).slice(0,2).forEach(b=>{
    L.push({key:"new-"+b.id,i:"bi-calendar-plus-fill",t:`New booking ${b.id} for ${b.car.name}`,time:`Pick-up ${shortDate(b.start)}, ${b.pickT}`,
      d:`${b.customer} booked the ${b.car.name} for ${b.days} day${b.days>1?"s":""} (${RM(b.total)}). Pick-up is on ${shortDate(b.start)} at ${b.pickT} at the ${b.loc} branch.`});
  });
  // 4. Payments still pending
  BOOKINGS.filter(b=>b.pay==="Pending"&&b.status!=="Cancelled").sort(asc).slice(0,2).forEach(b=>{
    L.push({key:"pen-"+b.id,i:"bi-credit-card-fill",t:`Payment pending for ${b.id}`,time:`Pick-up ${inDays(dayDiff(b.start))}`,
      d:`${b.customer} has not paid ${RM(b.total)} for the ${b.car.name}. Contact the customer before pick-up on ${shortDate(b.start)} so the booking is not cancelled.`});
  });
  // 5. A payment received
  ok.filter(b=>b.pay==="Paid"&&Math.abs(dayDiff(b.start))<=3).slice(0,1).forEach(b=>{
    L.push({key:"pay-"+b.id,i:"bi-cash-coin",t:`Payment received for ${b.id}`,time:`Pick-up ${shortDate(b.start)}`,
      d:`${b.customer} paid ${RM(b.total)} for the ${b.car.name}. The payment is marked as paid in the booking details.`});
  });
  // 6. A cancelled booking
  BOOKINGS.filter(b=>b.status==="Cancelled").sort((a,b)=>Math.abs(dayDiff(a.start))-Math.abs(dayDiff(b.start))).slice(0,1).forEach(b=>{
    L.push({key:"can-"+b.id,i:"bi-x-circle-fill",t:`Booking ${b.id} was cancelled`,time:`Was ${shortDate(b.start)}`,
      d:`${b.customer} cancelled the booking for the ${b.car.name}. The payment of ${RM(b.total)} is marked as refunded and the car is available again.`});
  });
  // 7. A car in maintenance
  CARS.filter(c=>c.maint).slice(0,1).forEach(c=>{
    L.push({key:"mnt-"+c.id,i:"bi-tools",t:`${c.name} is in maintenance`,time:"At the workshop",
      d:`The ${c.name} (${c.plate}) is at the workshop for ${c.mrec.type.toLowerCase()}. It cannot be booked until maintenance is completed.`});
  });
  return L;
}
let NOTES=[];
function rebuildNotes(){
  NOTES=NS.pushed.concat(eventNotes()).filter(n=>!NS.gone.includes(n.key)).map(n=>Object.assign({},n,{r:NS.read.includes(n.key)?1:0}));
}
/* A new message created while using the site (for example a booking request) */
function pushNote(t,i="bi-bell-fill",d="Open the Customers page to see the full details."){NS.pushed.unshift({key:"push-"+Date.now(),t,d,time:"Just now",i});NS.pushed=NS.pushed.slice(0,20);saveNS();drawNotes()}
function drawNotes(){
  rebuildNotes();
  const n=NOTES.filter(x=>!x.r).length,b=$("#nBadge");b.textContent=n;b.style.display=n&&SET.notify?"":"none"; // badge can be switched off in Settings
  $("#nList").innerHTML=NOTES.length?NOTES.map((x,k)=>`<div class="item ${x.r?"":"unread"}" data-k="${k}"><i class="bi ${x.i}"></i><div><div class="small fw-semibold">${x.t}</div><div class="small text-muted">${x.time}</div></div></div>`).join(""):'<p class="text-center text-muted p-4 mb-0">No notifications yet.</p>';
  document.querySelectorAll("#nList .item").forEach(e=>e.onclick=()=>{
    const n=NOTES[e.dataset.k];
    if(!NS.read.includes(n.key)){NS.read.push(n.key);saveNS()}
    drawNotes();
    bootstrap.Dropdown.getOrCreateInstance($("#bellBtn")).hide();
    $("#nmIcon").className="bi me-2 text-warning "+n.i;$("#nmTitle").textContent=n.t;$("#nmBody").textContent=n.d;$("#nmTime").textContent=n.time;
    bootstrap.Modal.getOrCreateInstance($("#noteModal")).show(); // popup
  });
}
function showLegal(title,text){$("#lgTitle").textContent=title;$("#lgBody").textContent=text;bootstrap.Modal.getOrCreateInstance($("#legalModal")).show()}

/* ---- Fullscreen (button on every page) ----
   Fullscreen hides the browser tabs and address bar. Pages are opened inside the same browser page (see "Page switching"
   below), so fullscreen stays on for every page. If the browser still leaves fullscreen (for example after a reload),
   the choice is remembered (sessionStorage) and the next click, tap or key press returns to fullscreen. */
const FSKEY="de_fs";
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement;
const fsOK=!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const fsFlag=v=>{try{v?sessionStorage.setItem(FSKEY,"1"):sessionStorage.removeItem(FSKEY)}catch(e){}};
let leaving=false; // true while the page is closing, so leaving a page is not treated as "user exited fullscreen"
addEventListener("beforeunload",()=>leaving=true);addEventListener("pagehide",()=>leaving=true);
const enterFS=()=>{const r=root.requestFullscreen||root.webkitRequestFullscreen;if(r){const p=r.call(root);if(p&&p.catch)p.catch(()=>{})}};
const exitFS=()=>{const x=document.exitFullscreen||document.webkitExitFullscreen;if(x){const p=x.call(document);if(p&&p.catch)p.catch(()=>{})}};
let fsReady=false;
function initFullscreen(){
  const btns=document.querySelectorAll(".fsBtn");
  if(!fsOK){btns.forEach(b=>b.style.display="none");return} // browser has no fullscreen support (for example iPhone Safari)
  const paint=()=>{const on=!!fsEl();document.querySelectorAll(".fsBtn").forEach(b=>{const t=on?"Exit fullscreen":"Fullscreen";b.setAttribute("aria-label",t);b.title=t;const i=b.querySelector("i");if(i)i.className="bi "+(on?"bi-fullscreen-exit":"bi-fullscreen")})};
  btns.forEach(b=>b.onclick=()=>{if(fsEl()){fsFlag(false);exitFS()}else{fsFlag(true);enterFS()}});
  if(!fsReady){fsReady=true;
    const was=TRACK;TRACK=false; // these two listeners stay for the whole visit
    const changed=()=>{paint();if(!fsEl()&&!leaving)fsFlag(false)}; // user pressed Esc or the button: forget fullscreen
    document.addEventListener("fullscreenchange",changed);document.addEventListener("webkitfullscreenchange",changed);
    TRACK=was;
  }
  paint();
  /* Page was opened by a normal reload / link while in fullscreen: go back to fullscreen on the first click / tap / key press */
  let wanted=false;try{wanted=sessionStorage.getItem(FSKEY)==="1"}catch(e){}
  if(wanted&&!fsEl()){
    toast("Click or tap anywhere to return to fullscreen");
    const evs=["mousedown","pointerup","keydown"];
    const again=e=>{if(e.type==="keydown"&&e.key==="Escape")return;evs.forEach(v=>document.removeEventListener(v,again,true));enterFS()};
    evs.forEach(v=>document.addEventListener(v,again,true));
  }
}

/* ---- Shared side panel + top bar + footer + popups ---- */
function buildLayout(){
  const wasTrack=TRACK;TRACK=false; // listeners made here belong to the layout, not to a page
  /* Side panel groups: [group title, [page id, label, icon]]. Logout is added under System. */
  const GROUPS=[["Main",[["dashboard","Dashboard","bi-speedometer2"],["cars","Cars","bi-car-front-fill"],["customers","Customers","bi-people-fill"]]],
    ["Insights &amp; Resources",[["analytics","Analytics","bi-bar-chart-line-fill"],["articles","Articles","bi-journal-richtext"]]],
    ["System",[["settings","Settings","bi-gear-fill"]]]];
  const links=GROUPS.flatMap(g=>g[1]);
  const item=l=>`<li><a class="side-link ${PAGE===l[0]?"active":""}" href="${l[0]}.html"${PAGE===l[0]?' aria-current="page"':""}><i class="bi ${l[2]}"></i>${l[1]}</a></li>`;
  /* Top bar: menu button (mobile), notifications, theme, user */
  const title=(links.find(l=>l[0]===PAGE)||["","DIVEORA"])[1]; // page name shown in the top bar, e.g. "DIVEORA | Cars"
  $("#nav").innerHTML=`<a class="visually-hidden-focusable" href="#main">Skip to content</a><header class="topbar"><div class="d-flex align-items-center gap-2 gap-md-3 px-3 px-lg-4 h-100">
    <button class="btn nav-ic" id="sideOpen" aria-label="Open or close the side panel" aria-controls="side" aria-expanded="true"><i class="bi bi-list"></i></button>
    <div class="topbar-title text-truncate"><span class="tt-brand">DIVEORA</span><span class="tt-sep">|</span><span>${title}</span></div>
    <div class="ms-auto d-flex gap-2 align-items-center">
      <button class="btn nav-ic fsBtn" type="button" aria-label="Fullscreen" title="Fullscreen"><i class="bi bi-fullscreen"></i></button>
      <div class="dropdown"><button id="bellBtn" class="btn nav-ic position-relative" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-label="Notifications"><i class="bi bi-bell-fill"></i><span id="nBadge" class="badge rounded-pill bg-warning text-dark position-absolute"></span></button>
        <div class="dropdown-menu dropdown-menu-end p-0 notif"><div class="d-flex justify-content-between align-items-center p-3 border-bottom"><strong>Notifications</strong><button id="markAll" class="btn btn-link btn-sm p-0">Mark all as read</button></div><div id="nList"></div><div class="p-2 text-center"><button id="clearN" class="btn btn-sm btn-outline-secondary">Clear all</button></div></div></div>
      <button class="btn nav-ic" id="themeBtn" aria-label="Switch light or dark mode"><i class="themeIcon bi"></i></button>
      <div class="dropdown ms-1"><button type="button" class="btn user-chip" id="userBtn" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Account details"><span class="avatar" id="uAv"></span><span id="uName" class="d-none d-md-inline"></span></button>
        <div class="dropdown-menu dropdown-menu-end user-pop"><i class="bi bi-envelope me-2"></i><span id="uMail"></span></div></div>
    </div></div></header>`;
  /* Side panel (fixed on desktop, slides in on mobile) */
  document.body.insertAdjacentHTML("beforeend",`<div class="side-backdrop" id="sideBack"></div>
  <aside class="side" id="side" aria-label="Side panel">
    <div class="side-head"><a class="side-brand" href="dashboard.html"><img src="images/logo.svg" width="34" height="34" alt="DIVEORA logo"><span>DIVEORA</span></a><button class="side-close d-lg-none" id="sideClose" aria-label="Close menu"><i class="bi bi-x-lg"></i></button></div>
    <nav class="side-nav" aria-label="Main navigation">${GROUPS.map((g,i)=>`<div class="side-label">${g[0]}</div><ul class="list-unstyled mb-0">${g[1].map(item).join("")}${i===GROUPS.length-1?'<li><button class="side-link" id="logout"><i class="bi bi-box-arrow-right"></i>Logout</button></li>':""}</ul>`).join("")}</nav>
    <div class="side-foot small">&copy; ${new Date().getFullYear()} DIVEORA</div>
  </aside>`);
  document.body.classList.add("has-side");
  $("#foot").innerHTML=`<footer class="de-foot"><div class="container-xxl pt-5 pb-3"><div class="row g-4">
  <div class="col-12 col-lg-4"><div class="d-flex align-items-center gap-2 mb-2"><img src="images/logo.svg" width="36" alt=""><span class="h5 text-white mb-0">DIVEORA</span></div>
    <p class="small">DIVEORA is a car rental management system that brings fleet, customer, booking and revenue records into one dashboard.</p>
    <div class="d-flex gap-2"><a class="foot-ic" href="https://wa.me/60123456789" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a><a class="foot-ic" href="mailto:hello@diveora.my" aria-label="Email"><i class="bi bi-envelope-fill"></i></a><a class="foot-ic" href="tel:+60123456789" aria-label="Call us"><i class="bi bi-telephone-fill"></i></a></div></div>
  <nav class="col-6 col-lg-2" aria-label="Quick links"><h6>Quick links</h6><ul class="list-unstyled small mb-0">${links.map(l=>`<li class="mb-1"><a href="${l[0]}.html">${l[1]}</a></li>`).join("")}</ul></nav>
  <div class="col-6 col-lg-3"><h6>System</h6><dl class="foot-meta mb-0">${[["Name",META.system],["Version",META.version],["Last updated",META.updated]].map(m=>`<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join("")}</dl></div>
  <address class="col-12 col-lg-3 small mb-0"><h6>Contact us</h6><div class="mb-1"><i class="bi bi-geo-alt me-2"></i>Tanjung Malim, Perak, Malaysia</div><div class="mb-1"><i class="bi bi-telephone me-2"></i><a href="tel:+60123456789">+60 12-345 6789</a></div><div class="mb-1"><i class="bi bi-envelope me-2"></i><a href="mailto:hello@diveora.my">hello@diveora.my</a></div><div><i class="bi bi-clock me-2"></i>Open daily, 8:00 AM - 10:00 PM</div></address></div>
  <hr class="border-secondary mt-4"><div class="d-flex justify-content-between flex-wrap gap-2 small"><span>&copy; ${new Date().getFullYear()} DIVEORA. All rights reserved. IMS566 Individual Assignment.</span>
  <span><button class="foot-link" id="fPrivacy">Privacy Policy</button><span class="mx-2">|</span><button class="foot-link" id="fTerms">Terms of Service</button><span class="mx-2">|</span><button class="foot-link" id="toTop"><i class="bi bi-arrow-up me-1"></i>Back to top</button></span></div></div></footer>`;
  document.body.insertAdjacentHTML("beforeend",`
  <div class="modal fade" id="noteModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title"><i id="nmIcon" class="bi me-2 text-warning"></i><span id="nmTitle"></span></h5><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body"><p id="nmBody"></p><small class="text-muted" id="nmTime"></small></div><div class="modal-footer"><button class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button></div></div></div></div>
  <div class="modal fade" id="legalModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="lgTitle"></h5><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body" id="lgBody"></div><div class="modal-footer"><button class="btn btn-gold" data-bs-dismiss="modal">OK</button></div></div></div></div>`);
  /* Side panel open / close: on a computer the menu button hides or shows the panel (remembered),
     on a phone it slides the panel in and out (button, backdrop, Escape key, or choosing a link) */
  const desk=()=>window.matchMedia("(min-width:992px)").matches;
  const openSide=o=>{$("#side").classList.toggle("open",o);$("#sideBack").classList.toggle("show",o);document.body.classList.toggle("side-lock",o);syncBtn()};
  const syncBtn=()=>$("#sideOpen").setAttribute("aria-expanded",desk()?!document.body.classList.contains("side-collapsed"):$("#side").classList.contains("open"));
  let col=false;try{col=localStorage.getItem("de_side")==="closed"}catch(e){}
  document.body.classList.toggle("side-collapsed",col);
  $("#sideOpen").onclick=()=>{
    if(desk()){const c=document.body.classList.toggle("side-collapsed");try{localStorage.setItem("de_side",c?"closed":"open")}catch(e){}syncBtn()}
    else openSide(!$("#side").classList.contains("open"));
  };
  $("#sideClose").onclick=()=>openSide(false);$("#sideBack").onclick=()=>openSide(false);
  document.addEventListener("keydown",e=>{if(e.key==="Escape")openSide(false)});
  document.querySelectorAll("#side a").forEach(a=>a.addEventListener("click",()=>openSide(false)));
  window.addEventListener("resize",syncBtn);syncBtn();
  /* Logout: button in the side panel */
  const logout=()=>{sessionStorage.removeItem("de_user");user=null;gotoPage("index.html")};
  $("#logout").onclick=logout;
  $("#themeBtn").onclick=toggleTheme;
  $("#markAll").onclick=()=>{NOTES.forEach(x=>{if(!NS.read.includes(x.key))NS.read.push(x.key)});saveNS();drawNotes()};
  $("#clearN").onclick=()=>{NOTES.forEach(x=>{if(!NS.gone.includes(x.key))NS.gone.push(x.key)});saveNS();drawNotes()};
  $("#fPrivacy").onclick=()=>showLegal("Privacy Policy","DIVEORA is a student prototype. It does not collect or store any personal data. All names, phone numbers and figures shown are sample data generated for demonstration.");
  $("#fTerms").onclick=()=>showLegal("Terms of Service","This website is a prototype built for IMS566. The demo login is for testing only. Bookings, payments and prices are simulated and have no real effect.");
  $("#toTop").onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
  paintUser();drawNotes();setTheme(root.getAttribute("data-bs-theme"));initFullscreen();
  TRACK=wasTrack;
}

/* ---- Login page logic (also used when the login page is opened without reloading, for example after Logout) ---- */
function bootAuth(){
  const saved0=(()=>{try{return localStorage.getItem("de_theme")||"light"}catch(e){return"light"}})();
  $("#themeBtn").onclick=toggleTheme;setTheme(saved0);initFullscreen();
  $("#togglePass").onclick=()=>{const p=$("#pass"),s=p.type==="password";p.type=s?"text":"password";$("#togglePass i").className="bi "+(s?"bi-eye-slash":"bi-eye")};
  $("#loginForm").addEventListener("submit",e=>{
    e.preventDefault();const u=$("#user").value.trim().toLowerCase(),p=$("#pass").value,a=$("#err");
    if(USERS[u]&&USERS[u]===p){sessionStorage.setItem("de_user",u);gotoPage("dashboard.html")}
    else{a.classList.remove("d-none","shake");void a.offsetWidth;a.classList.add("shake");$("#pass").value="";$("#pass").focus()}
  });
}

/* ---- Page switching WITHOUT reloading the browser page ----
   A normal link makes the browser leave fullscreen. So links between DIVEORA pages are loaded with fetch(),
   the page content is swapped, and fullscreen stays on for every page (login and all inside pages).
   If anything fails (for example the files are opened from a folder, not a server) a normal page load is used instead. */
const FILE2PAGE={index:"login",dashboard:"dashboard",cars:"cars",customers:"customers",analytics:"analytics",articles:"articles",settings:"settings"};
const isAuthPage=p=>p==="login";
const pageCode={};            // page script text, kept after the first download
let navBusy=false;
const fileOf=u=>{const f=u.pathname.split("/").pop().replace(/\.html$/,"");return f===""?"index":f};

/* Updates the active side link and the page name in the top bar */
function updateLayout(){
  document.querySelectorAll("#side .side-link[href]").forEach(a=>{const on=a.getAttribute("href")===PAGE+".html";a.classList.toggle("active",on);if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  const cur=document.querySelector("#side .side-link.active"),t=document.querySelector(".topbar-title span:last-child");
  if(cur&&t)t.textContent=cur.textContent.trim();
}

/* Opens one DIVEORA page inside the current browser page */
async function gotoPage(href,opt={}){
  const u=new URL(href,location.href),f0=fileOf(u);
  if(u.origin!==location.origin||!(f0 in FILE2PAGE)){location.href=href;return}
  user=sessionStorage.getItem("de_user");
  let f=f0;
  if(!user&&!isAuthPage(FILE2PAGE[f]))f="index";       // not logged in -> login page
  if(user&&isAuthPage(FILE2PAGE[f]))f="dashboard";     // already logged in -> dashboard
  const url=f+".html",target=FILE2PAGE[f];
  if(navBusy)return;navBusy=true;
  try{
    const res=await fetch(url);if(!res.ok)throw new Error("page "+res.status);
    const doc=new DOMParser().parseFromString(await res.text(),"text/html");
    /* Chart.js is only loaded by some pages: load it now if the new page needs it and it is missing */
    const cdn=[...doc.querySelectorAll("body script[src]")].map(x=>x.getAttribute("src")).filter(x=>/chart\.umd/.test(x));
    if(cdn.length&&typeof Chart==="undefined")await new Promise((ok,no)=>{const sc=document.createElement("script");sc.src=cdn[0];sc.onload=ok;sc.onerror=no;document.head.appendChild(sc)});
    /* page scripts of the new page (data.js and app.js are already loaded) */
    const srcs=isAuthPage(target)?[]:[...doc.querySelectorAll("body script[src]")].map(x=>x.getAttribute("src")).filter(x=>/^js\//.test(x)&&!/\/(data|app)\.js$/.test(x));
    const codes=await Promise.all(srcs.map(async x=>{if(!pageCode[x]){const r=await fetch(x);if(!r.ok)throw new Error(x);pageCode[x]=await r.text()}return pageCode[x]}));
    swapPage(doc,target,codes);
    if(opt.push===false||opt.replace)history.replaceState({},"",url);else history.pushState({},"",url);
  }catch(e){navBusy=false;location.href=url;return}
  navBusy=false;
}

/* Replaces the old page content with the new page, then starts the new page's script */
function swapPage(doc,target,codes){
  const body=document.body,wasApp=body.classList.contains("has-side"),toApp=!isAuthPage(target);
  /* 1. Clean up the old page: listeners, charts, popups, menus */
  PAGE_L.splice(0).forEach(l=>l[0].removeEventListener(l[1],l[2],l[3]));
  if(window.Chart&&Chart.instances)Object.values(Chart.instances).forEach(c=>c.destroy());
  document.querySelectorAll(".modal.show").forEach(m=>{const i=bootstrap.Modal.getInstance(m);if(i)i.dispose()});
  document.querySelectorAll(".modal-backdrop,.de-toast").forEach(x=>x.remove());
  body.classList.remove("modal-open","side-lock");["overflow","padding-right"].forEach(k=>body.style.removeProperty(k));
  const sd=$("#side");if(sd){sd.classList.remove("open");$("#sideBack").classList.remove("show")}
  /* 2. Page title and metadata */
  document.title=doc.title;
  [['meta[name="description"]'],['meta[property="og:title"]'],['meta[property="og:description"]']].forEach(([q])=>{const a=document.head.querySelector(q),b=doc.head.querySelector(q);if(a&&b)a.setAttribute("content",b.getAttribute("content"))});
  PAGE=target;body.dataset.page=target;NAME=SET.name;
  /* 3. Swap the content */
  const fresh=n=>document.importNode(n,true);
  if(wasApp&&toApp){
    /* side panel, top bar and footer stay; only what is between #nav and #foot changes */
    const foot=$("#foot");let n=$("#nav").nextSibling;
    while(n&&n!==foot){const nx=n.nextSibling;n.remove();n=nx}
    let m=doc.getElementById("nav").nextSibling;
    while(m&&m.id!=="foot"){if(m.nodeType===1||m.nodeType===3)foot.before(fresh(m));m=m.nextSibling}
    updateLayout();
  }else{
    [...body.children].forEach(n=>{if(n.tagName!=="SCRIPT")n.remove()});   // also removes the old side panel and popups
    body.classList.remove("has-side","side-collapsed");
    const firstScript=body.querySelector("script");
    [...doc.body.children].forEach(n=>{if(n.tagName!=="SCRIPT")body.insertBefore(fresh(n),firstScript)});
    if(toApp)buildLayout();else bootAuth();
  }
  scrollTo(0,0);
  const main=$("#main");if(main){main.setAttribute("tabindex","-1");main.focus({preventScroll:true})}
  /* 4. Start the new page's script. Wrapped in a function so its names do not clash with the previous page. */
  TRACK=true;
  codes.forEach(c=>{const sc=document.createElement("script");sc.textContent="(function(){\n"+c+"\n})();";document.body.appendChild(sc);sc.remove()});
}

/* Clicks on links to other DIVEORA pages and the browser Back / Forward buttons use the page switcher */
(()=>{const was=TRACK;TRACK=false;
  document.addEventListener("click",e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest&&e.target.closest("a[href]");if(!a||a.target||a.hasAttribute("download"))return;
    const u=new URL(a.href,location.href);
    if(u.origin!==location.origin||(u.pathname===location.pathname&&u.hash))return;
    const f=fileOf(u);if(!(f in FILE2PAGE)||!/(\.html|\/)$/.test(u.pathname))return;
    e.preventDefault();
    if(FILE2PAGE[f]===PAGE){scrollTo({top:0,behavior:"smooth"});return}
    gotoPage(a.getAttribute("href"));
  });
  addEventListener("popstate",()=>gotoPage(location.href,{push:false}));
  TRACK=was})();

/* ---- Boot: login page vs protected pages ---- */
let saved="light";try{saved=localStorage.getItem("de_theme")||"light"}catch(e){}
root.setAttribute("data-bs-theme",saved);
if(PAGE==="login"){
  if(user)location.replace("dashboard.html"); // already logged in
  else bootAuth();
}else{
  if(!user)location.replace("index.html"); // not logged in -> back to login
  else buildLayout();
}
TRACK=true; // from here on, listeners added by the page scripts are removed when another page opens