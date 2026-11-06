(() => {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const participantField = document.getElementById("participant-field");
  const participantInput = document.getElementById("participant_count");
  const message = document.getElementById("form-message");
  const submitButton = document.getElementById("submit-button");
  const successCard = document.getElementById("success-card");
  const formCard = form;
  const formColumn = document.querySelector(".form-column");
  let lastSubmission = null;

  function attendanceValue() {
    return form.querySelector('input[name="attendance"]:checked')?.value || "yes";
  }

  function updateAttendance() {
    const attending = attendanceValue() === "yes";
    participantField.hidden = !attending;
    participantInput.required = attending;
    participantInput.disabled = !attending;
    if (!attending) participantInput.value = "0";
    else if (Number(participantInput.value) < 1) participantInput.value = "1";

    form.querySelectorAll(".choice-card").forEach(card => {
      const input = card.querySelector("input");
      card.classList.toggle("is-selected", input.checked);
    });
  }

  form.querySelectorAll('input[name="attendance"]').forEach(input => {
    input.addEventListener("change", updateAttendance);
  });
  updateAttendance();

  function setMessage(text) {
    message.textContent = text || "";
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    setMessage("");

    if (!form.reportValidity()) return;
    const attending = attendanceValue() === "yes";
    const payload = {
      full_name: form.full_name.value.trim(),
      whatsapp: form.whatsapp.value.trim(),
      attendance: attending ? "yes" : "no",
      participant_count: attending ? Number(form.participant_count.value) : 0,
      note: form.note.value.trim(),
      website: form.website.value
    };

    submitButton.disabled = true;
    submitButton.querySelector("span:first-child").textContent = "Menyimpan…";

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Terjadi kendala. Coba lagi.");

      lastSubmission = { ...payload };
      formCard.hidden = true;
      successCard.hidden = false;
      document.getElementById("success-copy").textContent = attending
        ? "Konfirmasi kamu sudah tersimpan untuk " + payload.participant_count + " peserta. Sampai bertemu di jalur!"
        : "Terima kasih sudah memberi kabar. Semoga bisa ikut perjalanan berikutnya!";
      successCard.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      setMessage(error.message || "Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span:first-child").textContent = "Kirim konfirmasi";
    }
  });

  document.getElementById("edit-response").addEventListener("click", () => {
    successCard.hidden = true;
    formCard.hidden = false;
    if (lastSubmission) {
      form.full_name.value = lastSubmission.full_name;
      form.whatsapp.value = lastSubmission.whatsapp;
      form.note.value = lastSubmission.note;
      const choice = form.querySelector('input[name="attendance"][value="' + lastSubmission.attendance + '"]');
      if (choice) choice.checked = true;
      participantInput.value = String(lastSubmission.participant_count || 1);
      updateAttendance();
    }
    formColumn.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();