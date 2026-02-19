"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InvoiceMamen } from "@/components/invoice-form-mamen"
import { InvoiceDrdl } from "@/components/invoice-form-drdl"
import { InvoiceWinicar } from "@/components/invoice-form-winicar"
import { FileText } from "lucide-react"

type Company = "mamen" | "drdl" | "winicar"

export default function Home() {
  const [selectedCompany, setSelectedCompany] = useState<Company | "">("")

  return (
    <main className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6">
          <FileText className="size-6 text-foreground" />
          <h1 className="text-lg font-semibold text-foreground">
            Generador de Facturas
          </h1>
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
              <SelectItem value="mamen">
                MAMEN AUTOMOTIVE GROUP S.L.
              </SelectItem>
              <SelectItem value="drdl">
                TU SOLUCION ADMINISTRATIVA DRDL, S.L.P.
              </SelectItem>
              <SelectItem value="winicar">WINICAR ESPANA</SelectItem>
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
  )
}
