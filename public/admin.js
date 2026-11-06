(() => {
  const message = document.getElementById("admin-message");
  const tableScroll = document.getElementById("table-scroll");
  const tbody = document.getElementById("rsvp-rows");
  const filter = document.getElementById("status-filter");
  const empty = document.getElementById("empty-state");
  let allRows = [];

  const safe = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

  const formatDate = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta"
    }).format(date);
  };

  function renderRows() {
    const selected = filter.value;
    const rows = allRows.filter(row => selected === "all" || row.attendance === selected);
    tbody.innerHTML = rows.map(row => {
      const attending = row.attendance === "yes";
      return "<tr>" +
        "<td><strong>" + safe(row.full_name) + "</strong><small>RSVP #" + safe(row.id) + "</small></td>" +
        "<td>" + safe(row.whatsapp) + "</td>" +
        '<td><span class="status ' + (attending ? "yes" : "no") + '">' + (attending ? "HADIR" : "TIDAK HADIR") + "</span></td>" +
        "<td>" + (attending ? safe(row.participant_count) + " orang" : "—") + "</td>" +
        "<td><small title=\"" + safe(row.note) + "\">" + (row.note ? safe(row.note) : "—") + "</small></td>" +
        "<td>" + safe(formatDate(row.created_at)) + "</td></tr>";
    }).join("");
    empty.hidden = rows.length !== 0;
    tableScroll.hidden = false;
  }

  async function load() {
    message.textContent = "Memuat data RSVP…";
    message.hidden = false;
    try {
      const response = await fetch("/api/admin/rsvps", { headers: { "Accept": "application/json" }, cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Akses rekap dibatasi untuk admin/panitia proyek. Masuk dengan akun panitia yang memiliki akses admin.");
        }
        throw new Error(data.error || "Rekap tidak dapat dimuat.");
      }
      const summary = data.summary || {};
      document.getElementById("total-responses").textContent = summary.total_responses ?? 0;
      document.getElementById("yes-responses").textContent = summary.yes_responses ?? 0;
      document.getElementById("attending-people").textContent = summary.attending_people ?? 0;
      document.getElementById("no-responses").textContent = summary.no_responses ?? 0;
      allRows = Array.isArray(data.rsvps) ? data.rsvps : [];
      message.hidden = true;
      renderRows();
    } catch (error) {
      message.textContent = error.message || "Terjadi kendala saat memuat rekap.";
      message.hidden = false;
    }
  }

  filter.addEventListener("change", renderRows);
  document.getElementById("export-csv").addEventListener("click", () => {
    const rows = allRows.filter(row => filter.value === "all" || row.attendance === filter.value);
    const columns = ["ID", "Nama", "WhatsApp", "Status", "Jumlah peserta", "Catatan", "Waktu respons"];
    const values = rows.map(row => [
      row.id, row.full_name, row.whatsapp,
      row.attendance === "yes" ? "Hadir" : "Tidak hadir",
      row.participant_count, row.note, formatDate(row.created_at)
    ]);
    const quote = value => '"' + String(value ?? "").replace(/"/g, '""') + '"';
    const csv = "\uFEFF" + [columns, ...values].map(row => row.map(quote).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "rekap-rsvp-hiking-2026-11-07.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  load();
})();