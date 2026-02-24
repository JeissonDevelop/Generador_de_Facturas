"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { InvoiceMamen } from "@/components/invoice-form-mamen";
import { InvoiceDrdl } from "@/components/invoice-form-drdl";
import { InvoiceWinicar } from "@/components/invoice-form-winicar";
import { FileText, LogOut, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Company = "mamen" | "drdl" | "winicar";

export default function Home() {
  const { user, userData, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<Company | "">("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <FileText className="size-6 text-foreground" />
            <h1 className="text-lg font-semibold text-foreground">
              Generador de Facturas
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ShieldCheck className="mr-1.5 size-4" />
                  <span className="hidden sm:inline">Administracion</span>
                </Button>
              </Link>
            )}
            <span className="hidden text-sm text-muted-foreground sm:block">
              {userData?.name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="ml-1.5 hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Selecciona la empresa
          </label>
          <Select
            value={selectedCompany}
            onValueChange={(value) => setSelectedCompany(value as Company)}
          >
            <SelectTrigger className="w-full max-w-md bg-background">
              <SelectValue placeholder="Elige una empresa..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mamen">MAMEN AUTOMOTIVE GROUP S.L.</SelectItem>
              <SelectItem value="drdl">
                TU SOLUCION ADMINISTRATIVA DRDL, S.L.P.
              </SelectItem>
              <SelectItem value="winicar">WINICAR ESPAÑA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedCompany === "" && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-background py-20">
            <FileText className="mb-4 size-12 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              Selecciona una empresa para comenzar
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              El formulario y la plantilla de factura se cargan automaticamente
            </p>
          </div>
        )}

        {selectedCompany === "mamen" && <InvoiceMamen />}
        {selectedCompany === "drdl" && <InvoiceDrdl />}
        {selectedCompany === "winicar" && <InvoiceWinicar />}
      </div>
    </main>
  );
}
