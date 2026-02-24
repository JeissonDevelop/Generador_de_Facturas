import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/admin-api";

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
    const snapshot = await adminDb
      .collection("password-reset-requests")
      .orderBy("createdAt", "desc")
      .get();

    const requests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("[admin/password-reset-requests GET]", error);
    return NextResponse.json(
      { message: "Error al obtener solicitudes" },
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

  try {
    const body = (await request.json()) as {
      requestId?: string;
      action?: "approve" | "reject";
      newPassword?: string;
    };

    if (!body.requestId || !body.action) {
      return NextResponse.json(
        { message: "Parámetros inválidos" },
        { status: 400 },
      );
    }

    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();

    // Get the request
    const requestDoc = await adminDb
      .collection("password-reset-requests")
      .doc(body.requestId)
      .get();

    if (!requestDoc.exists) {
      return NextResponse.json(
        { message: "Solicitud no encontrada" },
        { status: 404 },
      );
    }

    const requestData = requestDoc.data()!;

    if (body.action === "approve") {
      if (!body.newPassword || body.newPassword.length < 6) {
        return NextResponse.json(
          { message: "Contraseña debe tener mínimo 6 caracteres" },
          { status: 400 },
        );
      }

      // Update user password
      await adminAuth.updateUser(requestData.uid, {
        password: body.newPassword,
      });

      // Update request status
      await adminDb
        .collection("password-reset-requests")
        .doc(body.requestId)
        .update({
          status: "approved",
          updatedAt: new Date(),
          approvedBy: guard.context.uid,
          approvedAt: new Date(),
        });

      return NextResponse.json(
        { message: "Contraseña actualizada" },
        { status: 200 },
      );
    } else if (body.action === "reject") {
      await adminDb
        .collection("password-reset-requests")
        .doc(body.requestId)
        .update({
          status: "rejected",
          updatedAt: new Date(),
          rejectedBy: guard.context.uid,
          rejectedAt: new Date(),
        });

      return NextResponse.json(
        { message: "Solicitud rechazada" },
        { status: 200 },
      );
    }

    return NextResponse.json({ message: "Acción inválida" }, { status: 400 });
  } catch (error) {
    console.error("[admin/password-reset-requests POST]", error);
    return NextResponse.json(
      { message: "Error al procesar solicitud" },
      { status: 500 },
    );
  }
}
