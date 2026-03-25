import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function jsonError(message: string, status: number, code?: string) {
  return NextResponse.json({ ok: false as const, error: { message, code: code ?? "ERROR" } }, { status });
}
