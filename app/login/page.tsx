"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot-password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        router.push("/");
      } else {
        // Forgot password
        const response = await fetch("/api/password-reset-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "Error al solicitar reset");
        }

        setSuccessMessage(
          "Solicitud enviada. Los administradores la revisarán pronto.",
        );
        setEmail("");
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const errorMsg = err instanceof Error ? err.message : "Ocurrio un error";

      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No se encontro un usuario con ese correo");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Correo o contrasena incorrectos");
          break;
        case "auth/invalid-email":
          setError("El correo no es valido");
          break;
        default:
          setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-lg bg-primary">
            <FileText className="size-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">
            {mode === "login" ? "Iniciar Sesion" : "Recuperar Contraseña"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Accede al generador de facturas"
              : "Solicita un reset de contraseña"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {mode === "login" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contrasena</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            {successMessage && (
              <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {successMessage}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "login" ? "Iniciar Sesion" : "Enviar Solicitud"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  {"¿Olvidaste tu contraseña? "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot-password");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Solicitar reset
                  </button>
                </>
              ) : (
                <>
                  {"¿Ya tienes contraseña? "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Inicia Sesion
                  </button>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
