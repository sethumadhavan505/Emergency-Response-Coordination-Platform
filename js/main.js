const INCIDENT_KEY = "erp_incidents_v1";

function toggleMenu(){
  const nav = document.querySelector(".nav-links");
  if(nav) nav.classList.toggle("open");
}

function getIncidents(){
  try { return JSON.parse(localStorage.getItem(INCIDENT_KEY) || "[]"); }
  catch(e){ return []; }
}

function saveIncidents(items){
  localStorage.setItem(INCIDENT_KEY, JSON.stringify(items));
}

function createIncident(data){
  const incident = {
    id: "ER-" + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    status: "Reported",
    ...data
  };
  const items = getIncidents();
  items.unshift(incident);
  saveIncidents(items.slice(0,50));
  return incident;
}

function openSOS(){
  const modal = document.getElementById("sosModal");
  if(modal){ modal.classList.remove("hidden"); }
}

function closeSOS(){
  const modal = document.getElementById("sosModal");
  if(modal){ modal.classList.add("hidden"); }
}

function confirmSOS(){
  const result = document.getElementById("sosResult");
  const finish = (lat=null,lng=null) => {
    const incident = createIncident({
      name:"SOS User",
      phone:"Not provided",
      type:"SOS Emergency",
      severity:"Critical",
      description:"One-tap SOS emergency request.",
      lat,lng,
      recommended:["Emergency Response","Ambulance","Police"]
    });
    if(result){
      result.classList.remove("hidden");
      result.innerHTML = `✓ SOS ${incident.id} created. Location ${lat ? "captured" : "not available"}. Open the Dashboard to view the incident.`;
    }
    setTimeout(() => { closeSOS(); window.location.href="dashboard.html"; }, 1400);
  };
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p => finish(p.coords.latitude,p.coords.longitude),
      () => finish()
    );
  } else finish();
}

function shareLocation(){
  const status = document.getElementById("locationStatus");
  if(!navigator.geolocation){
    if(status) status.textContent = "Geolocation is not supported by this browser.";
    return;
  }
  if(status) status.textContent = "Requesting your location…";
  navigator.geolocation.getCurrentPosition(
    p => {
      if(status) status.textContent = `✓ Location captured: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`;
    },
    () => {
      if(status) status.textContent = "Location permission was not granted.";
    },
    {enableHighAccuracy:true, timeout:10000}
  );
}

document.addEventListener("click", (e) => {
  if(e.target.classList.contains("modal")) closeSOS();
});
