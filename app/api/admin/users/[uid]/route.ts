import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return NextResponse.json(
      { message: guard.message },
      { status: guard.status },
    );
  }

  const { uid } = await params;
  const body = (await request.json()) as {
    email?: string;
    name?: string;
    role?: "admin" | "user";
    password?: string;
  };

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const role = body.role;
  const password = body.password?.trim();

  if (!email && !name && !role && !password) {
    return NextResponse.json(
      { message: "Sin cambios para guardar" },
      { status: 400 },
    );
  }

  if (password && password.length < 6) {
    return NextResponse.json(
      { message: "La contrasena debe tener al menos 6 caracteres" },
      { status: 400 },
    );
  }

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const authUpdate: {
      email?: string;
      password?: string;
      displayName?: string;
    } = {};

    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;
    if (name) authUpdate.displayName = name;

    if (Object.keys(authUpdate).length > 0) {
      await adminAuth.updateUser(uid, authUpdate);
    }

    const firestoreUpdate: Record<string, unknown> = {};
    if (email) firestoreUpdate.email = email;
    if (name) firestoreUpdate.name = name;
    if (role) firestoreUpdate.role = role === "admin" ? "admin" : "user";

    if (Object.keys(firestoreUpdate).length > 0) {
      await adminDb
        .collection("users")
        .doc(uid)
        .set(firestoreUpdate, { merge: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/email-already-exists") {
      return NextResponse.json(
        { message: "Este correo ya esta registrado" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { message: "No se pudo actualizar el usuario" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return NextResponse.json(
      { message: guard.message },
      { status: guard.status },
    );
  }

  const { uid } = await params;

  if (uid === guard.context.uid) {
    return NextResponse.json(
      { message: "No puedes eliminar tu propio usuario admin" },
      { status: 400 },
    );
  }

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    await adminAuth.deleteUser(uid).catch(() => undefined);
    await adminDb
      .collection("users")
      .doc(uid)
      .delete()
      .catch(() => undefined);
  } catch {
    return NextResponse.json(
      { message: "No se pudo eliminar el usuario" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
