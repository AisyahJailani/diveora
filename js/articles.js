/* DIVEORA - Articles page (read only): data, SVG illustrations, search, filter, cards and full-article popup */
const CATS=["Car Rental Tips","Vehicle Maintenance","Safe Driving","Travel Guides","Company Updates"];
/* Each article: title, category, date, author, minutes to read, short description, full content.
   Content items: a string = paragraph, {h:"..."} = sub-heading, an array = bullet list. */
const ARTICLES=[
{t:"5 Things to Check Before Renting a Car",cat:"Car Rental Tips",date:"2026-10-05",by:"DIVEORA Team",min:3,
 sum:"A quick checklist to run through at the counter so your rental starts without surprises.",
 body:["Renting a car should be easy, but a few minutes of checking at pick-up can save you from disputes later. Run through these five points before you drive away.",{h:"Your checklist"},
  ["Driving licence and ID: make sure your licence is valid for the whole rental period and bring the documents the rental company asks for.","Booking details: confirm that the car model, pick-up and return time, branch and total price match your booking.","Car condition: walk around the car and note any scratches, dents or tyre damage. Take dated photos and ask staff to record the damage.","Fuel and mileage: check the fuel level and mileage on the dashboard and agree on the fuel policy.","Payment and deposit: ask what the deposit is, what insurance covers and when the deposit is refunded."],
  "Keep the rental agreement and your photos until the deposit is returned. If anything looks different from your booking, raise it before you leave the branch, not after."]},
{t:"How to Choose the Right Rental Car",cat:"Car Rental Tips",date:"2026-10-12",by:"DIVEORA Team",min:4,
 sum:"Match the car to your passengers, luggage, route and budget.",
 body:["The best rental car is the one that fits your trip, not necessarily the biggest or the cheapest. Start with a few simple questions.",{h:"Passengers and luggage"},"Count the people and bags first. A hatchback such as the Perodua Myvi or Axia suits one to three people with light luggage and is easy to park in town. A sedan has more boot space and a smoother ride on the highway. For families or groups of up to seven, an MPV or SUV is more comfortable.",{h:"Your route"},"City driving suits small, fuel-efficient cars. Long highway trips or hilly roads are easier in a larger car with more power. If you will carry a lot of luggage, check the boot size and not only the number of seats.",{h:"Your budget"},"Daily rates rise with the size of the car. Compare the total cost, including fuel, tolls and parking, before you decide. Renting for more days in one booking is often better value than several short rentals."]},
{t:"Why Regular Car Maintenance Is Important",cat:"Vehicle Maintenance",date:"2026-10-19",by:"DIVEORA Team",min:3,
 sum:"Regular servicing keeps a car safe, reliable and cheaper to run.",
 body:["A car is made of thousands of parts that wear out with use. Regular maintenance finds small problems early, before they become expensive repairs or safety risks.",{h:"Why it matters"},
  ["Safety: brakes, tyres, lights and steering must work properly every time you drive.","Reliability: a well-kept car is less likely to break down on the road.","Lower costs: changing oil or a worn belt on time is cheaper than repairing an engine.","Fuel economy: clean filters and correct tyre pressure help the car use less fuel.","Resale value: a car with a full service record is easier to sell."],
  "At DIVEORA, cars go through scheduled servicing and are checked before and after each rental. A car that is in maintenance is marked in the system and cannot be booked until it is ready."]},
{t:"Essential Vehicle Maintenance Checklist",cat:"Vehicle Maintenance",date:"2026-10-26",by:"DIVEORA Team",min:4,
 sum:"A simple checklist of what to inspect weekly, monthly and at every service.",
 body:["You do not need to be a mechanic to look after your car. These simple checks catch most problems early.",{h:"Every week or before a long trip"},["Tyre pressure and tread, including the spare tyre","Engine oil and coolant levels","Lights, indicators and wipers","Windscreen washer fluid"],{h:"Every month"},["Battery terminals for dirt or corrosion","Brake fluid level","Air filter condition"],{h:"At every service"},"Follow the interval in your owner's manual for oil and filter changes, brake inspection and tyre rotation. Keep your service records in one place so you know what was done and when."]},
{t:"7 Tips for Safe Driving",cat:"Safe Driving",date:"2026-11-02",by:"DIVEORA Team",min:3,
 sum:"Seven simple habits that lower your risk on every journey.",
 body:["Most accidents can be avoided with good habits. Keep these seven tips in mind every time you get behind the wheel.",["Wear your seat belt and make sure every passenger does the same.","Keep a safe distance from the car in front, and leave more space in bad weather.","Obey speed limits and adjust your speed to the road conditions.","Never use your phone while driving. Set up navigation before you start.","Do not drive when you are tired. Take a break at least every two hours on long trips.","Check your mirrors often and signal early before turning or changing lane.","Stay calm, be patient with other drivers and expect the unexpected."]]},
{t:"How to Drive Safely in Heavy Rain",cat:"Safe Driving",date:"2026-11-06",by:"DIVEORA Team",min:4,
 sum:"Slow down, keep your distance and know what to do if the car aquaplanes.",
 body:["Heavy rain is common in Malaysia. It reduces visibility and tyre grip, so a few adjustments make a big difference.",["Slow down. Wet roads need a longer stopping distance.","Switch on your dipped headlights so other drivers can see you.","Keep at least double the usual distance from the car in front.","Brake gently and avoid sudden steering.","Do not drive through flooded roads. Even shallow, fast-moving water is dangerous, and water can damage the engine."],{h:"If the car aquaplanes"},"If the steering suddenly feels light, ease off the accelerator, hold the steering wheel straight and let the car slow down. Do not brake hard.","If the rain is so heavy that you cannot see the road, pull over in a safe place and wait until it eases."]},
{t:"Best Road Trip Destinations in Malaysia",cat:"Travel Guides",date:"2026-11-09",by:"DIVEORA Team",min:4,
 sum:"Five destinations that are worth the drive, from cool hills to sandy beaches.",
 body:["Malaysia has good roads and a lot to see, which makes it a great country for a road trip. Here are five destinations to start with.",["Cameron Highlands, Pahang: cool weather, tea plantations and strawberry farms. The road has many bends, so drive carefully.","Melaka: a historic city with old streets, museums and plenty of food. Park outside the centre and walk.","Ipoh, Perak: known for its food, cave temples and street murals.","Penang: heritage streets and hawker food in George Town, reached by road over the Penang bridges.","Port Dickson, Negeri Sembilan: a beach town close to the Klang Valley, ideal for a weekend."],"Check the weather and traffic before you leave, and book your rental car early during school holidays and public holidays."]},
{t:"Essential Items to Bring for a Road Trip",cat:"Travel Guides",date:"2026-11-10",by:"DIVEORA Team",min:3,
 sum:"Pack these items and your road trip will be more comfortable and safer.",
 body:["A little preparation makes a long drive much easier. Here is what we suggest you pack.",{h:"Documents and money"},["Driving licence, ID and the rental agreement","Touch 'n Go card or e-wallet for tolls","Some cash and a bank card"],{h:"In the car"},["Phone, charger and a phone holder","Offline maps downloaded in advance","Drinking water and snacks","Umbrella or raincoat","Rubbish bags to keep the car clean"],{h:"For safety"},["First-aid kit and any personal medicine","Spare clothes and a towel"]]},
{t:"Introducing the DIVEORA Rental Fleet",cat:"Company Updates",date:"2026-10-01",by:"DIVEORA Team",min:3,
 sum:"Meet the hatchbacks, sedans, SUVs and MPVs available at DIVEORA.",
 body:["DIVEORA offers 12 cars for different trips and budgets, from small city cars to large family vehicles.",["Hatchbacks: Perodua Myvi and Perodua Axia, ideal for city driving.","Sedans: Proton Saga, Toyota Vios, Honda City, Mazda 3 and Nissan Almera, comfortable on the highway.","SUVs: Proton X50, Honda HR-V and Toyota Fortuner, for rougher roads and more space.","MPVs: Perodua Alza and Toyota Alphard, for families and groups."],"Daily rates range from RM100 to RM520 depending on the model. Cars can be collected and returned at our branches in Tanjung Malim, KLIA, Shah Alam and Petaling Jaya. Browse the whole fleet on the Cars page."]},
{t:"Our Commitment to Customer Satisfaction",cat:"Company Updates",date:"2026-10-15",by:"DIVEORA Team",min:3,
 sum:"How we look after every customer, from booking to return.",
 body:["Our goal is simple: every customer should enjoy a smooth rental from the first booking to the day the car comes back.",["Clear pricing: the daily rate and the total are shown before you confirm.","Checked cars: every car is inspected before pick-up.","Convenient pick-up: collect your car at one of four branches, with pick-up times from morning to late afternoon.","Friendly support: reach us by phone, WhatsApp or email. We are open daily from 8:00 AM to 10:00 PM.","Fair handling of changes: if a booking is cancelled, the payment is marked as refunded."],"We read every piece of feedback and use it to improve our service."]}
];
ARTICLES.sort((a,b)=>b.date.localeCompare(a.date));          // newest first
ARTICLES.forEach((a,i)=>{a.id=i;a.v=i%2});                   // id and colour variant

/* Draws a flat SVG illustration for each category (no external image files needed) */
function artSVG(cat,v,label){
  const bg=v?"#7a2640":"#5a1a2e",A="#c9973f",W="#ffffff";let g="";
  const gear=(cx,cy,r,col)=>{let t="";for(let i=0;i<8;i++)t+=`<rect x="${cx-5}" y="${cy-r-8}" width="10" height="16" rx="2" fill="${col}" transform="rotate(${i*45} ${cx} ${cy})"/>`;return t+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${cx}" cy="${cy}" r="${r*.4}" fill="${bg}"/>`};
  if(cat==="Car Rental Tips")g=`<rect y="140" width="320" height="20" fill="rgba(255,255,255,.08)"/><g transform="translate(86 16) scale(2.4)"><path d="M10 40L15 28Q17 24 23 24H41Q47 24 49 28L54 40V46H10Z" fill="${A}"/><path d="M20 28H31V36H15ZM35 28H42L47 36H35Z" fill="${bg}"/><circle cx="22" cy="46" r="5" fill="${W}"/><circle cx="42" cy="46" r="5" fill="${W}"/></g><circle cx="268" cy="40" r="20" fill="${A}"/><path d="M258 40l7 7 13-14" stroke="${bg}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if(cat==="Vehicle Maintenance")g=gear(130,78,30,A)+gear(204,102,20,W)+`<rect y="146" width="320" height="14" fill="rgba(255,255,255,.08)"/>`;
  else if(cat==="Safe Driving")g=`<rect y="142" width="320" height="18" fill="rgba(255,255,255,.1)"/><path d="M0 151H320" stroke="${W}" stroke-width="2" stroke-dasharray="16 12" opacity=".5"/><path d="M160 20L204 36V82Q204 112 160 132Q116 112 116 82V36Z" fill="${A}"/><path d="M142 76l14 14 26-30" stroke="${bg}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if(cat==="Travel Guides")g=`<circle cx="238" cy="44" r="20" fill="${A}"/><rect y="120" width="320" height="40" fill="rgba(255,255,255,.1)"/><path d="M0 120L70 54L120 102L170 68L240 120Z" fill="rgba(255,255,255,.18)"/><path d="M120 120L200 60L290 120Z" fill="rgba(255,255,255,.3)"/><path d="M128 160L152 120H168L192 160Z" fill="#2a0d18"/><path d="M160 158V124" stroke="${A}" stroke-width="3" stroke-dasharray="8 6"/>`;
  else{let w="";for(let r=0;r<5;r++)for(let c=0;c<3;c++)w+=`<rect x="${140+c*17}" y="${44+r*18}" width="10" height="10" fill="${(r+c)%2?A:W}" opacity=".9"/>`;
    g=`<rect x="70" y="66" width="50" height="74" fill="rgba(255,255,255,.2)"/><rect x="130" y="34" width="60" height="106" fill="rgba(255,255,255,.35)"/><rect x="200" y="78" width="50" height="62" fill="rgba(255,255,255,.2)"/>${w}<rect x="40" y="140" width="240" height="6" fill="${A}"/>`}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" role="img" aria-label="${label}"><rect width="320" height="160" fill="${bg}"/>${g}</svg>`;
}

if(PAGE==="articles"&&user){
  const fmtD=iso=>fromISO(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
  $("#fCat").innerHTML='<option value="">All categories</option>'+CATS.map(c=>`<option>${c}</option>`).join("");
  /* Article card: image, category, date, title, short description, Read more */
  const card=a=>`<div class="col-12 col-md-6 col-xl-4"><article class="card art-card h-100">${artSVG(a.cat,a.v,a.t)}<div class="p-3 d-flex flex-column flex-grow-1"><div class="d-flex justify-content-between align-items-center mb-2"><span class="badge cat-badge">${a.cat}</span><small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${fmtD(a.date)}</small></div><h2 class="h6 mb-2">${a.t}</h2><p class="small text-muted flex-grow-1">${a.sum}</p><button class="btn btn-brand btn-sm align-self-start" data-id="${a.id}">Read more <i class="bi bi-arrow-right ms-1"></i></button></div></article></div>`;
  /* Search + category filter + article count */
  const show=()=>{const q=$("#q").value.toLowerCase().trim(),c=$("#fCat").value;
    const l=ARTICLES.filter(a=>(a.t+" "+a.sum+" "+a.cat).toLowerCase().includes(q)&&(!c||a.cat===c));
    $("#count").textContent=`Showing ${l.length} of ${ARTICLES.length} articles`;
    $("#artGrid").innerHTML=l.length?l.map(card).join(""):'<p class="col-12 text-center text-muted py-5">No articles match your search. Clear the search or choose another category.</p>';
  };
  $("#q").addEventListener("input",show);$("#fCat").addEventListener("input",show);
  $("#reset").onclick=()=>{$("#q").value="";$("#fCat").value="";show()};
  /* Read more -> full article in a popup */
  $("#artGrid").addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(b)read(ARTICLES[b.dataset.id])});
  function read(a){
    $("#aTitle").textContent=a.t;
    $("#aImg").innerHTML=artSVG(a.cat,a.v,a.t);
    $("#aMeta").innerHTML=`<span class="badge cat-badge me-2">${a.cat}</span><small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${fmtD(a.date)} &middot; ${a.by} &middot; ${a.min} min read</small>`;
    $("#aBody").innerHTML=a.body.map(b=>typeof b==="string"?`<p>${b}</p>`:Array.isArray(b)?`<ul>${b.map(x=>`<li>${x}</li>`).join("")}</ul>`:`<h3 class="h6 mt-3">${b.h}</h3>`).join("");
    bootstrap.Modal.getOrCreateInstance($("#artModal")).show();
  }
  show();
}
