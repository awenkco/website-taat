(() => {
  const typeNode = document.getElementById("activity-type");
  const descriptionNode = document.getElementById("activity-description");
  if (!typeNode || !descriptionNode) return;

  fetch("/api/event-config", { cache: "no-store", headers: { "Accept": "application/json" } })
    .then(async response => {
      if (!response.ok) throw new Error("Unable to load event settings");
      return response.json();
    })
    .then(config => {
      if (config.activity_type) typeNode.textContent = String(config.activity_type).toLocaleUpperCase("id-ID");
      if (config.activity_description) descriptionNode.textContent = config.activity_description;
    })
    .catch(() => {
      // Keep the sensible default content if the configuration endpoint is unavailable.
    });
})();