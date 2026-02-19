"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { generatePDF } from "@/lib/generate-pdf"
import { Download, Plus, Trash2 } from "lucide-react"

function parseNum(v: string) {
  const cleaned = v.replace(/\./g, "").replace(",", ".")
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

function formatEur(n: number) {
  if (n === 0) return ""
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface InvoiceItem {
  matricula: string
  descripcion: string
  total: string
}

export function InvoiceMamen() {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nFactura: "",
    cliente: "",
    fecha: new Date().toLocaleDateString("es-ES"),
    nifCifNie: "",
    direccion: "",
    telefonos: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    { matricula: "", descripcion: "", total: "" },
  ])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const addItem = () => {
    setItems((prev) => [...prev, { matricula: "", descripcion: "", total: "" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handleDownload = async () => {
    if (!invoiceRef.current) return
    setLoading(true)
    try {
      await generatePDF(invoiceRef.current, `factura-mamen-${form.nFactura || "sin-numero"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Formulario */}
      <div className="w-full shrink-0 rounded-lg border bg-background p-5 lg:w-[380px]">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Datos de la factura
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="m-nfactura">N. Factura</Label>
            <Input
              id="m-nfactura"
              placeholder="T820/170226"
              value={form.nFactura}
              onChange={(e) => updateField("nFactura", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="m-fecha">Fecha</Label>
            <Input
              id="m-fecha"
              value={form.fecha}
              onChange={(e) => updateField("fecha", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="m-cliente">Cliente</Label>
            <Input
              id="m-cliente"
              placeholder="Nombre completo del cliente"
              value={form.cliente}
              onChange={(e) => updateField("cliente", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="m-nif">NIF/CIF/NIE</Label>
            <Input
              id="m-nif"
              placeholder="Z1593207W"
              value={form.nifCifNie}
              onChange={(e) => updateField("nifCifNie", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="m-direccion">Direccion</Label>
            <Input
              id="m-direccion"
              placeholder="Calle, numero, CP, ciudad"
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="m-telefonos">Telefonos</Label>
            <Input
              id="m-telefonos"
              placeholder="(+34) 643 248 794"
              value={form.telefonos}
              onChange={(e) => updateField("telefonos", e.target.value)}
            />
          </div>

          <div className="mt-2 border-t pt-3">
            <div className="mb-2 flex items-center justify-between">
              <Label>Items de factura</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="size-3.5" />
                Agregar
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="mb-3 rounded-md border bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Item {idx + 1}
                  </span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Matricula"
                    value={item.matricula}
                    onChange={(e) => updateItem(idx, "matricula", e.target.value)}
                  />
                  <Input
                    placeholder="Descripcion"
                    value={item.descripcion}
                    onChange={(e) => updateItem(idx, "descripcion", e.target.value)}
                  />
                  <Input
                    placeholder="Total (ej: 830,00)"
                    value={item.total}
                    onChange={(e) => updateItem(idx, "total", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleDownload} disabled={loading} className="mt-2 w-full">
            <Download className="size-4" />
            {loading ? "Generando..." : "Descargar Factura PDF"}
          </Button>
        </div>
      </div>

      {/* Vista previa */}
      <div className="flex-1 overflow-auto">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Vista previa</p>
        <div className="rounded-lg border bg-background shadow-sm">
          <div
            ref={invoiceRef}
            className="mx-auto bg-[#ffffff] p-10 text-[#000000]"
            style={{ width: "210mm", minHeight: "297mm", fontFamily: "Arial, sans-serif" }}
          >
            {/* Encabezado empresa */}
            <div className="mb-1 text-center">
              <p className="text-sm font-bold tracking-wide text-[#000000]">
                MAMEN AUTOMOTIVE GROUP SOCIEDAD LIMITADA
              </p>
              <p className="text-xs text-[#000000]">
                C/LOS PINOS 13, ALCALA DE HENARES
              </p>
              <p className="mt-0.5 inline-block border border-[#000000] px-3 py-0.5 text-xs text-[#000000]">
                MADRID, 28808
              </p>
              <p className="mt-1 text-xs font-bold text-[#000000]">CIF B75888770</p>
            </div>

            {/* Numero factura */}
            <div className="mb-4 mt-4 flex justify-end">
              <p className="text-sm font-bold text-[#000000]">
                FACTURA N.: {form.nFactura || "___________"}
              </p>
            </div>

            {/* Datos del cliente */}
            <table className="mb-6 w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td className="w-20 border border-[#000000] bg-[#f0f0f0] px-2 py-1.5 font-bold text-[#000000]">
                    Cliente:
                  </td>
                  <td className="border border-[#000000] px-2 py-1.5 text-[#000000]">
                    {form.cliente || ""}
                  </td>
                  <td className="border border-[#000000] px-2 py-1.5 text-right text-[#000000]">
                    <span className="font-bold">Fecha: </span>
                    {form.fecha}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#000000] bg-[#f0f0f0] px-2 py-1.5 font-bold text-[#000000]" />
                  <td className="border border-[#000000] px-2 py-1.5 text-[#000000]" />
                  <td className="border border-[#000000] px-2 py-1.5 text-right text-[#000000]">
                    <span className="font-bold">NIF/CIF/NIE: </span>
                    {form.nifCifNie}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#000000] bg-[#f0f0f0] px-2 py-1.5 font-bold text-[#000000]">
                    Direccion:
                  </td>
                  <td colSpan={2} className="border border-[#000000] px-2 py-1.5 text-[#000000]">
                    {form.direccion || ""}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#000000] bg-[#f0f0f0] px-2 py-1.5 font-bold text-[#000000]">
                    Telefonos:
                  </td>
                  <td colSpan={2} className="border border-[#000000] px-2 py-1.5 text-[#000000]">
                    {form.telefonos || ""}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tabla de items */}
            <table className="mb-6 w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="bg-[#4a4a4a] text-[#ffffff]">
                  <th className="border border-[#000000] px-2 py-1.5 text-left font-bold" style={{ width: "100px" }}>
                    MATRICULA
                  </th>
                  <th className="border border-[#000000] px-3 py-1.5 text-center font-bold">
                    DESCRIPCION
                  </th>
                  <th className="border border-[#000000] px-3 py-1.5 text-right font-bold" style={{ width: "100px" }}>
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-[#000000] px-2 py-3 text-center font-bold text-[#000000]">
                      {item.matricula}
                    </td>
                    <td className="border border-[#000000] px-3 py-3 text-center text-[#000000]">
                      {item.descripcion}
                    </td>
                    <td className="border border-[#000000] px-3 py-3 text-right text-[#000000]">
                      {parseNum(item.total) > 0 ? `${formatEur(parseNum(item.total))} \u20AC` : ""}
                    </td>
                  </tr>
                ))}
                {/* Relleno para que se vea como la plantilla original */}
                {items.length < 3 &&
                  Array.from({ length: 3 - items.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td className="border border-[#000000] px-2 py-3 text-[#000000]" />
                      <td className="border border-[#000000] px-3 py-3 text-[#000000]" />
                      <td className="border border-[#000000] px-3 py-3 text-[#000000]" />
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Nota legal REBU */}
            <div className="mb-16 max-w-[60%] text-[9px] leading-tight text-[#000000]">
              <p>
                OPERACION SUJETA A REBU SEGUN ARTICULO 137 Y 138 DE LA LEY 37/1992
                DE 28 DE DICIEMBRE
              </p>
            </div>

            {/* Firma */}
            <div className="flex justify-end">
              <div className="text-center text-[9px] text-[#000000]">
                <p className="mb-0.5 font-bold">MAMEN AUTOMOTIVE GROUP S.L.</p>
                <p>CIF. B75888770</p>
                <p>Centro Comercial, Los Pinos local 13</p>
                <p>Alcala de Henares</p>
                <p>28813 MADRID</p>
                <div className="my-4 border-b border-[#000000]" style={{ width: "180px" }} />
                <p className="text-[10px]">Maria del Carmen Valverde Sanchez</p>
                <p className="mt-1 text-[10px]">DNI 02650342Y</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
