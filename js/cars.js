/* DIVEORA - Cars page: fleet grid, filters, vehicle maintenance workflow, maintenance log and charts.
   Maintenance flow: Set Maintenance -> Update Details -> Complete Maintenance -> Set Available.
   History: View Maintenance History (per car) and the Maintenance log (all cars). */
if(PAGE==="cars"&&user){

/* ---------- Helpers ---------- */
const carImg=c=>c.src||"images/"+c.img+".webp"; // uploaded photo (if any) or the WebP photo of the model
const sum=a=>a.reduce((s,b)=>s+b.total,0);
const live=BOOKINGS.filter(b=>b.status!=="Cancelled");
const badge=s=>`<span class="badge st-${s.toLowerCase()}">${s}</span>`;
const STAGE={"In progress":"progress","Completed":"mdone","Closed":"closed"};
const stageBadge=s=>`<span class="badge st-${STAGE[s]}">${s}</span>`;
const fmt=d=>d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const fmtI=s=>s?fmt(fromISO(s)):"-";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const nl=s=>esc(s).replace(/\n/g,"<br>");
const kpiHTML=a=>a.map(k=>`<div class="col-6 col-xl-3"><div class="card kpi p-3 h-100"><div class="d-flex justify-content-between"><div><div class="small text-muted">${k[0]}</div><div class="v">${k[1]}</div></div><i class="bi ${k[2]}"></i></div></div></div>`).join("");
const period=m=>`${fmtI(m.start)} - ${fmtI(m.stage==="In progress"?m.end:(m.done||m.end))}`;
const upcoming=c=>BOOKINGS.filter(b=>b.car===c&&b.status==="Upcoming");
const lastDone=c=>MAINT.filter(m=>m.car===c.id&&m.stage==="Closed").sort((a,b)=>b.closed.localeCompare(a.closed))[0];
const nextId=()=>"MT-"+(1+Math.max(100,...MAINT.map(m=>parseInt(m.id.slice(3),10)||0)));
const isDark=()=>root.getAttribute("data-bs-theme")==="dark";
const pal=()=>isDark()?["#d9788f","#a8405f","#f0c4d0","#c9973f","#fbd48a"]:["#5a1a2e","#a8405f","#d9a3b3","#c9973f","#fbd48a"];
const CH={};
/* Chart helper: redraws cleanly and follows light/dark theme */
function chart(id,type,labels,datasets,opts={}){
  Chart.defaults.color=isDark()?"#c4a8b3":"#6e6169";Chart.defaults.borderColor=isDark()?"#3d2530":"#e6dde1";Chart.defaults.font.family="'IBM Plex Sans',sans-serif";
  if(CH[id])CH[id].destroy();
  CH[id]=new Chart(document.getElementById(id),{type,data:{labels,datasets},options:Object.assign({responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom"}}},opts)});
}

/* ---------- Fleet summary, car grid and maintenance log ---------- */
const kpis=()=>{const n=s=>CARS.filter(c=>c.status===s).length;
  $("#kpis").innerHTML=kpiHTML([["Available",n("Available"),"bi-check-circle-fill"],["Rented",n("Rented"),"bi-key-fill"],["In maintenance",n("Maintenance"),"bi-tools"],["Maintenance cost",RM(MAINT.reduce((s,m)=>s+(m.cost||0),0)),"bi-cash-coin"]])};
const grid=$("#carGrid");
const show=()=>{const q=$("#q").value.toLowerCase(),t=$("#fType").value,s=$("#fStatus").value;
  const list=CARS.filter(c=>c.name.toLowerCase().includes(q)&&(!t||c.type===t)&&(!s||c.status===s));
  $("#count").textContent=list.length+" of "+CARS.length+" cars";
  grid.innerHTML=list.length?list.map(c=>`<div class="col-12 col-sm-6 col-xl-3"><div class="card car-card h-100"><img src="${carImg(c)}" alt="${c.name}"><div class="p-3"><div class="d-flex justify-content-between align-items-start"><h2 class="h6 mb-1">${c.name}</h2>${badge(c.status)}</div><div class="small text-muted mb-2">${c.type} &middot; ${c.seats} seats &middot; ${c.plate}</div>${c.mrec?`<div class="small mt-note mb-2"><i class="bi bi-tools me-1"></i>${c.mrec.type} &middot; ${c.mrec.stage==="In progress"?"back "+fmtI(c.mrec.end):"awaiting inspection"}</div>`:""}<div class="d-flex justify-content-between align-items-center"><span class="price">${RM(c.price)}<small class="text-muted fs-6">/day</small></span><button class="btn btn-brand btn-sm" data-id="${c.id}">Details</button></div></div></div></div>`).join(""):'<p class="text-center text-muted py-5">No cars match your filters. Clear the search or choose another type.</p>';
};
const logShow=()=>{const s=$("#fMt").value,l=MAINT.filter(m=>!s||m.stage===s).sort((a,b)=>b.start.localeCompare(a.start));
  $("#mtCount").textContent=`${l.length} of ${MAINT.length} records`;
  $("#mtBody").innerHTML=l.map(m=>`<tr><td class="fw-semibold text-nowrap">${m.id}</td><td>${CARS[m.car].name}</td><td>${m.type}<div class="small text-muted">${esc(m.reason)}</div></td><td class="d-none d-md-table-cell">${period(m)}</td><td>${RM(m.cost)}</td><td>${stageBadge(m.stage)}</td><td class="text-nowrap"><button class="btn btn-brand btn-sm" data-mc="${m.car}">Open</button> <button class="btn btn-outline-danger btn-sm" data-md="${m.id}" aria-label="Delete record ${m.id}"><i class="bi bi-trash3"></i> Delete</button></td></tr>`).join("")||'<tr><td colspan="7" class="text-center text-muted py-4">No maintenance records.</td></tr>';
};
const refresh=()=>{show();kpis();logShow()}; // call after any maintenance change

/* ---------- Car popup: one modal, several views ---------- */
let cur=null; // car shown in the popup
const modal=()=>bootstrap.Modal.getOrCreateInstance($("#carModal"));
/* Footer buttons: [id, css class, label, disabled, click handler] */
const setFoot=arr=>{$("#mFoot").innerHTML=arr.map(b=>`<button class="btn ${b[1]}" id="${b[0]}"${b[3]?" disabled":""}>${b[2]}</button>`).join("");
  arr.forEach(b=>{if(typeof b[4]==="function")$("#"+b[0]).onclick=b[4]})};
const showErr=t=>{const e=$("#mErr");e.textContent=t;e.classList.remove("d-none")};
function go(view,opt){({detail:vDetail,form:vForm,complete:vComplete,avail:vAvail,history:vHistory,del:vDel})[view](cur,opt||{});modal().show()}

/* View 1: car details + maintenance status + actions */
function vDetail(c){
  const bk=live.filter(b=>b.car===c),m=c.mrec,last=lastDone(c);
  $("#mTitle").textContent=c.name;
  let mt;
  if(m)mt=`<div class="mt-panel"><div class="d-flex justify-content-between align-items-center mb-2"><b><i class="bi bi-tools me-1"></i>Maintenance ${m.id}</b>${stageBadge(m.stage)}</div>
    <div class="row g-2 small"><div class="col-6"><div class="text-muted">Type</div><b>${m.type}</b></div><div class="col-6"><div class="text-muted">Reason</div><b>${esc(m.reason)}</b></div>
    <div class="col-4"><div class="text-muted">Started</div><b>${fmtI(m.start)}</b></div><div class="col-4"><div class="text-muted">${m.stage==="In progress"?"Expected back":"Completed on"}</div><b>${fmtI(m.stage==="In progress"?m.end:(m.done||m.end))}</b></div><div class="col-4"><div class="text-muted">Cost</div><b>${RM(m.cost)}</b></div>
    <div class="col-12"><div class="text-muted">Repair notes</div>${m.notes?nl(m.notes):"-"}</div></div>
    <div class="small text-muted mt-2">${m.stage==="In progress"?"This car cannot take new bookings while maintenance is in progress.":"The work is done. Set the car available after the inspection."}</div></div>`;
  else if(c.status==="Rented")mt='<div class="mt-panel muted"><i class="bi bi-info-circle me-1"></i>This car is rented now. You can set maintenance after it is returned.</div>';
  else mt=`<div class="mt-panel muted"><i class="bi bi-check-circle me-1"></i>No maintenance in progress.${last?` Last maintenance: <b>${last.type}</b> on ${fmtI(last.closed)}.`:""}</div>`;
  $("#mBody").innerHTML=`<div class="row g-3 mb-3"><div class="col-md-5"><img src="${carImg(c)}" class="w-100 rounded" alt="${c.name}"></div>
    <div class="col-md-7"><div class="d-flex justify-content-between align-items-start"><div><div class="fw-bold fs-5">${c.name}</div><div class="small text-muted">${c.type} &middot; ${c.seats} seats &middot; ${c.plate}</div></div>${badge(c.status)}</div>
    <div class="price mt-2">${RM(c.price)}<small class="text-muted fs-6">/day</small></div>
    <div class="row g-2 text-center mt-2"><div class="col-6"><div class="mt-stat"><div class="small text-muted">Bookings</div><b>${bk.length}</b></div></div><div class="col-6"><div class="mt-stat"><div class="small text-muted">Revenue</div><b>${RM(sum(bk))}</b></div></div></div></div></div>${mt}`;
  const f=[["bHist","btn-outline-secondary me-auto",'<i class="bi bi-clock-history me-1"></i>View Maintenance History',false,()=>go("history")]];
  if(m){
    f.push(["bUpd","btn-outline-secondary","Update Details",false,()=>go("form",{mode:"update"})]);
    f.push(m.stage==="In progress"?["bDone","btn-gold","Complete Maintenance",false,()=>go("complete")]:["bAvail","btn-gold","Set Available",false,()=>go("avail")]);
  }else{
    f.push(["bSet","btn-brand","Set Maintenance",c.status==="Rented",()=>go("form",{mode:"set"})]);
    f.push(["bBook","btn-gold",c.status==="Available"?"Book this car":"Not available",c.status!=="Available",()=>{
      modal().hide();toast(c.name+" booking request sent");
      pushNote("New booking request for "+c.name,"bi-calendar-plus-fill","A new booking request was created for the "+c.name+". Confirm the pick-up date, time and payment with the customer.")}]);
  }
  if(c.custom)f.splice(1,0,["bDel","btn-outline-danger",'<i class="bi bi-trash3 me-1"></i>Delete car',false,()=>go("del")]); // only cars added with Add Car can be deleted
  setFoot(f);
}

/* View 2: Set Maintenance (new record) or Update Details (existing record) */
function vForm(c,o){
  const upd=o.mode==="update",m=c.mrec,up=upcoming(c);
  const d=upd?m:{type:MTYPES[0],reason:"",start:toISO(TODAY),end:toISO(addD(TODAY,2)),cost:"",notes:""};
  $("#mTitle").textContent=(upd?"Update details: ":"Set maintenance: ")+c.name;
  $("#mBody").innerHTML=`${!upd&&up.length?`<div class="alert alert-warning small"><i class="bi bi-exclamation-triangle-fill me-1"></i>This car has ${up.length} upcoming booking${up.length>1?"s":""} (${up.slice(0,3).map(b=>b.id+", "+fmt(b.start)).join("; ")}${up.length>3?"...":""}). Contact the customer${up.length>1?"s":""} to change the car.</div>`:""}
    <div id="mErr" class="alert alert-danger small d-none" role="alert"></div>
    <div class="row g-3">
      <div class="col-12 col-md-6"><label class="form-label fw-semibold" for="mType">Maintenance type</label><select id="mType" class="form-select">${MTYPES.map(t=>`<option${t===d.type?" selected":""}>${t}</option>`).join("")}</select></div>
      <div class="col-12 col-md-6"><label class="form-label fw-semibold" for="mReason">Reason</label><input id="mReason" class="form-control" maxlength="80" value="${esc(d.reason)}" placeholder="e.g. 20,000 km service"></div>
      <div class="col-6 col-md-4"><label class="form-label fw-semibold" for="mStart">Start date</label><input id="mStart" type="date" class="form-control" value="${d.start}"></div>
      <div class="col-6 col-md-4"><label class="form-label fw-semibold" for="mEnd">${upd&&m.stage==="Completed"?"Completed on":"Expected back"}</label><input id="mEnd" type="date" class="form-control" value="${upd&&m.stage==="Completed"?(m.done||m.end):d.end}"></div>
      <div class="col-12 col-md-4"><label class="form-label fw-semibold" for="mCost">Cost (RM)</label><input id="mCost" type="number" min="0" step="1" class="form-control" value="${d.cost}"></div>
      <div class="col-12"><label class="form-label fw-semibold" for="mNotes">Repair notes</label><textarea id="mNotes" rows="3" class="form-control" maxlength="300">${esc(d.notes)}</textarea></div></div>`;
  setFoot([["bCancel","btn-outline-secondary","Cancel",false,()=>go("detail")],["bSave","btn-gold",upd?"Save changes":"Start maintenance",false,()=>save(upd)]]);
}
function save(upd){
  const v={type:$("#mType").value,reason:$("#mReason").value.trim(),start:$("#mStart").value,end:$("#mEnd").value,cost:Number($("#mCost").value||0),notes:$("#mNotes").value.trim()};
  if(!v.reason)return showErr("Please enter the reason for maintenance.");
  if(!v.start||!v.end)return showErr("Please choose the start and end dates.");
  if(v.end<v.start)return showErr("The end date cannot be before the start date.");
  if(isNaN(v.cost)||v.cost<0)return showErr("Cost must be 0 or more.");
  if(upd){Object.assign(cur.mrec,v);if(cur.mrec.stage==="Completed")cur.mrec.done=v.end}
  else MAINT.push(Object.assign({id:nextId(),car:cur.id,stage:"In progress",done:"",closed:"",inspect:""},v));
  saveMaint();applyMaint();refresh();
  if(upd)toast("Maintenance details updated");
  else{toast(cur.name+" is now in maintenance");
    pushNote(cur.name+" is now in maintenance","bi-tools",`The ${cur.name} (${cur.plate}) was set to maintenance for ${v.type}: ${v.reason}. It cannot take new bookings until it is set to available.`)}
  go("detail");
}

/* View 3: Complete Maintenance (work finished, car still waits for inspection) */
function vComplete(c){const m=c.mrec;
  $("#mTitle").textContent="Complete maintenance: "+c.name;
  $("#mBody").innerHTML=`<p class="text-muted">Confirm that the work on the <b>${c.name}</b> is finished. The car stays in <b>Maintenance</b> until it is inspected and set to Available.</p>
    <div id="mErr" class="alert alert-danger small d-none" role="alert"></div>
    <div class="row g-3">
      <div class="col-6"><label class="form-label fw-semibold" for="mDone">Completion date</label><input id="mDone" type="date" class="form-control" value="${toISO(TODAY)}"></div>
      <div class="col-6"><label class="form-label fw-semibold" for="mCost">Final cost (RM)</label><input id="mCost" type="number" min="0" step="1" class="form-control" value="${m.cost||0}"></div>
      <div class="col-12"><label class="form-label fw-semibold" for="mNotes">Repair notes</label><textarea id="mNotes" rows="3" class="form-control" maxlength="300">${esc(m.notes)}</textarea></div></div>`;
  setFoot([["bCancel","btn-outline-secondary","Cancel",false,()=>go("detail")],["bGo","btn-gold","Mark as completed",false,()=>{
    const done=$("#mDone").value,cost=Number($("#mCost").value||0);
    if(!done)return showErr("Please choose the completion date.");
    if(done<m.start)return showErr("The completion date cannot be before the start date.");
    if(isNaN(cost)||cost<0)return showErr("Cost must be 0 or more.");
    Object.assign(m,{stage:"Completed",done,end:done,cost,notes:$("#mNotes").value.trim()});
    saveMaint();applyMaint();refresh();toast("Maintenance completed. Inspect the car next.");
    pushNote("Maintenance completed for "+c.name,"bi-check-circle-fill",`The work on the ${c.name} is finished. Inspect the car, then set it to available.`);
    go("detail");
  }]]);
}

/* View 4: Set Available (after inspection, only if there are no other problems) */
function vAvail(c){const m=c.mrec;
  $("#mTitle").textContent="Set available: "+c.name;
  $("#mBody").innerHTML=`<p class="text-muted">The <b>${c.name}</b> will be able to take new bookings again.</p>
    <div class="mt-panel mb-3 small"><div><span class="text-muted">Maintenance:</span> <b>${m.type}</b> (${m.id})</div><div><span class="text-muted">Completed on:</span> <b>${fmtI(m.done||m.end)}</b></div><div><span class="text-muted">Cost:</span> <b>${RM(m.cost)}</b></div></div>
    <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="mCheck"><label class="form-check-label" for="mCheck">The inspection is done and the car has no other problems.</label></div>
    <label class="form-label fw-semibold" for="mInspect">Inspection notes (optional)</label><textarea id="mInspect" rows="2" class="form-control" maxlength="200"></textarea>`;
  setFoot([["bCancel","btn-outline-secondary","Cancel",false,()=>go("detail")],["bGo","btn-gold","Set Available",true,()=>{
    m.stage="Closed";m.closed=toISO(TODAY);m.inspect=$("#mInspect").value.trim()||"Inspection passed. No other problems.";
    saveMaint();applyMaint();refresh();toast(c.name+" is available again");
    pushNote(c.name+" is available again","bi-car-front-fill",`The ${c.name} passed the inspection and can take new bookings again.`);
    go("detail");
  }]]);
  $("#mCheck").onchange=e=>{$("#bGo").disabled=!e.target.checked}; // button works only after the inspection is confirmed
}

/* View 5: View Maintenance History (all records of this car) */
function vHistory(c){
  const rs=MAINT.filter(m=>m.car===c.id).sort((a,b)=>b.start.localeCompare(a.start));
  $("#mTitle").textContent="Maintenance history: "+c.name;
  $("#mBody").innerHTML=rs.length?`<div class="table-responsive"><table class="table align-middle mb-2"><thead><tr><th>ID</th><th>Type and reason</th><th>Period</th><th>Cost</th><th>Stage</th></tr></thead><tbody>${rs.map(m=>`<tr><td class="fw-semibold">${m.id}</td><td>${m.type}<div class="small text-muted">${esc(m.reason)}</div>${m.notes?`<div class="small text-muted">${esc(m.notes)}</div>`:""}${m.inspect?`<div class="small text-muted">Inspection: ${esc(m.inspect)}</div>`:""}</td><td>${period(m)}</td><td>${RM(m.cost)}</td><td>${stageBadge(m.stage)}</td></tr>`).join("")}</tbody></table></div>
    <div class="small text-muted">${rs.length} record${rs.length>1?"s":""} &middot; Total cost: <b>${RM(rs.reduce((s,m)=>s+(m.cost||0),0))}</b></div>`
    :'<p class="text-center text-muted py-4 mb-0">No maintenance records for this car yet.</p>';
  setFoot([["bBack","btn-outline-secondary","Back",false,()=>go("detail")]]);
}

/* View 6: Delete car (only cars added with Add Car). Asks for confirmation first. */
function vDel(c){
  const why=c.status==="Rented"?"This car is rented now. Delete it after it is returned.":c.mrec?"This car is in maintenance. Complete the maintenance and set it available first.":"",
    hist=MAINT.filter(m=>m.car===c.id).length;
  $("#mTitle").textContent="Delete car: "+c.name;
  $("#mBody").innerHTML=why?`<div class="alert alert-warning mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i><b>${esc(c.name)}</b> cannot be deleted. ${why}</div>`
    :`<p class="mb-2">Delete <b>${esc(c.name)}</b> (${esc(c.plate)}) from the fleet?</p><p class="text-muted mb-0">${hist?`Its ${hist} maintenance record${hist>1?"s":""} will be removed too. `:""}This cannot be undone.</p>`;
  setFoot([["bCancel","btn-outline-secondary",why?"Back":"Cancel",false,()=>go("detail")]].concat(why?[]:[["bDelOk","btn-danger","Delete car",false,()=>delCar(c)]]));
}
function delCar(c){
  const i=c.id,name=c.name,plate=c.plate;
  XCARS.splice(i-BASE_CARS,1);CARS.splice(i,1);CARS.forEach((k,n)=>k.id=n); // car ids are positions in the list, so renumber
  MAINT=MAINT.filter(m=>m.car!==i);MAINT.forEach(m=>{if(m.car>i)m.car--});   // remove its records and follow the renumbering
  saveXCars();saveMaint();applyMaint();cur=null;
  $("#q").value=$("#fType").value=$("#fStatus").value="";
  refresh();draw();modal().hide();
  toast(name+" deleted from the fleet");
  pushNote("Car deleted: "+name,"bi-trash3-fill",`The ${name} (${plate}) was deleted from the fleet.`);
}

/* ---------- Events ---------- */
grid.addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(b){cur=CARS[b.dataset.id];go("detail")}});
$("#mtBody").addEventListener("click",e=>{
  const d=e.target.closest("[data-md]");if(d){openMtDel(d.dataset.md);return}
  const b=e.target.closest("[data-mc]");if(b){cur=CARS[b.dataset.mc];go("detail")}});
/* Delete a maintenance record (Maintenance log). Only finished (Closed) records can be deleted:
   a record that is In progress or Completed still decides the car's status, so it must be closed first. */
let delRec=null;
function openMtDel(id){
  const m=MAINT.find(x=>x.id===id);if(!m)return;delRec=m;
  const open=m.stage!=="Closed",car=CARS[m.car];
  $("#mdTitle").textContent="Delete maintenance record: "+m.id;
  $("#mdBody").innerHTML=open
    ?`<div class="alert alert-warning mb-0"><i class="bi bi-exclamation-triangle-fill me-1"></i><b>${m.id}</b> cannot be deleted because the <b>${esc(car.name)}</b> is still in maintenance (${m.stage}). Complete the maintenance and set the car available first.</div>`
    :`<p class="mb-2">Delete <b>${m.id}</b> (${esc(m.type)}, ${esc(car.name)}, ${RM(m.cost)})?</p><p class="text-muted mb-0">The record is removed from the maintenance log and the car's history, and its cost is taken out of the maintenance cost total. This cannot be undone.</p>`;
  $("#mdOk").classList.toggle("d-none",open);
  $("#mdCancel").textContent=open?"Close":"Cancel";
  bootstrap.Modal.getOrCreateInstance($("#mtDel")).show();
}
$("#mdOk").onclick=()=>{
  if(!delRec)return;const id=delRec.id;
  MAINT=MAINT.filter(x=>x.id!==id);saveMaint();applyMaint();refresh();
  bootstrap.Modal.getOrCreateInstance($("#mtDel")).hide();
  toast("Maintenance record "+id+" deleted");delRec=null;
};
["q","fType","fStatus"].forEach(i=>$("#"+i).addEventListener("input",show));
$("#fMt").addEventListener("input",logShow);
$("#reset").onclick=()=>{$("#q").value=$("#fType").value=$("#fStatus").value="";show()};
/* ---------- Add Car: popup form, saved in the browser so the car stays after a refresh ---------- */
if($("#addModal")){ // only runs when the Add Car popup exists in cars.html, so the rest of the page never breaks
const addModal=()=>bootstrap.Modal.getOrCreateInstance($("#addModal"));
let addSrc=""; // uploaded photo (resized), empty when a model image is chosen
const aErr=t=>{const e=$("#aErr");e.textContent=t;e.classList.toggle("d-none",!t)};
const aPrev=()=>{$("#aPrev").src=addSrc||"images/"+$("#aImg").value+".webp"};
$("#aImg").innerHTML='<option value="hero">General car illustration</option>'+CARS.slice(0,SLUGS.length).map(c=>`<option value="${c.img}">${c.name}</option>`).join("");
$("#aImg").addEventListener("input",()=>{addSrc="";$("#aFile").value="";aPrev()});
$("#addCar").onclick=()=>{
  $("#addForm").reset();addSrc="";aErr("");$("#aSeats").value=5;$("#aImg").value="hero";aPrev();addModal().show();
  $("#addModal").addEventListener("shown.bs.modal",()=>$("#aName").focus(),{once:true});
};
/* Uploaded photo: shrunk to 640 px wide so it fits in the browser storage */
$("#aFile").addEventListener("change",e=>{
  const f=e.target.files[0];addSrc="";aErr("");
  if(!f){aPrev();return}
  if(!/^image\/(jpeg|png|webp)$/.test(f.type)){aErr("Please choose a JPG, PNG or WEBP image.");e.target.value="";aPrev();return}
  const r=new FileReader();
  r.onload=()=>{const im=new Image();
    im.onload=()=>{const k=Math.min(1,640/im.width),cv=document.createElement("canvas"),cx=cv.getContext("2d");
      cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cx.fillStyle="#fff";cx.fillRect(0,0,cv.width,cv.height);cx.drawImage(im,0,0,cv.width,cv.height);
      addSrc=cv.toDataURL("image/jpeg",.82);aPrev()};
    im.onerror=()=>{aErr("This image could not be read. Try another file.");e.target.value="";aPrev()};
    im.src=r.result};
  r.readAsDataURL(f);
});
$("#addForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#aName").value.trim().replace(/\s+/g," "),type=$("#aType").value,seats=Number($("#aSeats").value),
    plate=$("#aPlate").value.trim().toUpperCase().replace(/\s+/g," "),price=Number($("#aPrice").value);
  if(!name)return aErr("Please enter the car name.");
  if(!plate)return aErr("Please enter the plate number.");
  if(!/^[A-Z0-9 ]{2,12}$/.test(plate))return aErr("The plate number can only have letters, numbers and spaces.");
  if(CARS.some(c=>c.plate.toUpperCase()===plate))return aErr("This plate number is already in the fleet.");
  if(!Number.isInteger(seats)||seats<2||seats>15)return aErr("Seats must be a whole number from 2 to 15.");
  if(!(price>0)||price>99999)return aErr("Please enter a price per day greater than 0.");
  const x={name,type,price,seats,plate,img:addSrc?"hero":$("#aImg").value,src:addSrc};
  XCARS.push(x);
  if(!saveXCars()){XCARS.pop();return aErr("The car could not be saved because the browser storage is full or blocked. Try a smaller photo.")}
  CARS.push(makeCar(x,CARS.length));applyMaint();
  $("#q").value=$("#fType").value=$("#fStatus").value="";
  refresh();draw();addModal().hide();
  toast(name+" added to the fleet");
  pushNote("New car added: "+name,"bi-car-front-fill",`The ${name} (${plate}) was added to the fleet at ${RM(price)} per day. It is available for booking.`);
  setTimeout(()=>{const l=grid.lastElementChild;if(l)l.scrollIntoView({behavior:"smooth",block:"center"})},350);
});

} // end of Add Car
refresh();

/* ---------- Charts ---------- */
const draw=()=>{const p=pal();
  chart("cPrice","bar",CARS.map(c=>c.name),[{label:"Price per day (RM)",data:CARS.map(c=>c.price),backgroundColor:CARS.map(c=>c.type==="SUV"||c.type==="MPV"?p[3]:p[1]),borderRadius:6}],{plugins:{legend:{display:false}},scales:{x:{ticks:{maxRotation:60}}}});
  chart("cTypeRev","doughnut",TYPES,[{data:TYPES.map(t=>sum(live.filter(b=>b.car.type===t))),backgroundColor:[p[0],p[1],p[3],p[4]],borderWidth:0}],{cutout:"55%"});
};draw();document.addEventListener("themechange",draw);
}
