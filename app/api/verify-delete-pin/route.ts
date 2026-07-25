import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    const adminPin = process.env.ADMIN_DELETE_PIN;

    if (!adminPin) {
      return NextResponse.json(
        { success: false, message: "Server PIN not configured." },
        { status: 500 }
      );
    }

    if (pin === adminPin) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Incorrect PIN",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}