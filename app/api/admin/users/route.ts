import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return NextResponse.json(
      { message: guard.message },
      { status: guard.status },
    );
  }

  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection("users").get();
    type UserDoc = {
      email?: string;
      name?: string;
      role?: "admin" | "user";
      createdAt?: unknown;
    };

    const users = snapshot.docs
      .map((doc) => ({
        uid: doc.id,
        ...(doc.data() as UserDoc),
      }))
      .sort((a: { name?: string }, b: { name?: string }) =>
        (a.name ?? "").localeCompare(b.name ?? ""),
      );

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { message: "Error interno cargando usuarios" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return NextResponse.json(
      { message: guard.message },
      { status: guard.status },
    );
  }

  const body = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
    role?: "admin" | "user";
  };

  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const name = body.name?.trim();
  const role: "admin" | "user" = body.role === "admin" ? "admin" : "user";

  if (!email || !password || !name) {
    return NextResponse.json(
      { message: "email, password y name son obligatorios" },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { message: "La contrasena debe tener al menos 6 caracteres" },
      { status: 400 },
    );
  }

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const created = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
      disabled: false,
    });

    await adminDb.collection("users").doc(created.uid).set({
      email,
      name,
      role,
      createdAt: new Date(),
    });

    return NextResponse.json({ uid: created.uid }, { status: 201 });
  } catch (error) {
    const code = (error as { code?: string }).code;

    if (code === "auth/email-already-exists") {
      return NextResponse.json(
        { message: "Este correo ya esta registrado" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "No se pudo crear el usuario" },
      { status: 500 },
    );
  }
}
