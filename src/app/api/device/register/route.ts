import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/device/register — validate serial key and register device
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawKey = body.serialKey || ""
    const deviceName = body.deviceName || "Unknown Device"
    const deviceId = body.deviceId || "unknown"

    // Clean the key: trim, uppercase, remove all whitespace
    const cleanKey = rawKey.trim().toUpperCase().replace(/\s/g, "")

    if (cleanKey.length < 12) {
      return NextResponse.json({ error: "Invalid serial key format. Key must be at least 12 characters." }, { status: 400 })
    }

    // Look up the serial key in master DB
    const key = await db.serialKey.findUnique({
      where: { key: cleanKey },
    })

    if (!key) {
      return NextResponse.json({ error: `Serial key not found: "${cleanKey}". Please check and try again.` }, { status: 404 })
    }

    // Allow re-registration from the same device
    if (key.status === "used" && key.deviceId !== deviceId) {
      return NextResponse.json({ error: "This serial key is already registered to another device." }, { status: 403 })
    }

    if (key.status === "suspended" || key.status === "expired") {
      return NextResponse.json({ error: `Serial key is ${key.status}. Contact support.` }, { status: 403 })
    }

    // Activate / register the device
    await db.serialKey.update({
      where: { id: key.id },
      data: {
        status: "used",
        deviceName,
        deviceId,
        activatedAt: new Date(),
      },
    })

    return NextResponse.json({
      ok: true,
      plan: key.plan,
      message: "Device registered successfully",
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Server error: ${msg}` }, { status: 500 })
  }
}
