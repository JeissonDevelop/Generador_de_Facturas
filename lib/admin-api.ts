import { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export interface AdminRequestContext {
  uid: string;
}

export async function requireAdmin(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, message: "No autorizado" };
  }

  const token = header.slice(7);

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const decoded = await adminAuth.verifyIdToken(token);
    const requesterDoc = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();
    const requesterRole = requesterDoc.exists
      ? (requesterDoc.data()?.role as "admin" | "user" | undefined)
      : undefined;

    console.log(
      `[requireAdmin] UID: ${decoded.uid}, Role: ${requesterRole}, DocExists: ${requesterDoc.exists}`,
    );

    if (requesterRole !== "admin") {
      return {
        ok: false as const,
        status: 403,
        message: requesterDoc.exists
          ? `Tu usuario tiene rol "${requesterRole}", solo admin puede acceder.`
          : "No encontré tu perfil de usuario en Firestore. Por favor cierra sesión y vuelve a entrar.",
      };
    }

    return {
      ok: true as const,
      context: { uid: decoded.uid } satisfies AdminRequestContext,
    };
  } catch (error) {
    console.error("[requireAdmin] Error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Faltan variables FIREBASE_PROJECT_ID")
    ) {
      return {
        ok: false as const,
        status: 503,
        message:
          "Servidor sin configurar para admin.\n\nPara configurar:\n1. Ve a https://console.firebase.google.com/ > generator-factu > Settings > Service Accounts\n2. Click 'Generate New Private Key' y descarga el JSON\n3. Añade a .env.local:\n   FIREBASE_PROJECT_ID=generator-factu\n   FIREBASE_CLIENT_EMAIL=[client_email del JSON]\n   FIREBASE_PRIVATE_KEY=[private_key escapada con \\n]\n4. Reinicia el servidor",
      };
    }

    if (error instanceof Error && error.message.includes("verifyIdToken")) {
      return {
        ok: false as const,
        status: 401,
        message: "Token no válido. Intenta cerrar sesión y entrar de nuevo.",
      };
    }

    return {
      ok: false as const,
      status: 401,
      message: `No autorizado: ${error instanceof Error ? error.message : "Error desconocido"}`,
    };
  }
}
