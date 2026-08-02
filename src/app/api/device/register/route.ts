import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST /api/device/register — validate serial key and register device
export async function POST(req: Request) {
  const { serialKey, deviceName, deviceId } = await req.json()

  if (!serialKey || serialKey.length < 12) {
    return NextResponse.json({ error: "Invalid serial key format" }, { status: 400 })
  }

  // Look up the serial key in master DB
  const key = await db.serialKey.findUnique({
    where: { key: serialKey.toUpperCase().trim() },
  })

  if (!key) {
    return NextResponse.json({ error: "Serial key not found. Please check your key and try again." }, { status: 404 })
  }

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
      deviceName: deviceName || "Unknown Device",
      deviceId: deviceId || "unknown",
      activatedAt: new Date(),
    },
  })

  return NextResponse.json({
    ok: true,
    plan: key.plan,
    message: "Device registered successfully",
  })
}
