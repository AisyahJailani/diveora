/* DIVEORA - dataset (deterministic, generated relative to today's date) */
const TODAY=new Date();TODAY.setHours(0,0,0,0);
const YEAR=TODAY.getFullYear(),DAY=864e5;
const addD=(d,n)=>new Date(d.getTime()+n*DAY);
const TYPES=["Sedan","SUV","MPV","Hatchback"];
const SLOTS=["08:00 AM","09:30 AM","10:00 AM","11:30 AM","01:00 PM","02:30 PM","04:00 PM","05:30 PM"]; // pick-up / return times
const BRANCHES=["Tanjung Malim","KLIA","Shah Alam","Petaling Jaya"];
// Image file name for each model (images/<name>.webp), same order as CARS below
const SLUGS=["myvi","axia","saga","vios","city","x50","hrv","fortuner","alza","alphard","mazda3","almera"];
// name, type, price/day (RM), seats
const CARS=[["Perodua Myvi","Hatchback",120,5],["Perodua Axia","Hatchback",100,5],["Proton Saga","Sedan",130,5],["Toyota Vios","Sedan",160,5],["Honda City","Sedan",180,5],["Proton X50","SUV",230,5],["Honda HR-V","SUV",250,5],["Toyota Fortuner","SUV",380,7],["Perodua Alza","MPV",170,7],["Toyota Alphard","MPV",520,7],["Mazda 3","Sedan",210,5],["Nissan Almera","Sedan",140,5]]
.map((c,i)=>({id:i,img:SLUGS[i],cat:c[1].toLowerCase(),name:c[0],type:c[1],price:c[2],seats:c[3],maint:false,plate:"V"+["AB","CD","EF"][i%3]+" "+(1000+i*137)}));
const NAMES=["Ahmad Faiz","Nur Aisyah","Lim Wei Jie","Siti Nurhaliza","Raj Kumar","Tan Mei Ling","Muhammad Haziq","Farah Dina","Kevin Ong","Aina Sofea","Hafiz Rahman","Priya Nair","Daniel Lee","Zulaikha Omar","Amirul Hakim","Chong Yee"];
let seed=11;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
const BOOKINGS=Array.from({length:64},(_,i)=>{
  const days=i<5?3+i%3:1+Math.floor(rnd()*7);
  const start=i<5?addD(TODAY,-(i%3)):i<10?addD(TODAY,2+i):new Date(YEAR,0,1+Math.floor(rnd()*360));
  const car=CARS[i<5?i:Math.floor(rnd()*10)],end=addD(start,days-1);
  let status=end<TODAY?(rnd()<.1?"Cancelled":"Completed"):start>TODAY?"Upcoming":"Active";
  if(status==="Upcoming"&&rnd()<.08)status="Cancelled";
  const pay=status==="Cancelled"?"Refunded":(status==="Upcoming"&&rnd()<.5)?"Pending":"Paid";
  const ci=Math.floor(rnd()*NAMES.length);
  return{id:"BK-"+(1001+i),customer:NAMES[ci],
    phone:"01"+[2,3,4,6,7,9][ci%6]+"-"+String(1000000+((ci+3)*7919311)%9000000),
    email:NAMES[ci].toLowerCase().replace(/ /g,".")+"@mail.com",
    car,start,end,ret:addD(start,days),days,total:car.price*days,status,pay,
    pickT:SLOTS[Math.floor(rnd()*SLOTS.length)],retT:SLOTS[Math.floor(rnd()*SLOTS.length)],loc:BRANCHES[Math.floor(rnd()*BRANCHES.length)]};
}).sort((a,b)=>b.start-a.start);

/* ---- Cars added with the "Add Car" button (Cars page), saved in the browser (localStorage) ----
   They are appended after the 12 sample cars, so every page counts them in the fleet. */
const XKEY="de_cars";
let XCARS=[];
try{const s=JSON.parse(localStorage.getItem(XKEY));if(Array.isArray(s))XCARS=s}catch(e){}
const saveXCars=()=>{try{localStorage.setItem(XKEY,JSON.stringify(XCARS));return true}catch(e){return false}};
const BASE_CARS=CARS.length; // the 12 sample cars; cars added by the user come after them (these can be deleted)
const makeCar=(x,i)=>({custom:true,id:i,img:x.img||"hero",src:x.src||"",cat:x.type.toLowerCase(),name:x.name,type:x.type,price:x.price,seats:x.seats,maint:false,plate:x.plate});
XCARS.forEach(x=>CARS.push(makeCar(x,CARS.length)));

/* ---- Customer changes (Edit / Delete on the Customers page), saved in the browser ----
   Each booking keeps the original customer name in b.cid. An edit changes the name, phone and e-mail
   shown on every page. A deleted customer is hidden from the Customers list, but the bookings stay in the records. */
const CKEY="de_cust";
let CUSTX={edit:{},del:[]};
try{const s=JSON.parse(localStorage.getItem(CKEY));if(s&&s.edit&&Array.isArray(s.del))CUSTX=s}catch(e){}
const saveCust=()=>{try{localStorage.setItem(CKEY,JSON.stringify(CUSTX))}catch(e){}};
BOOKINGS.forEach(b=>{b.cid=b.customer;b.orig={name:b.customer,phone:b.phone,email:b.email}}); // keep the original details
function applyCust(){BOOKINGS.forEach(b=>{const o=CUSTX.edit[b.cid]||b.orig;b.customer=o.name;b.phone=o.phone;b.email=o.email})}
applyCust();

/* ---- Vehicle maintenance records ----
   Saved in the browser (localStorage) so every page sees the same car status.
   stage: "In progress" -> "Completed" (work done, waiting for inspection) -> "Closed" (car set Available) */
const MKEY="de_maint";
const MTYPES=["Routine service","Oil change","Tyre replacement","Brake repair","Battery","Air-conditioning","Body repair","Other"];
const toISO=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); // Date -> "2026-11-13"
const fromISO=s=>{const p=s.split("-").map(Number);return new Date(p[0],p[1]-1,p[2])};                             // "2026-11-13" -> Date

/* ---- Payment methods, payments and bookings added with "Add booking" (Customers page) ----
   Sample bookings get a payment method from their booking number (fixed, never random).
   Bookings added by the admin and payments received later are saved in the browser (localStorage),
   so every page (Dashboard, Cars, Analytics) shows the same figures. */
const PMETHODS=["Cash","Debit / Credit Card","Online Banking (FPX)","E-Wallet (Touch 'n Go / GrabPay)","DuitNow QR"];
const numOf=id=>+String(id).replace(/\D/g,""); // "BK-1005" -> 1005
BOOKINGS.forEach(b=>{
  b.method=b.pay==="Pending"?"":PMETHODS[(numOf(b.id)*5+2)%PMETHODS.length];   // how the customer paid
  b.paidOn=b.pay==="Pending"?null:(b.start>TODAY?TODAY:b.start);                // date the payment was received
});
const BKEY="de_bkx",PKEY="de_pay";
let XBK=[],PAYX={};
try{const s=JSON.parse(localStorage.getItem(BKEY));if(Array.isArray(s))XBK=s}catch(e){}
try{const s=JSON.parse(localStorage.getItem(PKEY));if(s&&typeof s==="object"&&!Array.isArray(s))PAYX=s}catch(e){}
const saveXBk=()=>{try{localStorage.setItem(BKEY,JSON.stringify(XBK))}catch(e){}};
const savePayX=()=>{try{localStorage.setItem(PKEY,JSON.stringify(PAYX))}catch(e){}};
const statusOf=(start,end)=>end<TODAY?"Completed":start>TODAY?"Upcoming":"Active";
/* Turns a saved record into a booking object (same shape as the sample bookings) */
function makeBooking(x){
  const car=CARS.find(c=>c.plate===x.plate);if(!car)return null;   // the car was deleted: skip this record
  const start=fromISO(x.start),end=addD(start,x.days-1);
  return{id:x.id,cid:x.cid,customer:x.orig.name,phone:x.orig.phone,email:x.orig.email,orig:x.orig,car,start,end,ret:addD(start,x.days),days:x.days,
    total:x.total,status:statusOf(start,end),pay:x.pay,method:x.method||"",paidOn:x.paidOn?fromISO(x.paidOn):null,pickT:x.pickT,retT:x.retT,loc:x.loc,added:true};
}
const applyPay=b=>{const p=PAYX[b.id];if(p){b.pay=p.pay;b.method=p.method;b.paidOn=p.paidOn?fromISO(p.paidOn):null}};
/* Add booking: saves the record and adds the booking to every list */
function addBooking(x){
  XBK.push(x);saveXBk();
  const b=makeBooking(x);if(!b)return null;
  BOOKINGS.push(b);BOOKINGS.sort((p,q)=>q.start-p.start);
  if(!NAMES.includes(b.cid))NAMES.push(b.cid);   // a new customer appears in the Customers list
  applyCust();applyMaint();return b;
}
/* Receive payment for a pending booking */
function setPaid(b,method){
  b.pay="Paid";b.method=method;b.paidOn=new Date(TODAY);
  PAYX[b.id]={pay:"Paid",method,paidOn:toISO(TODAY)};savePayX();
}
XBK.map(makeBooking).filter(Boolean).forEach(b=>{BOOKINGS.push(b);if(!NAMES.includes(b.cid))NAMES.push(b.cid)});
BOOKINGS.sort((a,b)=>b.start-a.start);
BOOKINGS.forEach(applyPay);
applyCust();
/* Sample records created the first time the site is opened: 2 cars in the workshop + past history */
function seedMaint(){
  const past=(car,type,reason,ago,len,cost,notes)=>({car,type,reason,start:toISO(addD(TODAY,-ago)),end:toISO(addD(TODAY,-ago+len)),cost,notes,stage:"Closed",
    done:toISO(addD(TODAY,-ago+len)),closed:toISO(addD(TODAY,-ago+len+1)),inspect:"Inspection passed. No other problems."});
  const open=(car,type,reason,from,len,cost,notes)=>({car,type,reason,start:toISO(addD(TODAY,from)),end:toISO(addD(TODAY,from+len)),cost,notes,stage:"In progress",done:"",closed:"",inspect:""});
  return [
    open(10,"Routine service","Scheduled 20,000 km service",-2,4,450,"Engine oil, filters and brake inspection."),
    open(11,"Brake repair","Front brake pads worn",-1,4,380,"Front brake pads and discs to be replaced."),
    past(0,"Oil change","Engine oil and filter",160,1,180,"Engine oil and oil filter changed."),
    past(0,"Tyre replacement","Tyres worn",70,1,640,"Four new tyres fitted and wheels aligned."),
    past(1,"Routine service","Scheduled service",120,2,320,"Full service and fluid top-up."),
    past(2,"Battery","Battery weak",90,1,260,"Battery replaced."),
    past(3,"Air-conditioning","AC not cold",45,2,350,"AC compressor serviced and gas refilled."),
    past(4,"Routine service","Scheduled service",100,2,420,"Oil, filters and brake check."),
    past(5,"Brake repair","Brake noise",60,2,560,"Rear brake pads replaced."),
    past(6,"Oil change","Engine oil and filter",30,1,210,"Engine oil and oil filter changed."),
    past(7,"Tyre replacement","Tyres worn",150,2,1280,"Four new tyres fitted."),
    past(8,"Body repair","Rear bumper scratch",80,3,720,"Bumper repaired and repainted."),
    past(9,"Routine service","Scheduled service",25,2,980,"Full service and interior detailing."),
    past(10,"Oil change","Engine oil and filter",140,1,260,"Engine oil and oil filter changed.")
  ].map((m,i)=>Object.assign({id:"MT-"+(101+i)},m));
}
let MAINT=null;
try{MAINT=JSON.parse(localStorage.getItem(MKEY))}catch(e){}
if(!Array.isArray(MAINT))MAINT=seedMaint();
const saveMaint=()=>{try{localStorage.setItem(MKEY,JSON.stringify(MAINT))}catch(e){}};
saveMaint(); // first visit stores the sample records
/* Car status comes from the maintenance records and the bookings:
   an open maintenance record (In progress / Completed) = Maintenance, otherwise Rented or Available */
function applyMaint(){
  CARS.forEach(c=>{
    c.mrec=MAINT.find(m=>m.car===c.id&&m.stage!=="Closed")||null; // open record of this car (if any)
    c.maint=!!c.mrec;
    c.status=c.maint?"Maintenance":BOOKINGS.some(b=>b.car===c&&b.status==="Active")?"Rented":"Available";
  });
}
applyMaint();

/* Car photo fallback: if images/<model>.webp is missing, show the general car
   illustration (images/hero.svg) instead of a broken image.
   Works for every <img> on every page, so no other file needs editing. */
document.addEventListener("error",e=>{
  const t=e.target;
  if(!t||t.tagName!=="IMG"||t.dataset.fb)return;
  const m=/images\/([a-z0-9]+)\.webp/.exec(t.getAttribute("src")||"");
  const c=m&&CARS.find(x=>x.img===m[1]);
  if(c){t.dataset.fb="1";t.src="images/hero.svg"}
},true);
