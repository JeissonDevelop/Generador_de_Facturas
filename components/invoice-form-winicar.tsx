"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { generatePDF } from "@/lib/generate-pdf"
import { Download, Plus, Trash2 } from "lucide-react"

interface InvoiceItem {
  concepto: string
  cantidad: string
  precioUnitario: string
}

export function InvoiceWinicar() {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    nFactura: "",
    fecha: new Date().toLocaleDateString("es-ES"),
    cliente: "",
    cifNif: "",
    direccion: "",
    telefono: "",
    matricula: "",
    descripcionVehiculo: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    { concepto: "", cantidad: "1", precioUnitario: "" },
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
    setItems((prev) => [...prev, { concepto: "", cantidad: "1", precioUnitario: "" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const parseNum = (v: string) => {
    // Acepta coma como decimal: "1.234,56" -> 1234.56
    const cleaned = v.replace(/\./g, "").replace(",", ".")
    const n = parseFloat(cleaned)
    return isNaN(n) ? 0 : n
  }

  const getItemTotal = (item: InvoiceItem) => {
    return parseNum(item.cantidad) * parseNum(item.precioUnitario)
  }

  const subtotal = items.reduce((sum, item) => sum + getItemTotal(item), 0)
  const ivaAmount = subtotal * 0.21
  const totalFinal = subtotal + ivaAmount

  const formatEur = (n: number) => {
    if (n === 0) return "0,00"
    return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleDownload = async () => {
    if (!invoiceRef.current) return
    setLoading(true)
    try {
      await generatePDF(
        invoiceRef.current,
        `factura-winicar-${form.nFactura || "sin-numero"}`
      )
    } finally {
      setLoading(false)
    }
  }

  const GREEN = "#1a7a4c"
  const GREEN_LIGHT = "#e8f5ee"

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Formulario */}
      <div className="w-full shrink-0 rounded-lg border bg-background p-5 lg:w-[380px]">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Datos de la factura
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="w-nfactura">N. Factura</Label>
              <Input
                id="w-nfactura"
                placeholder="W-001"
                value={form.nFactura}
                onChange={(e) => updateField("nFactura", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="w-fecha">Fecha</Label>
              <Input
                id="w-fecha"
                value={form.fecha}
                onChange={(e) => updateField("fecha", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="w-cliente">Cliente</Label>
            <Input
              id="w-cliente"
              placeholder="Nombre del cliente"
              value={form.cliente}
              onChange={(e) => updateField("cliente", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-cif">CIF/NIF</Label>
            <Input
              id="w-cif"
              placeholder="B12345678"
              value={form.cifNif}
              onChange={(e) => updateField("cifNif", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-direccion">Direccion</Label>
            <Input
              id="w-direccion"
              placeholder="Calle, numero, CP, ciudad"
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-telefono">Telefono</Label>
            <Input
              id="w-telefono"
              placeholder="(+34) 600 000 000"
              value={form.telefono}
              onChange={(e) => updateField("telefono", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="w-matricula">Matricula</Label>
              <Input
                id="w-matricula"
                placeholder="1234ABC"
                value={form.matricula}
                onChange={(e) => updateField("matricula", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="w-vehiculo">Vehiculo</Label>
              <Input
                id="w-vehiculo"
                placeholder="Marca y modelo"
                value={form.descripcionVehiculo}
                onChange={(e) => updateField("descripcionVehiculo", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 border-t pt-3">
            <div className="mb-2 flex items-center justify-between">
              <Label>Conceptos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="size-3.5" />
                Agregar
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="mb-3 rounded-md border bg-muted/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Concepto {idx + 1}
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
                    placeholder="Concepto"
                    value={item.concepto}
                    onChange={(e) => updateItem(idx, "concepto", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cantidad"
                      value={item.cantidad}
                      onChange={(e) => updateItem(idx, "cantidad", e.target.value)}
                    />
                    <Input
                      placeholder="Precio unit."
                      value={item.precioUnitario}
                      onChange={(e) => updateItem(idx, "precioUnitario", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-2 flex flex-col gap-1 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">{formatEur(subtotal)} {"\u20AC"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA (21%):</span>
                <span className="text-foreground">{formatEur(ivaAmount)} {"\u20AC"}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground">{formatEur(totalFinal)} {"\u20AC"}</span>
              </div>
            </div>
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
            className="mx-auto bg-[#ffffff] text-[#000000]"
            style={{
              width: "210mm",
              minHeight: "297mm",
              fontFamily: "Arial, sans-serif",
              padding: "0",
            }}
          >
            {/* Barra superior verde */}
            <div style={{ backgroundColor: GREEN, height: "8px" }} />

            <div className="p-10">
              {/* Cabecera */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold" style={{ color: GREEN }}>
                    WINICAR ESPANA
                  </p>
                  <p className="mt-1 text-xs text-[#555555]">
                    Soluciones del sector automotriz
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: GREEN }}>
                    FACTURA
                  </p>
                  <div className="mt-2 text-xs text-[#000000]">
                    <p>
                      <span className="font-bold">N.:</span> {form.nFactura || "___"}
                    </p>
                    <p>
                      <span className="font-bold">Fecha:</span> {form.fecha}
                    </p>
                  </div>
                </div>
              </div>

              {/* Linea separadora */}
              <div className="mb-6" style={{ borderBottom: `2px solid ${GREEN}` }} />

              {/* Datos del cliente */}
              <div className="mb-6 flex gap-8">
                <div className="flex-1">
                  <p
                    className="mb-2 text-xs font-bold uppercase"
                    style={{ color: GREEN }}
                  >
                    Datos del cliente
                  </p>
                  <div className="rounded text-xs text-[#000000]" style={{ backgroundColor: GREEN_LIGHT, padding: "12px" }}>
                    <p className="mb-1">
                      <span className="font-bold">Cliente: </span>
                      {form.cliente}
                    </p>
                    <p className="mb-1">
                      <span className="font-bold">CIF/NIF: </span>
                      {form.cifNif}
                    </p>
                    <p className="mb-1">
                      <span className="font-bold">Direccion: </span>
                      {form.direccion}
                    </p>
                    <p>
                      <span className="font-bold">Telefono: </span>
                      {form.telefono}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <p
                    className="mb-2 text-xs font-bold uppercase"
                    style={{ color: GREEN }}
                  >
                    Datos del vehiculo
                  </p>
                  <div className="rounded text-xs text-[#000000]" style={{ backgroundColor: GREEN_LIGHT, padding: "12px" }}>
                    <p className="mb-1">
                      <span className="font-bold">Matricula: </span>
                      {form.matricula}
                    </p>
                    <p>
                      <span className="font-bold">Vehiculo: </span>
                      {form.descripcionVehiculo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de conceptos */}
              <table
                className="mb-6 w-full text-xs"
                style={{ borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                    <th
                      className="px-3 py-2 text-left font-bold text-[#ffffff]"
                      style={{ backgroundColor: GREEN }}
                    >
                      CONCEPTO
                    </th>
                    <th
                      className="px-3 py-2 text-center font-bold text-[#ffffff]"
                      style={{ backgroundColor: GREEN, width: "80px" }}
                    >
                      CANT.
                    </th>
                    <th
                      className="px-3 py-2 text-right font-bold text-[#ffffff]"
                      style={{ backgroundColor: GREEN, width: "110px" }}
                    >
                      PRECIO UNIT.
                    </th>
                    <th
                      className="px-3 py-2 text-right font-bold text-[#ffffff]"
                      style={{ backgroundColor: GREEN, width: "110px" }}
                    >
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const itemTotal = getItemTotal(item)
                    return (
                      <tr
                        key={idx}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : GREEN_LIGHT,
                        }}
                      >
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-[#000000]">
                          {item.concepto}
                        </td>
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-center text-[#000000]">
                          {item.cantidad}
                        </td>
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-right text-[#000000]">
                          {parseNum(item.precioUnitario) > 0
                            ? `${formatEur(parseNum(item.precioUnitario))} \u20AC`
                            : ""}
                        </td>
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-right font-medium text-[#000000]">
                          {itemTotal > 0 ? `${formatEur(itemTotal)} \u20AC` : ""}
                        </td>
                      </tr>
                    )
                  })}
                  {/* Filas vacias de relleno */}
                  {items.length < 4 &&
                    Array.from({ length: 4 - items.length }).map((_, idx) => (
                      <tr
                        key={`empty-${idx}`}
                        style={{
                          backgroundColor:
                            (items.length + idx) % 2 === 0 ? "#ffffff" : GREEN_LIGHT,
                        }}
                      >
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-[#000000]" />
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-[#000000]" />
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-[#000000]" />
                        <td className="border-b border-[#e0e0e0] px-3 py-3 text-[#000000]" />
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Totales */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between border-b border-[#e0e0e0] px-3 py-2 text-xs text-[#000000]">
                    <span className="font-medium">Subtotal</span>
                    <span>{formatEur(subtotal)} {"\u20AC"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e0e0e0] px-3 py-2 text-xs text-[#000000]">
                    <span className="font-medium">IVA (21%)</span>
                    <span>{formatEur(ivaAmount)} {"\u20AC"}</span>
                  </div>
                  <div
                    className="flex justify-between px-3 py-2 text-sm font-bold text-[#ffffff]"
                    style={{ backgroundColor: GREEN }}
                  >
                    <span>TOTAL</span>
                    <span>{formatEur(totalFinal)} {"\u20AC"}</span>
                  </div>
                </div>
              </div>

              {/* Pie de pagina */}
              <div className="mt-20 border-t border-[#e0e0e0] pt-4 text-center text-[8px] text-[#888888]">
                <p className="font-bold" style={{ color: GREEN }}>
                  WINICAR ESPANA
                </p>
                <p>Gracias por confiar en nuestros servicios</p>
              </div>
            </div>

            {/* Barra inferior verde */}
            <div
              style={{
                backgroundColor: GREEN,
                height: "8px",
                marginTop: "auto",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
