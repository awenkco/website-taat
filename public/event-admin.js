(() => {
  const form = document.getElementById("event-config-form");
  if (!form) return;

  const typeInput = document.getElementById("activity-type-input");
  const descriptionInput = document.getElementById("activity-description-input");
  const message = document.getElementById("event-config-message");
  const button = document.getElementById("save-event-config");

  async function loadConfig() {
    try {
      const response = await fetch("/api/admin/event-config", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Pengaturan hanya dapat diubah oleh admin/panitia TAAT. Masuk dengan akun pemilik atau admin proyek.");
        }
        throw new Error(data.error || "Pengaturan belum dapat dimuat.");
      }
      typeInput.value = data.activity_type || "Hiking";
      descriptionInput.value = data.activity_description || "Jelajah alam Gunung Sangar bersama TAAT.";
    } catch (error) {
      message.textContent = error.message || "Pengaturan belum dapat dimuat.";
      typeInput.disabled = true;
      descriptionInput.disabled = true;
      button.disabled = true;
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "";
    if (!form.reportValidity()) return;

    button.disabled = true;
    button.textContent = "Menyimpan…";
    try {
      const response = await fetch("/api/admin/event-config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          activity_type: typeInput.value.trim(),
          activity_description: descriptionInput.value.trim()
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Pengaturan belum tersimpan.");
      message.textContent = "Pengaturan berhasil disimpan. Halaman kegiatan publik akan menampilkan informasi terbaru.";
    } catch (error) {
      message.textContent = error.message || "Terjadi kendala saat menyimpan.";
    } finally {
      button.disabled = false;
      button.textContent = "Simpan pengaturan ↗";
    }
  });

  loadConfig();
})();