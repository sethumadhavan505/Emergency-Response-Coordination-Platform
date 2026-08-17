let map;
let markers = [];

function initMap(){
  if(typeof L === "undefined") return;
  const defaultCenter = [13.0827,80.2707];
  map = L.map("map").setView(defaultCenter, 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19,
    attribution:'&copy; OpenStreetMap contributors'
  }).addTo(map);
  refreshDashboard();
}

function refreshDashboard(){
  const incidents = getIncidents();
  const active = incidents.filter(x => x.status !== "Resolved");
  const critical = active.filter(x => x.severity === "Critical");
  document.getElementById("activeCount").textContent = active.length;
  document.getElementById("criticalCount").textContent = critical.length;

  const feed = document.getElementById("incidentFeed");
  if(!incidents.length){
    feed.innerHTML = `<div class="empty-state"><div>🟢</div><h3>No active incidents</h3><p>Use “Simulate Emergency” or submit a report to see the command center in action.</p></div>`;
  } else {
    feed.innerHTML = incidents.map(x => `
      <div class="incident-card">
        <div class="incident-top">
          <div class="incident-title">${escapeHtml(x.type)} <span style="color:#8b9bad;font-weight:600">#${x.id}</span></div>
          <span class="priority-badge priority-${String(x.severity||"low").toLowerCase()}">${escapeHtml(x.severity||"LOW")}</span>
        </div>
        <div class="incident-meta">${escapeHtml(x.status||"Reported")} • ${timeAgo(x.createdAt)}${x.lat ? ` • 📍 ${Number(x.lat).toFixed(4)}, ${Number(x.lng).toFixed(4)}` : ""}</div>
        <div class="incident-meta">${escapeHtml(x.description||"Emergency request")}</div>
      </div>`).join("");
  }

  if(map){
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    incidents.forEach((x,i) => {
      const lat = Number(x.lat), lng = Number(x.lng);
      if(Number.isFinite(lat) && Number.isFinite(lng)){
        const marker = L.marker([lat,lng]).addTo(map).bindPopup(
          `<b>${escapeHtml(x.type)}</b><br>${escapeHtml(x.severity)} priority<br>${escapeHtml(x.status)}<br><small>${escapeHtml(x.id)}</small>`
        );
        markers.push(marker);
        if(i===0) map.setView([lat,lng],14);
      }
    });
  }
}

function simulateEmergency(){
  const demoLocations = [
    [13.0827,80.2707,"Chennai Central"],
    [13.0475,80.2090,"Anna Nagar"],
    [13.0108,80.2350,"Guindy"],
    [12.9716,80.2209,"Velachery"]
  ];
  const location = demoLocations[Math.floor(Math.random()*demoLocations.length)];
  const types = ["Road Accident","Medical","Fire"];
  const type = types[Math.floor(Math.random()*types.length)];
  const incident = createIncident({
    name:"Demo Citizen", phone:"9000000000", type, severity:"Critical",
    description:"Simulated critical incident for hackathon demonstration.",
    lat:location[0], lng:location[1],
    recommended: type==="Fire" ? ["🚒 Fire & Rescue"] : ["🚑 Ambulance","🚓 Police"]
  });
  refreshDashboard();
  setTimeout(() => animateStatus(incident.id), 800);
}

function animateStatus(id){
  const stages = ["Reported","AI Prioritized","Responder Assigned","En Route"];
  let index = 0;
  const timer = setInterval(() => {
    const incidents = getIncidents();
    const item = incidents.find(x=>x.id===id);
    if(!item){ clearInterval(timer); return; }
    item.status = stages[index];
    saveIncidents(incidents);
    refreshDashboard();
    index++;
    if(index>=stages.length) clearInterval(timer);
  }, 1500);
}

function clearIncidents(){
  if(confirm("Clear all demo incidents?")){
    localStorage.removeItem(INCIDENT_KEY);
    refreshDashboard();
  }
}

function timeAgo(iso){
  const seconds = Math.max(1, Math.floor((Date.now()-new Date(iso).getTime())/1000));
  if(seconds<60) return `${seconds}s ago`;
  const minutes=Math.floor(seconds/60);
  if(minutes<60) return `${minutes}m ago`;
  return `${Math.floor(minutes/60)}h ago`;
}

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

document.addEventListener("DOMContentLoaded", initMap);
