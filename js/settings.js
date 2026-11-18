/* DIVEORA - Settings page: profile name, theme, notification badge, reset saved data */
if(PAGE==="settings"&&user){
  const isDarkNow=()=>root.getAttribute("data-bs-theme")==="dark";
  /* Profile */
  const paint=()=>{$("#setName").textContent=SET.name;$("#setAv").textContent=initials(SET.name);$("#nameInp").value=SET.name;paintUser()};
  $("#setUser").textContent=user;
  $("#saveName").onclick=()=>{const v=$("#nameInp").value.trim();
    if(!v){toast("Please enter a display name");return}
    SET.name=v;saveSet();paint();toast("Profile saved")};
  /* Appearance: radio buttons follow the theme, also when the top bar button is used */
  const syncTheme=()=>{$("#thLight").checked=!isDarkNow();$("#thDark").checked=isDarkNow()};
  document.querySelectorAll('input[name="theme"]').forEach(r=>r.addEventListener("change",()=>setTheme(r.value)));
  document.addEventListener("themechange",syncTheme);
  /* Notifications */
  $("#notifSw").checked=SET.notify;
  $("#notifSw").addEventListener("change",e=>{SET.notify=e.target.checked;saveSet();drawNotes();toast(SET.notify?"Notification badge is on":"Notification badge is off")});
  /* System information */
  $("#sysInfo").innerHTML=[["Name",META.system],["Version",META.version],["Last updated",META.updated]].map(m=>`<div class="d-flex justify-content-between border-bottom py-2"><span class="text-muted">${m[0]}</span><b class="text-end">${m[1]}</b></div>`).join("");
  /* Reset saved data (theme, notifications, profile, maintenance records, customer changes), then reload */
  $("#resetBtn").onclick=()=>bootstrap.Modal.getOrCreateInstance($("#resetModal")).show();
  $("#resetOk").onclick=()=>{try{["de_theme","de_nstate","de_settings","de_maint","de_cust","de_cars","de_side","de_bkx","de_pay"].forEach(k=>localStorage.removeItem(k))}catch(e){}location.reload()};
  paint();syncTheme();
}
