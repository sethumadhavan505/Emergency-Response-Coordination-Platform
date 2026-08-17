const typeEl = document.getElementById("type");
const severityEl = document.getElementById("severity");
const priorityLabel = document.getElementById("priorityLabel");
const priorityText = document.getElementById("priorityText");

function recommendedFor(type, severity){
  const list = [];
  if(type === "Medical" || type === "Road Accident") list.push("🚑 Ambulance");
  if(type === "Crime / Security" || type === "Women Safety") list.push("🚓 Police");
  if(type === "Fire") list.push("🚒 Fire & Rescue");
  if(type === "Natural Disaster") list.push("🚑 Medical", "🚓 Police", "🚒 Fire & Rescue");
  if(!list.length) list.push("🛟 General Response");
  let level = severity || "Pending";
  let message = severity === "Critical"
    ? "Immediate dispatch recommended."
    : severity === "High"
    ? "Urgent response recommended."
    : severity === "Medium"
    ? "Standard response recommended."
    : severity === "Low"
    ? "Non-urgent assistance recommended."
    : "Select a severity to calculate priority.";
  return {list, level, message};
}

function updatePreview(){
  const r = recommendedFor(typeEl?.value, severityEl?.value);
  if(priorityLabel) priorityLabel.textContent = r.level.toUpperCase();
  if(priorityText) priorityText.textContent = r.message + (r.list.length ? " " + r.list.join(" • ") : "");
}

[typeEl,severityEl].forEach(el => el && el.addEventListener("change", updatePreview));

function captureLocation(){
  const text = document.getElementById("locationText");
  if(!navigator.geolocation){
    text.textContent = "Geolocation is not supported.";
    return;
  }
  text.textContent = "Getting location…";
  navigator.geolocation.getCurrentPosition(
    p => {
      document.getElementById("lat").value = p.coords.latitude;
      document.getElementById("lng").value = p.coords.longitude;
      text.textContent = `${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`;
    },
    () => text.textContent = "Permission denied or location unavailable.",
    {enableHighAccuracy:true, timeout:10000}
  );
}

const params = new URLSearchParams(location.search);
if(params.get("type") && typeEl){
  typeEl.value = params.get("type");
  updatePreview();
}

document.getElementById("reportForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = typeEl.value;
  const severity = severityEl.value;
  const r = recommendedFor(type, severity);
  const incident = createIncident({
    name:document.getElementById("name").value.trim(),
    phone:document.getElementById("phone").value.trim(),
    type,
    severity,
    description:document.getElementById("description").value.trim(),
    lat:document.getElementById("lat").value || null,
    lng:document.getElementById("lng").value || null,
    recommended:r.list
  });
  const box = document.getElementById("formResult");
  box.classList.remove("hidden");
  box.innerHTML = `✓ <strong>${incident.id}</strong> created. Priority: ${severity}. Recommended: ${r.list.join(", ")}. <a href="dashboard.html">Open Dashboard →</a>`;
  e.target.reset();
  document.getElementById("locationText").textContent = "Location not captured";
  updatePreview();
});
