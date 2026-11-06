import { db } from "hatchable";

export const access = "admin";
export const methods = ["GET"];

export default async function (req, res) {
  try {
    const [summaryResult, rsvpResult] = await Promise.all([
      db.query(
        "SELECT COUNT(*) FILTER (WHERE attendance = 'yes')::int AS yes_responses, COALESCE(SUM(participant_count) FILTER (WHERE attendance = 'yes'), 0)::int AS attending_people, COUNT(*) FILTER (WHERE attendance = 'no')::int AS no_responses, COUNT(*)::int AS total_responses FROM hiking_rsvps"
      ),
      db.query(
        "SELECT id, full_name, whatsapp, attendance, participant_count, note, created_at FROM hiking_rsvps ORDER BY created_at DESC LIMIT 500"
      )
    ]);

    res.setHeader("Cache-Control", "no-store");
    return res.json({
      summary: summaryResult.rows[0],
      rsvps: rsvpResult.rows
    });
  } catch (error) {
    console.error("RSVP admin listing failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "Rekap belum dapat dimuat. Coba muat ulang halaman." });
  }
}