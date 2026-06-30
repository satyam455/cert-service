import { NextResponse } from "next/server";
import { getCertificates } from "@/lib/certificates";

export async function GET() {
  try {
    return NextResponse.json(await getCertificates());
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
