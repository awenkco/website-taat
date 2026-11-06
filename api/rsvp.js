import { db } from "hatchable";

export const access = "public";
export const methods = ["POST"];

function clean(value, maxLength) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength)
    : "";
}

export default async function (req, res) {
  const body = req.body || {};

  // Honeypot field: quietly accept automated submissions without storing them.
  if (body.website) return res.status(201).json({ ok: true });

  const fullName = clean(body.full_name, 120);
  const whatsapp = clean(body.whatsapp, 30);
  const attendance = body.attendance;
  const note = clean(body.note, 500);
  const participantCount = Number(body.participant_count);

  if (fullName.length < 2) {
    return res.status(400).json({ error: "Nama lengkap minimal 2 karakter." });
  }
  if (!/^[+0-9() .-]{8,30}$/.test(whatsapp)) {
    return res.status(400).json({ error: "Periksa kembali nomor WhatsApp kamu." });
  }
  if (attendance !== "yes" && attendance !== "no") {
    return res.status(400).json({ error: "Pilih konfirmasi kehadiran terlebih dahulu." });
  }
  if (!Number.isInteger(participantCount) ||
      (attendance === "yes" && (participantCount < 1 || participantCount > 10)) ||
      (attendance === "no" && participantCount !== 0)) {
    return res.status(400).json({ error: "Jumlah peserta tidak valid." });
  }

  try {
    const result = await db.query(
      "INSERT INTO hiking_rsvps (full_name, whatsapp, attendance, participant_count, note) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [fullName, whatsapp, attendance, participantCount, note]
    );
    return res.status(201).json({ ok: true, id: result.rows[0].id });
  } catch (error) {
    console.error("RSVP insert failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "Konfirmasi belum tersimpan. Silakan coba lagi." });
  }
}