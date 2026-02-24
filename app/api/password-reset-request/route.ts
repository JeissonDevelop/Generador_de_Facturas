import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Email inválido" }, { status: 400 });
    }

    const adminDb = getAdminDb();

    // Check if user exists (optional - could allow any email)
    const usersRef = adminDb.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (userSnapshot.empty) {
      // Return success message even if user doesn't exist (security best practice)
      return NextResponse.json(
        {
          message:
            "Si existe una cuenta con este email, recibirás una solicitud",
        },
        { status: 200 },
      );
    }

    // Check if there's already a pending request
    const requestsRef = adminDb.collection("password-reset-requests");
    const pendingSnapshot = await requestsRef
      .where("email", "==", email)
      .where("status", "==", "pending")
      .get();

    if (!pendingSnapshot.empty) {
      return NextResponse.json(
        { message: "Ya tienes una solicitud pendiente" },
        { status: 400 },
      );
    }

    // Create password reset request
    await requestsRef.add({
      email,
      uid: userSnapshot.docs[0].id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { message: "Solicitud enviada a los administradores" },
      { status: 200 },
    );
  } catch (error) {
    console.error("[password-reset-request]", error);
    return NextResponse.json(
      { message: "Error al crear solicitud" },
      { status: 500 },
    );
  }
}
