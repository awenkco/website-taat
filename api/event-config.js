import { db } from "hatchable";

export const access = "public";
export const methods = ["GET"];

export default async function (req, res) {
  try {
    const result = await db.query(
      "SELECT activity_type, activity_description FROM taat_event_settings WHERE id = 1"
    );
    const config = result.rows[0] || {
      activity_type: "Hiking",
      activity_description: "Jelajah alam Gunung Sangar bersama TAAT."
    };
    res.setHeader("Cache-Control", "no-store");
    return res.json(config);
  } catch (error) {
    console.error("Event config read failed:", error?.message || "unknown error");
    return res.status(500).json({ error: "Pengaturan kegiatan belum dapat dimuat." });
  }
}