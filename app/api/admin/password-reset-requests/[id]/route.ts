import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) {
    return NextResponse.json(
      { message: guard.message },
      { status: guard.status },
    );
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const adminDb = getAdminDb();

    // Check if request exists
    const doc = await adminDb
      .collection("password-reset-requests")
      .doc(id)
      .get();

    if (!doc.exists) {
      return NextResponse.json(
        { message: "Solicitud no encontrada" },
        { status: 404 },
      );
    }

    // Delete the request
    await adminDb.collection("password-reset-requests").doc(id).delete();

    return NextResponse.json(
      { message: "Solicitud eliminada" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[admin/password-reset-requests DELETE]", error);
    return NextResponse.json(
      { message: "Error al eliminar solicitud" },
      { status: 500 },
    );
  }
}
