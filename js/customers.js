/* DIVEORA - Customers page: table / card view, pagination, refresh, edit, delete, charts and booking calendar */
if(PAGE==="customers"&&user){

/* ---------- Helpers ---------- */
const sum=a=>a.reduce((s,b)=>s+b.total,0);
const fmt=d=>d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const badge=s=>`<span class="badge st-${s.toLowerCase()}">${s}</span>`;
const dtc=(d,t)=>`<div>${fmt(d)}</div><small class="text-muted">${t}</small>`;
const cnt=(arr,f,keys)=>keys.map(k=>arr.filter(x=>f(x)===k).length);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let live=BOOKINGS.filter(b=>b.status!=="Cancelled");const refreshLive=()=>{live=BOOKINGS.filter(b=>b.status!=="Cancelled")}; // live = bookings that are not cancelled
const csvDownload=(rows,name)=>{const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n")],{type:"text/csv"}));
  a.download=name;a.click();toast("CSV exported")};
const isDark=()=>root.getAttribute("data-bs-theme")==="dark";
const pal=()=>isDark()?["#d9788f","#a8405f","#f0c4d0","#c9973f","#fbd48a"]:["#5a1a2e","#a8405f","#d9a3b3","#c9973f","#fbd48a"];
const CH={};
/* Chart helper: redraws cleanly and follows light/dark theme */
function chart(id,type,labels,datasets,opts={}){
  Chart.defaults.color=isDark()?"#c4a8b3":"#6e6169";Chart.defaults.borderColor=isDark()?"#3d2530":"#e6dde1";Chart.defaults.font.family="'IBM Plex Sans',sans-serif";
  if(CH[id])CH[id].destroy();
  CH[id]=new Chart(document.getElementById(id),{type,data:{labels,datasets},options:Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}},opts)});
}

/* ---------- 1. Customer records (built from the bookings, minus deleted customers) ---------- */
const AV=["#5a1a2e","#7a2640","#a8405f","#8a5a2a","#6d4a7a"]; // avatar colours
const initialsOf=n=>n.trim().split(/\s+/).map(w=>w[0]).join("").slice(0,2).toUpperCase();
const avatar=(c,size="")=>`<span class="avatar ${size}" style="background:${AV[c.name.length%AV.length]}" aria-hidden="true">${initialsOf(c.name)}</span>`;
const PER=6;                       // customers per page
let CUST=[],view="table",pg=1;
const build=()=>{
  CUST=NAMES.filter(n=>!CUSTX.del.includes(n)).map(n=>{
    const all=BOOKINGS.filter(b=>b.cid===n);                 // newest first
    if(!all.length)return null;
    const ok=all.filter(b=>b.status!=="Cancelled"),past=ok.filter(b=>b.start<=TODAY),count={};
    ok.forEach(b=>count[b.car.name]=(count[b.car.name]||0)+1);
    const fav=Object.keys(count).sort((a,b)=>count[b]-count[a])[0]||"-";     // most booked car
    const status=all.some(b=>b.status==="Active")?"Active":all.some(b=>b.status==="Upcoming")?"Upcoming":"Past";
    return{id:n,name:all[0].customer,phone:all[0].phone,email:all[0].email,loc:all[0].loc,all,n:all.length,spent:sum(ok),
      last:past.length?past[0].start:null,fav,status};
  }).filter(Boolean);
};

/* ---------- 2. Search, filter, sort and pagination ---------- */
const filt=()=>{const q=$("#q").value.toLowerCase(),s=$("#fStatus").value;
  const by={name:(a,b)=>a.name.localeCompare(b.name),spent:(a,b)=>b.spent-a.spent,count:(a,b)=>b.n-a.n,recent:(a,b)=>(b.last||0)-(a.last||0)};
  return CUST.filter(c=>(c.name+" "+c.phone+" "+c.email+" "+c.fav).toLowerCase().includes(q)&&(!s||c.status===s)).sort(by[$("#sort").value]);
};
/* Action buttons (View, Edit, Delete) used in both views */
const acts=c=>`<button class="btn btn-brand btn-sm" data-a="view" data-c="${c.id}"><i class="bi bi-eye me-1"></i>View</button> <button class="btn btn-outline-secondary btn-sm" data-a="edit" data-c="${c.id}"><i class="bi bi-pencil me-1"></i>Edit</button> <button class="btn btn-outline-danger btn-sm" data-a="del" data-c="${c.id}" aria-label="Delete ${esc(c.name)}"><i class="bi bi-trash3"></i></button>`;
const trow=c=>`<tr><td><div class="d-flex align-items-center gap-2">${avatar(c)}<div><div class="fw-semibold">${esc(c.name)}</div><small class="text-muted">${c.loc}</small></div></div></td><td class="d-none d-lg-table-cell">${esc(c.phone)}</td><td class="d-none d-xl-table-cell">${esc(c.email)}</td><td>${c.n}</td><td>${RM(c.spent)}</td><td class="d-none d-md-table-cell">${c.last?fmt(c.last):"-"}</td><td>${badge(c.status)}</td><td class="text-nowrap">${acts(c)}</td></tr>`;
const card=c=>`<div class="col-12 col-md-6 col-xl-4"><div class="card cu-card p-3 h-100"><div class="d-flex align-items-center gap-3 mb-3">${avatar(c,"avatar-lg")}<div><h3 class="h6 mb-1">${esc(c.name)}</h3>${badge(c.status)}</div></div>
  <div class="small text-muted mb-1"><i class="bi bi-telephone me-2"></i>${esc(c.phone)}</div><div class="small text-muted mb-3 text-truncate"><i class="bi bi-envelope me-2"></i>${esc(c.email)}</div>
  <div class="row g-2 text-center mb-3"><div class="col-6"><div class="cu-stat"><div class="small text-muted">Bookings</div><b>${c.n}</b></div></div><div class="col-6"><div class="cu-stat"><div class="small text-muted">Spent</div><b>${RM(c.spent)}</b></div></div></div>
  <div class="small text-muted mb-3"><i class="bi bi-car-front me-2"></i>Favourite: ${c.fav}</div>
  <div class="d-flex gap-2 mt-auto">${acts(c)}</div></div></div>`;
/* Pager: Previous, 1 2 3 ..., Next (the current page is highlighted) */
const pager=pages=>{const it=[];
  const add=(label,p,dis,act)=>it.push(`<li class="page-item${dis?" disabled":""}${act?" active":""}"><button class="page-link" data-p="${p}"${act?' aria-current="page"':""}${dis?" disabled":""}>${label}</button></li>`);
  add("Previous",pg-1,pg<=1);
  const list=pages<=7?Array.from({length:pages},(_,i)=>i+1):[...new Set([1,pg-1,pg,pg+1,pages].filter(p=>p>=1&&p<=pages))].sort((a,b)=>a-b);
  let prev=0;list.forEach(p=>{if(p-prev>1)it.push('<li class="page-item disabled"><span class="page-link">...</span></li>');add(p,p,false,p===pg);prev=p});
  add("Next",pg+1,pg>=pages);
  $("#pg").innerHTML=it.join("");
};
const show=()=>{const l=filt(),pages=Math.max(1,Math.ceil(l.length/PER));pg=Math.min(Math.max(pg,1),pages);
  const rows=l.slice((pg-1)*PER,pg*PER),from=l.length?(pg-1)*PER+1:0;
  $("#count").textContent=l.length+" of "+CUST.length+" customers";
  $("#pgInfo").textContent=`Showing ${from}-${from+rows.length-(l.length?1:0)} of ${l.length} customers`;
  $("#tb").innerHTML=rows.map(trow).join("")||'<tr><td colspan="8" class="text-center text-muted py-4">No customers found.</td></tr>';
  $("#cardGrid").innerHTML=rows.length?rows.map(card).join(""):'<p class="col-12 text-center text-muted py-5">No customers found. Clear the search or change the filter.</p>';
  $("#tableView").classList.toggle("d-none",view!=="table");
  $("#cardView").classList.toggle("d-none",view!=="cards");
  document.querySelectorAll("#viewSwitch .btn").forEach(b=>{const on=b.dataset.v===view;b.classList.toggle("active",on);b.setAttribute("aria-pressed",on)});
  pager(pages);
};
["q","fStatus","sort"].forEach(i=>$("#"+i).addEventListener("input",()=>{pg=1;show()}));
$("#viewSwitch").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(b){view=b.dataset.v;show()}});
$("#pg").addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(b&&!b.disabled){pg=+b.dataset.p;show()}});
$("#csv").onclick=()=>csvDownload([["Customer","Phone","Email","Bookings","Total spent","Last pick-up","Status","Favourite car"],...filt().map(c=>[c.name,c.phone,c.email,c.n,c.spent,c.last?fmt(c.last):"-",c.status,c.fav])],"diveora-customers.csv");

/* ---------- 3. Refresh: reset filters, go to page 1, reload data, charts and calendar ---------- */
const reload=()=>{ // read the saved customer changes again (for example after Settings > Reset saved data)
  try{const s=JSON.parse(localStorage.getItem(CKEY));CUSTX=s&&s.edit&&Array.isArray(s.del)?s:{edit:{},del:[]}}catch(e){CUSTX={edit:{},del:[]}}
  applyCust();
};
$("#refresh").onclick=()=>{reload();refreshLive();$("#q").value="";$("#fStatus").value="";$("#sort").value="name";pg=1;
  build();show();drawCharts();calDraw();toast("Customers refreshed")};

/* ---------- 4. View, Edit and Delete buttons (table and cards) ---------- */
const modalOf=id=>bootstrap.Modal.getOrCreateInstance($(id));
const onAct=e=>{const b=e.target.closest("[data-a]");if(!b)return;
  const c=CUST.find(x=>x.id===b.dataset.c);if(c)({view:detail,edit:openEdit,del:openDel})[b.dataset.a](c)};
$("#tb").addEventListener("click",onAct);$("#cardGrid").addEventListener("click",onAct);
let sel=null; // customer being edited or deleted

/* View: details and booking history (with payment method, receipt and "Receive payment") */
let curId=null; // customer shown in the View popup
const payCell=b=>badge(b.pay)+(b.method?`<div class="small text-muted">${esc(b.method)}</div>`:"");
const rcCell=b=>b.pay==="Paid"?`<button class="btn btn-outline-secondary btn-sm text-nowrap" data-rc="${b.id}"><i class="bi bi-receipt me-1"></i>Receipt</button>`
  :b.pay==="Pending"?`<button class="btn btn-gold btn-sm text-nowrap" data-pay="${b.id}"><i class="bi bi-cash-coin me-1"></i>Receive payment</button>`:'<span class="text-muted">-</span>';
function detail(c){curId=c.id;
  $("#cuTitle").textContent=c.name;
  $("#cuBody").innerHTML=`<div class="d-flex align-items-center gap-3 mb-3">${avatar(c,"avatar-lg")}<div><div class="fw-bold fs-5">${esc(c.name)}</div><div class="small text-muted"><i class="bi bi-telephone me-1"></i>${esc(c.phone)}</div><div class="small text-muted"><i class="bi bi-envelope me-1"></i>${esc(c.email)}</div></div></div>
  <div class="row g-2 text-center mb-3"><div class="col-4"><div class="cu-stat"><div class="small text-muted">Bookings</div><b>${c.n}</b></div></div><div class="col-4"><div class="cu-stat"><div class="small text-muted">Total spent</div><b>${RM(c.spent)}</b></div></div><div class="col-4"><div class="cu-stat"><div class="small text-muted mb-1">Status</div>${badge(c.status)}</div></div></div>
  <h3 class="h6">Booking history</h3><div class="table-responsive"><table class="table table-sm align-middle mb-0"><thead><tr><th>ID</th><th>Car</th><th>Pick-up</th><th>Return</th><th>Total</th><th>Status</th><th>Payment</th><th>Receipt</th></tr></thead><tbody>${c.all.map(b=>`<tr><td class="fw-semibold">${b.id}</td><td>${b.car.name}</td><td>${dtc(b.start,b.pickT)}</td><td>${dtc(b.ret,b.retT)}</td><td>${RM(b.total)}</td><td>${badge(b.status)}</td><td>${payCell(b)}</td><td>${rcCell(b)}</td></tr>`).join("")}</tbody></table></div>
  <div id="payBox"></div>`;
  modalOf("#cuModal").show();
}
/* Receive payment: the admin chooses how the customer paid, then the booking becomes Paid */
function openPay(b){
  $("#payBox").innerHTML=`<div class="pay-box mt-3 p-3"><div class="fw-semibold mb-2"><i class="bi bi-cash-coin me-1"></i>Receive payment for ${b.id} (${RM(b.total)})</div>
    <div id="pErr" class="alert alert-danger small py-2 d-none" role="alert">Please select a payment method.</div>
    <div class="row g-2 align-items-end"><div class="col-12 col-md-7"><label class="form-label small mb-1" for="pMethod">Payment method</label><select id="pMethod" class="form-select" data-b="${b.id}">${methodOpts()}</select></div>
    <div class="col-12 col-md-5 d-flex gap-2"><button id="payOk" class="btn btn-gold flex-fill">Confirm payment</button><button id="payCancel" class="btn btn-outline-secondary">Cancel</button></div></div></div>`;
  $("#payBox").scrollIntoView({block:"nearest",behavior:"smooth"});
}
function confirmPay(){
  const sel=$("#pMethod"),m=sel.value,b=BOOKINGS.find(x=>x.id===sel.dataset.b);
  if(!m){$("#pErr").classList.remove("d-none");return}
  setPaid(b,m);build();show();drawCharts();drawNotes();
  const c=CUST.find(x=>x.id===curId);if(c)detail(c);
  toast("Payment received for "+b.id+". You can print the receipt now.");
}
$("#cuBody").addEventListener("click",e=>{
  const r=e.target.closest("[data-rc]"),p=e.target.closest("[data-pay]");
  if(r)openReceipt(BOOKINGS.find(x=>x.id===r.dataset.rc));
  else if(p)openPay(BOOKINGS.find(x=>x.id===p.dataset.pay));
  else if(e.target.closest("#payCancel"))$("#payBox").innerHTML="";
  else if(e.target.closest("#payOk"))confirmPay();
});

/* ---------- Payment receipt: shown in a popup and printed with the Print button ---------- */
const methodOpts=(sel="")=>'<option value="">Select payment method</option>'+PMETHODS.map(m=>`<option${m===sel?" selected":""}>${esc(m)}</option>`).join("");
function receiptHTML(b){
  const rcNo="RC-"+numOf(b.id);
  return `<div class="rc-paper" id="rcPaper">
    <div class="rc-head"><img src="images/logo.svg" width="46" height="46" alt=""><div><div class="rc-brand">DIVEORA</div><div class="rc-sub">Car Rental &middot; Tanjung Malim, Perak<br>+60 12-345 6789 &middot; hello@diveora.my</div></div><div class="rc-title">RECEIPT<small>${rcNo}</small></div></div>
    <div class="rc-grid">
      <div><div class="rc-lbl">Received from</div><div class="fw-semibold">${esc(b.customer)}</div><div>${esc(b.phone)}</div><div>${esc(b.email)}</div></div>
      <div><div class="rc-lbl">Receipt details</div><div>Booking ID: <b>${b.id}</b></div><div>Payment date: <b>${b.paidOn?fmt(b.paidOn):"-"}</b></div><div>Payment method: <b>${esc(b.method||"-")}</b></div></div>
    </div>
    <table class="rc-table"><thead><tr><th>Description</th><th class="text-end">Rate / day</th><th class="text-end">Days</th><th class="text-end">Amount</th></tr></thead>
      <tbody><tr><td><b>${b.car.name}</b> (${esc(b.car.plate)}) car rental<div class="rc-note">Pick-up: ${fmt(b.start)}, ${b.pickT}<br>Return: ${fmt(b.ret)}, ${b.retT}<br>Branch: ${b.loc}</div></td><td class="text-end">${RM(b.car.price)}</td><td class="text-end">${b.days}</td><td class="text-end">${RM(b.total)}</td></tr></tbody></table>
    <div class="text-center"><span class="rc-stamp">PAID</span></div>
    <div class="rc-total"><span>TOTAL PAID</span><b>${RM(b.total)}</b></div>
    <div class="rc-foot">Thank you for choosing DIVEORA. Please keep this receipt for your records.<br>Issued by ${esc(SET.name)} on ${fmt(TODAY)}. This receipt is computer generated and needs no signature. (Prototype: no real payment.)</div></div>`;
}
let rcId=null;
function openReceipt(b){rcId=b.id;
  $("#rcBody").innerHTML=receiptHTML(b);
  $("#cuModal").addEventListener("hidden.bs.modal",()=>modalOf("#rcModal").show(),{once:true}); // wait until the first popup has closed
  modalOf("#cuModal").hide();
}
$("#rcBack").onclick=()=>{ // back to the customer's booking history
  $("#rcModal").addEventListener("hidden.bs.modal",()=>{const c=CUST.find(x=>x.id===curId);if(c)detail(c)},{once:true});
  modalOf("#rcModal").hide();
};
$("#rcPrint").onclick=()=>{document.body.classList.add("print-rc");window.print()}; // print CSS shows only the receipt
window.addEventListener("afterprint",()=>document.body.classList.remove("print-rc"));

/* Edit: name, phone and e-mail (with validation) */
function openEdit(c){sel=c;
  $("#eTitle").textContent="Edit customer: "+c.name;
  $("#eName").value=c.name;$("#ePhone").value=c.phone;$("#eEmail").value=c.email;$("#eErr").classList.add("d-none");
  modalOf("#cuEdit").show();
}
function saveEdit(){
  const name=$("#eName").value.trim().replace(/\s+/g," "),phone=$("#ePhone").value.trim(),email=$("#eEmail").value.trim();
  const err=name.length<2?"Please enter the customer's full name (at least 2 characters)."
    :/[<>"&]/.test(name)?"The name cannot contain the characters < > \" &."
    :CUST.some(x=>x.id!==sel.id&&x.name.toLowerCase()===name.toLowerCase())?"Another customer already uses this name."
    :!/^01\d-?\d{7,8}$/.test(phone)?"Enter a valid Malaysian mobile number, for example 012-3456789."
    :!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?"Enter a valid email address, for example name@mail.com.":"";
  if(err){const e=$("#eErr");e.textContent=err;e.classList.remove("d-none");return}
  CUSTX.edit[sel.id]={name,phone,email};saveCust();applyCust();
  build();show();drawCharts();calDraw();
  modalOf("#cuEdit").hide();toast("Customer details updated");
}
$("#eSave").onclick=saveEdit;
["eName","ePhone","eEmail"].forEach(i=>$("#"+i).addEventListener("keydown",e=>{if(e.key==="Enter")saveEdit()}));

/* Delete: asks for confirmation. A customer with an Active or Upcoming booking cannot be deleted. */
function openDel(c){sel=c;
  const busy=c.all.filter(b=>b.status==="Active"||b.status==="Upcoming");
  $("#dTitle").textContent="Delete customer: "+c.name;
  $("#dBody").innerHTML=busy.length
    ?`<p class="mb-2"><b>${esc(c.name)}</b> cannot be deleted because of ${busy.length===1?"an unfinished booking":busy.length+" unfinished bookings"}: <b>${busy.map(b=>b.id).join(", ")}</b>.</p><p class="text-muted mb-0">A customer can be deleted only after all of their bookings are finished.</p>`
    :`<p class="mb-2">Delete <b>${esc(c.name)}</b> from the customer list?</p><p class="text-muted mb-0">Their ${c.n} booking${c.n>1?"s":""} stay in the booking records, so revenue and analytics do not change.</p>`;
  $("#dOk").classList.toggle("d-none",busy.length>0);
  $("#dCancel").textContent=busy.length?"Close":"Cancel";
  modalOf("#cuDel").show();
}
$("#dOk").onclick=()=>{
  if(!CUSTX.del.includes(sel.id))CUSTX.del.push(sel.id);
  saveCust();build();show();drawCharts();
  modalOf("#cuDel").hide();toast(sel.name+" deleted");
};

/* ---------- 5. Customer charts ---------- */
const drawCharts=()=>{const p=pal(),pay=["Paid","Pending","Refunded"];
  chart("cPay","doughnut",pay,[{data:cnt(BOOKINGS,b=>b.pay,pay),backgroundColor:[p[1],p[3],p[2]],borderWidth:0}],{cutout:"60%"});
  const cu=CUST.map(c=>[c.name,c.spent]).sort((a,b)=>b[1]-a[1]).slice(0,6);
  chart("cCust","bar",cu.map(c=>c[0]),[{label:"Spent (RM)",data:cu.map(c=>c[1]),backgroundColor:p[3],borderRadius:6}],{indexAxis:"y",plugins:{legend:{display:false}}});
  chart("cDays","bar",["1","2","3","4","5","6","7"].map(d=>d+" day"),[{label:"Bookings",data:[1,2,3,4,5,6,7].map(d=>live.filter(b=>b.days===d).length),backgroundColor:p[1],borderRadius:6}],{plugins:{legend:{display:false}}});
};

/* ---------- 6. Booking calendar ---------- */
let cm=new Date(TODAY.getFullYear(),TODAY.getMonth(),1),day=new Date(TODAY);
const same=(a,b)=>a.toDateString()===b.toDateString();
const onDay=d=>live.filter(b=>d>=b.start&&d<=b.end);
function calDraw(){const y=cm.getFullYear(),m=cm.getMonth(),dim=new Date(y,m+1,0).getDate();
  $("#calTitle").textContent=cm.toLocaleString("en-GB",{month:"long",year:"numeric"});
  let h="";for(let i=0;i<cm.getDay();i++)h+='<div class="cal-cell empty"></div>';
  for(let d=1;d<=dim;d++){const dt=new Date(y,m,d),n=onDay(dt).length;h+=`<button class="cal-cell ${same(dt,TODAY)?"today":""} ${same(dt,day)?"sel":""}" data-d="${d}" aria-label="${d} ${n} rentals">${d}${n?`<span class="cal-n">${n}</span>`:""}</button>`}
  $("#calGrid").innerHTML=h;
  $("#calGrid").querySelectorAll("button").forEach(b=>b.onclick=()=>{day=new Date(y,m,+b.dataset.d);calDraw()});
  const l=onDay(day);$("#dayTitle").textContent=day.toDateString();
  $("#dayList").innerHTML=l.length?l.map(b=>`<div class="d-flex justify-content-between border-bottom py-2"><div><b>${esc(b.customer)}</b><div class="small text-muted">${b.car.name} &middot; ${b.id}</div></div>${badge(b.status)}</div>`).join(""):'<p class="text-muted mb-0">No rentals on this day.</p>';
  calChart(y,m,dim);
}
function calChart(y,m,dim){const p=pal(),days=Array.from({length:dim},(_,i)=>i+1);
  chart("cCal","bar",days,[{label:"Cars on rent",data:days.map(d=>onDay(new Date(y,m,d)).length),backgroundColor:days.map(d=>d===day.getDate()&&m===day.getMonth()?p[3]:p[1]),borderRadius:4}],{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}});}
$("#prevM").onclick=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()-1,1);calDraw()};
$("#nextM").onclick=()=>{cm=new Date(cm.getFullYear(),cm.getMonth()+1,1);calDraw()};
$("#todayM").onclick=()=>{cm=new Date(TODAY.getFullYear(),TODAY.getMonth(),1);day=new Date(TODAY);calDraw()};

/* ---------- 7. Add booking (new or existing customer) ---------- */
const bV=i=>$("#"+i).value;
const bErr=m=>{const e=$("#bErr");e.textContent=m;e.classList.remove("d-none");e.scrollIntoView({block:"nearest"})};
/* Existing customer chosen: fill and lock the details (use Edit to change them). New customer: empty fields. */
const bLock=()=>{const c=CUST.find(x=>x.id===bV("bCust"));
  ["bName","bPhone","bEmail"].forEach(i=>$("#"+i).disabled=!!c);
  $("#bName").value=c?c.name:"";$("#bPhone").value=c?c.phone:"";$("#bEmail").value=c?c.email:""};
/* Total = price per day x number of days (return date minus pick-up date) */
const bSum=()=>{const car=CARS[+bV("bCar")],p=bV("bPick"),r=bV("bRet");let h="";
  if(car&&p&&r){const d=Math.round((fromISO(r)-fromISO(p))/DAY);
    h=d>0?`<i class="bi bi-calculator me-2"></i><b>${d} day${d>1?"s":""}</b> &times; ${RM(car.price)} = <b>${RM(car.price*d)}</b>`:'<span class="text-danger">The return date must be after the pick-up date.</span>'}
  $("#bSum").innerHTML=h||"Choose a car and the dates to see the total."};
const bPayToggle=()=>{const paid=bV("bPayStat")==="Paid",m=$("#bMethod");m.disabled=!paid;if(!paid)m.value=""};
function openAdd(){
  $("#bCust").innerHTML='<option value="">+ New customer</option>'+CUST.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  $("#bCar").innerHTML=CARS.filter(c=>!c.maint).map(c=>`<option value="${c.id}">${c.name} - ${RM(c.price)}/day (${c.type})</option>`).join("");
  $("#bLoc").innerHTML=BRANCHES.map(x=>`<option>${x}</option>`).join("");
  $("#bPickT").innerHTML=$("#bRetT").innerHTML=SLOTS.map(x=>`<option>${x}</option>`).join("");
  $("#bPickT").value=$("#bRetT").value=SLOTS[1];
  $("#bPick").min=toISO(TODAY);$("#bPick").value=toISO(TODAY);
  $("#bRet").min=toISO(addD(TODAY,1));$("#bRet").value=toISO(addD(TODAY,1));
  $("#bPayStat").value="Paid";$("#bMethod").innerHTML=methodOpts();
  $("#bErr").classList.add("d-none");
  bLock();bPayToggle();bSum();modalOf("#bkModal").show();
}
$("#addBk").onclick=openAdd;
$("#bCust").addEventListener("change",bLock);
["bCar","bRet"].forEach(i=>$("#"+i).addEventListener("input",bSum));
$("#bPick").addEventListener("input",()=>{ // the return date can never be before the pick-up date
  const p=bV("bPick");if(!p)return;const min=toISO(addD(fromISO(p),1));$("#bRet").min=min;if(!bV("bRet")||bV("bRet")<min)$("#bRet").value=min;bSum()});
$("#bPayStat").addEventListener("change",bPayToggle);

function saveBooking(){
  const ex=CUST.find(x=>x.id===bV("bCust")),car=CARS[+bV("bCar")];
  const name=bV("bName").trim().replace(/\s+/g," "),phone=bV("bPhone").trim(),email=bV("bEmail").trim();
  const pick=bV("bPick")?fromISO(bV("bPick")):null,ret=bV("bRet")?fromISO(bV("bRet")):null;
  const pay=bV("bPayStat"),method=pay==="Paid"?bV("bMethod"):"";
  let err="";
  if(!ex){ // new customer: check the details
    err=name.length<2?"Please enter the customer's full name (at least 2 characters)."
      :/[<>"&]/.test(name)?'The name cannot contain the characters < > " &.'
      :NAMES.some(n=>n.toLowerCase()===name.toLowerCase())?"A customer with this name already exists. Choose the name from the Customer list instead."
      :!/^01\d-?\d{7,8}$/.test(phone)?"Enter a valid Malaysian mobile number, for example 012-3456789."
      :!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?"Enter a valid email address, for example name@mail.com.":"";
  }
  if(!err){
    if(!car)err="Please choose a car.";
    else if(!pick||!ret)err="Please choose the pick-up and return dates.";
    else if(pick<TODAY)err="The pick-up date cannot be in the past.";
    else if(ret<=pick)err="The return date must be after the pick-up date.";
    else if(Math.round((ret-pick)/DAY)>30)err="The longest rental is 30 days.";
    else{ // the same car cannot be booked twice for the same days
      const last=addD(ret,-1),clash=BOOKINGS.find(b=>b.car===car&&b.status!=="Cancelled"&&b.start<=last&&b.end>=pick);
      if(clash)err=`${car.name} is already booked from ${fmt(clash.start)} to ${fmt(clash.end)} (${clash.id}). Choose other dates or another car.`;
      else if(pay==="Paid"&&!method)err="Please select the payment method.";
    }
  }
  if(err){bErr(err);return}
  const days=Math.round((ret-pick)/DAY);
  const id="BK-"+(Math.max(...BOOKINGS.map(b=>numOf(b.id)))+1);
  const cid=ex?ex.id:name;
  const base=BOOKINGS.find(b=>b.cid===cid);                        // an existing customer keeps the original details
  const orig=base?base.orig:{name,phone,email};
  CUSTX.del=CUSTX.del.filter(n=>n!==cid);saveCust();               // never hide the customer who just got a booking
  const b=addBooking({id,cid,orig,plate:car.plate,start:toISO(pick),days,total:car.price*days,pickT:bV("bPickT"),retT:bV("bRetT"),loc:bV("bLoc"),pay,method,paidOn:pay==="Paid"?toISO(TODAY):null});
  refreshLive();build();show();drawCharts();calDraw();
  modalOf("#bkModal").hide();
  toast(`Booking ${id} added for ${b.customer}`);
  pushNote(`New booking ${id} for ${car.name}`,"bi-calendar-plus-fill",`${b.customer} booked the ${car.name} for ${days} day${days>1?"s":""} (${RM(b.total)}). Pick-up is on ${fmt(pick)} at ${b.pickT} at the ${b.loc} branch. Payment: ${pay==="Paid"?"paid by "+method:"pending"}.`);
}
$("#bSave").onclick=saveBooking;

/* ---------- Start ---------- */
build();show();drawCharts();calDraw();
document.addEventListener("themechange",()=>{drawCharts();calDraw()});
}
