/* DIVEORA - page logic for the Dashboard and Analytics pages (Cars, Customers, Articles and Settings have their own js files) */
if(PAGE!=="login"&&user){
const sum=a=>a.reduce((s,b)=>s+b.total,0);
const fmt=d=>d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const badge=s=>`<span class="badge st-${s.toLowerCase()}">${s}</span>`;
const M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const live=BOOKINGS.filter(b=>b.status!=="Cancelled");
const isDark=()=>root.getAttribute("data-bs-theme")==="dark";
const pal=()=>isDark()?["#d9788f","#a8405f","#f0c4d0","#c9973f","#fbd48a"]:["#5a1a2e","#a8405f","#d9a3b3","#c9973f","#fbd48a"];
const CH={};
/* Chart helper: redraws cleanly and follows light/dark theme */
function chart(id,type,labels,datasets,opts={}){
  Chart.defaults.color=isDark()?"#c4a8b3":"#6e6169";Chart.defaults.borderColor=isDark()?"#3d2530":"#e6dde1";Chart.defaults.font.family="'IBM Plex Sans',sans-serif";
  if(CH[id])CH[id].destroy();
  CH[id]=new Chart(document.getElementById(id),{type,data:{labels,datasets},options:Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}},opts)});
}
const revM=M.map((_,i)=>sum(live.filter(b=>b.start.getMonth()===i)));
const cntM=M.map((_,i)=>live.filter(b=>b.start.getMonth()===i).length);
const cnt=(arr,f,keys)=>keys.map(k=>arr.filter(x=>f(x)===k).length);
const dtc=(d,t)=>`<div>${fmt(d)}</div><small class="text-muted">${t}</small>`;
const kpiHTML=a=>a.map(k=>`<div class="col-6 col-xl-3"><div class="card kpi p-3 h-100"><div class="d-flex justify-content-between"><div><div class="small text-muted">${k[0]}</div><div class="v">${k[1]}</div></div><i class="bi ${k[2]}"></i></div></div></div>`).join("");
const row=b=>`<tr><td class="fw-semibold">${b.id}</td><td>${esc(b.customer)}</td><td>${b.car.name}</td><td>${dtc(b.start,b.pickT)}</td><td>${b.days}</td><td>${RM(b.total)}</td><td>${badge(b.status)}</td></tr>`;
const csvDownload=(rows,name)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([rows.map(x=>x.join(",")).join("\n")],{type:"text/csv"}));a.download=name;a.click();toast("CSV exported")};
const page={};

/* ================= DASHBOARD ================= */
page.dashboard=()=>{
  const g=greeting();
  const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  $("#today").textContent=`${DAYS[TODAY.getDay()]}, ${TODAY.getDate()} ${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`;
  $("#greet").textContent=`${g[0]}, ${NAME}`;
  $("#welcome").textContent="Here is your fleet overview.";
  const rented=CARS.filter(c=>c.status==="Rented").length,usable=CARS.filter(c=>!c.maint).length;
  const monthRev=sum(live.filter(b=>b.start.getMonth()===TODAY.getMonth()));
  $("#kpis").innerHTML=kpiHTML([["Total fleet",CARS.length,"bi-car-front-fill"],["Active rentals",BOOKINGS.filter(b=>b.status==="Active").length,"bi-key-fill"],["Revenue this month",RM(monthRev),"bi-cash-stack"],["Fleet utilisation",Math.round(rented/usable*100)+"%","bi-pie-chart-fill"]]);
  $("#tbRecent").innerHTML=BOOKINGS.filter(b=>b.start<=addD(TODAY,3)).slice(0,7).map(row).join("");
  const draw=()=>{const p=pal();
    chart("cRev","bar",M,[{label:"Revenue (RM)",data:revM,backgroundColor:p[1],borderRadius:6,yAxisID:"y"},{label:"Bookings",type:"line",data:cntM,borderColor:p[3],backgroundColor:p[3],tension:.4,yAxisID:"y1"}],{scales:{y:{beginAtZero:true},y1:{position:"right",beginAtZero:true,grid:{drawOnChartArea:false}}}});
    chart("cFleet","doughnut",["Available","Rented","Maintenance"],[{data:cnt(CARS,c=>c.status,["Available","Rented","Maintenance"]),backgroundColor:[p[1],p[3],p[2]],borderWidth:0}],{cutout:"62%"});
    chart("cType","pie",TYPES,[{data:TYPES.map(t=>live.filter(b=>b.car.type===t).length),backgroundColor:[p[0],p[1],p[3],p[4]],borderWidth:0}]);
    const top=CARS.map(c=>[c.name,live.filter(b=>b.car===c).length]).sort((a,b)=>b[1]-a[1]).slice(0,6);
    chart("cTop","bar",top.map(t=>t[0]),[{label:"Bookings",data:top.map(t=>t[1]),backgroundColor:p[3],borderRadius:6}],{indexAxis:"y",plugins:{legend:{display:false}}});
    chart("cWeek","radar",["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],[{label:"Pick-ups",data:[0,1,2,3,4,5,6].map(d=>live.filter(b=>b.start.getDay()===d).length),backgroundColor:"rgba(201,151,63,.3)",borderColor:p[3],pointBackgroundColor:p[3]}]);
    const st=["Completed","Active","Upcoming","Cancelled"];
    chart("cStatus","polarArea",st,[{data:cnt(BOOKINGS,b=>b.status,st),backgroundColor:[p[1]+"cc",p[3]+"cc",p[2]+"cc","#b4443ccc"],borderWidth:0}]);
  };draw();document.addEventListener("themechange",draw);
};

/* ================= ANALYTICS ================= */
page.analytics=()=>{
  const DEFS=[["cA1","Monthly revenue","Revenue (RM) earned each month","col-12 col-xl-8"],["cA3","Revenue by car type","Share of revenue","col-12 col-md-6 col-xl-4"],
   ["cA2","Cumulative revenue","Running total through the year","col-12 col-xl-8"],["cA5","Booking status","All bookings in the period","col-12 col-md-6 col-xl-4"],
   ["cA4","Revenue by model","Which cars earn the most","col-12 col-xl-8"],["cA6","Payment value","RM paid, pending and refunded","col-12 col-md-6 col-xl-4"],
   ["cA7","Pick-ups by weekday","Busiest days for collection","col-12 col-md-4"],["cA8","Rental length","Bookings by number of days","col-12 col-md-4"],["cA9","Pick-up time","Most popular collection time","col-12 col-md-4"],
   ["cA10","Top customers","Total spent (RM)","col-12 col-xl-6"],["cA11","New vs repeat","Customers by number of bookings","col-12 col-md-6 col-xl-3"],["cA12","Revenue by branch","Pick-up location","col-12 col-md-6 col-xl-3"],
   ["cA13","Price vs demand","Does a lower daily price bring more bookings?","col-12 col-xl-6"],["cA14","Days rented per model","Total rental days","col-12 col-xl-6"]];
  $("#chartGrid").innerHTML=DEFS.map(d=>`<div class="${d[3]}"><div class="card p-3 h-100"><div class="card-h">${d[1]}</div><div class="card-s">${d[2]}</div><div class="chart-box"><canvas id="${d[0]}"></canvas></div></div></div>`).join("");
  let per="year",MS=[];
  const from=()=>per==="30"?addD(TODAY,-30):per==="90"?addD(TODAY,-90):new Date(YEAR,0,1);
  const WD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const top=a=>a.indexOf(Math.max(...a));
  function draw(){
    const L=BOOKINGS.filter(b=>b.start>=from()),V=L.filter(b=>b.status!=="Cancelled"),p=pal();
    const rev=sum(V),days=V.reduce((s,b)=>s+b.days,0),pending=sum(L.filter(b=>b.pay==="Pending"));
    const cc={};V.forEach(b=>cc[b.customer]=(cc[b.customer]||0)+1);
    const names=Object.keys(cc),rep=names.filter(k=>cc[k]>1).length;
    const canc=L.length?Math.round(L.filter(b=>b.status==="Cancelled").length/L.length*100):0;
    $("#aNote").textContent=`${L.length} bookings since ${fmt(from())} (includes upcoming)`;
    $("#aKpis").innerHTML=kpiHTML([["Total revenue",RM(rev),"bi-cash-coin"],["Bookings",L.length,"bi-journal-check"],["Avg booking value",RM(V.length?Math.round(rev/V.length):0),"bi-receipt"],["Avg rental length",(V.length?(days/V.length).toFixed(1):0)+" days","bi-clock-history"],
      ["Cancellation rate",canc+"%","bi-x-octagon"],["Repeat customers",(names.length?Math.round(rep/names.length*100):0)+"%","bi-people-fill"],["Pending payments",RM(pending),"bi-hourglass-split"],["Days rented",days,"bi-calendar-range"]]);
    const revA=M.map((_,i)=>sum(V.filter(b=>b.start.getMonth()===i)));let run=0;const cum=revA.map(v=>run+=v);
    MS=CARS.map(c=>{const k=V.filter(b=>b.car===c);return{c,n:k.length,d:k.reduce((s,b)=>s+b.days,0),r:sum(k)}}).sort((a,b)=>b.r-a.r);
    const wd=[0,1,2,3,4,5,6].map(d=>V.filter(b=>b.start.getDay()===d).length);
    const slot=SLOTS.map(s=>V.filter(b=>b.pickT===s).length),br=BRANCHES.map(x=>sum(V.filter(b=>b.loc===x)));
    const cu=names.map(k=>{const z=V.filter(b=>b.customer===k),past=z.filter(b=>b.start<=TODAY).map(b=>b.start.getTime());
      return{k,n:z.length,d:z.reduce((s,b)=>s+b.days,0),r:sum(z),last:past.length?fmt(new Date(Math.max(...past))):"-"}}).sort((a,b)=>b.r-a.r);
    const cs=CARS.filter(c=>!c.maint),st=["Completed","Active","Upcoming","Cancelled"],pay=["Paid","Pending","Refunded"];
    chart("cA1","bar",M,[{label:"Revenue (RM)",data:revA,backgroundColor:p[1],borderRadius:6}],{plugins:{legend:{display:false}}});
    chart("cA2","line",M,[{label:"Cumulative (RM)",data:cum,borderColor:p[3],backgroundColor:"rgba(201,151,63,.2)",fill:true,tension:.35}],{plugins:{legend:{display:false}}});
    chart("cA3","doughnut",TYPES,[{data:TYPES.map(t=>sum(V.filter(b=>b.car.type===t))),backgroundColor:[p[0],p[1],p[3],p[4]],borderWidth:0}],{cutout:"58%"});
    chart("cA4","bar",MS.map(m=>m.c.name),[{label:"Revenue (RM)",data:MS.map(m=>m.r),backgroundColor:p[3],borderRadius:5}],{indexAxis:"y",plugins:{legend:{display:false}}});
    chart("cA5","doughnut",st,[{data:cnt(L,b=>b.status,st),backgroundColor:[p[1],p[3],p[2],"#b4443c"],borderWidth:0}],{cutout:"58%"});
    chart("cA6","doughnut",pay,[{data:pay.map(y=>sum(L.filter(b=>b.pay===y))),backgroundColor:[p[1],p[3],p[2]],borderWidth:0}],{cutout:"58%"});
    chart("cA7","bar",WD.map(d=>d.slice(0,3)),[{label:"Pick-ups",data:wd,backgroundColor:p[1],borderRadius:6}],{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}});
    chart("cA8","bar",[1,2,3,4,5,6,7].map(d=>d+"d"),[{label:"Bookings",data:[1,2,3,4,5,6,7].map(d=>V.filter(b=>b.days===d).length),backgroundColor:p[3],borderRadius:6}],{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}});
    chart("cA9","bar",SLOTS.map(s=>s.replace(":00 "," ")),[{label:"Pick-ups",data:slot,backgroundColor:p[1],borderRadius:6}],{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0}}}});
    chart("cA10","bar",cu.slice(0,8).map(c=>c.k),[{label:"Spent (RM)",data:cu.slice(0,8).map(c=>c.r),backgroundColor:p[1],borderRadius:5}],{indexAxis:"y",plugins:{legend:{display:false}}});
    chart("cA11","doughnut",["One-time","Repeat"],[{data:[names.length-rep,rep],backgroundColor:[p[2],p[3]],borderWidth:0}],{cutout:"58%"});
    chart("cA12","polarArea",BRANCHES,[{data:br,backgroundColor:[p[1]+"cc",p[3]+"cc",p[2]+"cc",p[4]+"cc"],borderWidth:0}]);
    chart("cA13","scatter",[],[{label:"Models",data:cs.map(c=>({x:c.price,y:V.filter(b=>b.car===c).length})),backgroundColor:p[3],pointRadius:7,pointHoverRadius:9}],
      {plugins:{legend:{display:false},tooltip:{callbacks:{label:t=>`${cs[t.dataIndex].name}: RM ${t.parsed.x}/day, ${t.parsed.y} bookings`}}},scales:{x:{title:{display:true,text:"Price per day (RM)"}},y:{title:{display:true,text:"Bookings"},beginAtZero:true,ticks:{precision:0}}}});
    chart("cA14","bar",MS.map(m=>m.c.name),[{label:"Days rented",data:MS.map(m=>m.d),backgroundColor:p[1],borderRadius:5}],{plugins:{legend:{display:false}},scales:{x:{ticks:{maxRotation:60}}}});
    $("#tbModels").innerHTML=MS.map((m,i)=>`<tr><td>${i+1}</td><td class="fw-semibold">${m.c.name}</td><td>${m.c.type}</td><td>${m.n}</td><td>${m.d}</td><td>${RM(m.r)}</td><td>${m.n?RM(Math.round(m.r/m.n)):"-"}</td></tr>`).join("");
    $("#tbCust").innerHTML=cu.slice(0,10).map((c,i)=>`<tr><td>${i+1}</td><td class="fw-semibold">${esc(c.k)}</td><td>${c.n}</td><td>${c.d}</td><td>${RM(c.r)}</td><td>${c.last}</td></tr>`).join("")||'<tr><td colspan="6" class="text-center text-muted">No data in this period.</td></tr>';
    const ins=[["bi-trophy-fill",`Best month: <b>${M[top(revA)]}</b> (${RM(Math.max(...revA))})`],["bi-car-front-fill",`Top earning model: <b>${MS[0].c.name}</b> (${RM(MS[0].r)})`],["bi-calendar-week",`Busiest pick-up day: <b>${WD[top(wd)]}</b>`],
      ["bi-clock-fill",`Most popular pick-up time: <b>${SLOTS[top(slot)]}</b>`],["bi-geo-alt-fill",`Top branch: <b>${BRANCHES[top(br)]}</b> (${RM(Math.max(...br))})`],["bi-graph-up-arrow",`Average rate booked: <b>${RM(days?Math.round(rev/days):0)}/day</b>`]];
    $("#insights").innerHTML=ins.map(i=>`<div class="col-12 col-md-6 col-xl-4 insight d-flex gap-2"><i class="bi ${i[0]}"></i><span>${i[1]}</span></div>`).join("");
  }
  $("#period").addEventListener("click",e=>{const b=e.target.closest("[data-p]");if(!b)return;per=b.dataset.p;document.querySelectorAll("#period .btn").forEach(x=>x.classList.toggle("active",x===b));draw()});
  $("#csvA").onclick=()=>csvDownload([["Rank","Model","Type","Bookings","Days rented","Revenue"],...MS.map((m,i)=>[i+1,m.c.name,m.c.type,m.n,m.d,m.r])],"diveora-analytics.csv");
  draw();document.addEventListener("themechange",draw);
};
page[PAGE]&&page[PAGE]();
}
