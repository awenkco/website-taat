import { db } from "hatchable";

export const access = "admin";
export const methods = ["GET", "POST"];

export default async function (req, res) {
  if (req.method === "GET") {
    try {
      const result = await db.query(
        "SELECT activity_type, activity_description, updated_at FROM taat_event_settings WHERE id = 1"
      );
      return res.json(result.rows[0] || {
        activity_type: "Hiking",
        activity_description: "Jelajah alam Gunung Sangar bersama TAAT."
      });
    } catch (error) {
      console.error("Admin event config read failed:", error?.message || "unknown error");
      return res.status(500).json({ error: "Pengaturan kegiatan belum dapat dimuat." });
    }
  }

  const body = req.body || {};
  const activityType = typeof body.activity_type === "string" ? body.activity_type.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 60) : "";
  const activityDescription = typeof body.activity_description === "string" ? body.activity_description.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 250) : "";

  if (activityType.length < 2) {
    return res.status(400).json({ error: "Jenis kegiatan minimal 2 karakter." });
  }
  if (activityDescription.length < 8) {
    return res.status(400).json({ error: "Deskripsi kegiatan minimal 8 karakter." });
  }

  try {
    const result = await db.query(
      "UPDATE taat_event_settings SET activity_type = $1, activity_description = $2, updated_at = now() WHERE id = 1 RETURNING activity_type, activity_description, updated_at",
      [activityType, activityDescription]
    );
    return res.json({ ok: true, config: result.rows[0] });
  } catch (error) {
    console.error("Admin event config save failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "Pengaturan belum tersimpan. Silakan coba lagi." });
  }
}