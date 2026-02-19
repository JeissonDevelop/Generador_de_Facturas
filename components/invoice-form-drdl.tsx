"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generatePDF } from "@/lib/generate-pdf";
import { Download, Plus, Trash2 } from "lucide-react";

interface InvoiceItem {
  descripcion: string;
  importe: string;
}

function parseNum(v: string) {
  // Acepta coma como decimal: "1.234,56" -> 1234.56
  const cleaned = v.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatEur(n: number) {
  if (n === 0) return "0,00";
  return n.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function InvoiceDrdl() {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nFactura: "",
    fecha: new Date().toLocaleDateString("es-ES"),
    cliente: "",
    idCliente: "",
    direccion: "",
    matricula: "",
    modelo: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { descripcion: "", importe: "" },
  ]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { descripcion: "", importe: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const total = items.reduce((sum, item) => sum + parseNum(item.importe), 0);

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    setLoading(true);
    try {
      await generatePDF(
        invoiceRef.current,
        `factura-drdl-${form.nFactura || "sin-numero"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const BLUE = "#0099CC";

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
              <Label htmlFor="d-nfactura">N. de Factura</Label>
              <Input
                id="d-nfactura"
                placeholder="A157"
                value={form.nFactura}
                onChange={(e) => updateField("nFactura", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="d-fecha">Fecha</Label>
              <Input
                id="d-fecha"
                value={form.fecha}
                onChange={(e) => updateField("fecha", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="d-cliente">Cliente</Label>
            <Input
              id="d-cliente"
              placeholder="CARS COMPANY GMR, S.L."
              value={form.cliente}
              onChange={(e) => updateField("cliente", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="d-idcliente">ID del Cliente (CIF)</Label>
            <Input
              id="d-idcliente"
              placeholder="B75312512"
              value={form.idCliente}
              onChange={(e) => updateField("idCliente", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="d-direccion">Direccion</Label>
            <Input
              id="d-direccion"
              placeholder="Calle, numero, CP, ciudad"
              value={form.direccion}
              onChange={(e) => updateField("direccion", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="d-matricula">Matricula</Label>
              <Input
                id="d-matricula"
                placeholder="3302KJH"
                value={form.matricula}
                onChange={(e) => updateField("matricula", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="d-modelo">Modelo</Label>
              <Input
                id="d-modelo"
                placeholder="TOYOTA AURIS"
                value={form.modelo}
                onChange={(e) => updateField("modelo", e.target.value)}
              />
            </div>
          </div>

          <div className="mt-2 border-t pt-3">
            <div className="mb-2 flex items-center justify-between">
              <Label>Conceptos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
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
                    placeholder="Descripcion del concepto"
                    value={item.descripcion}
                    onChange={(e) =>
                      updateItem(idx, "descripcion", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Importe (ej: 64,47)"
                    value={item.importe}
                    onChange={(e) => updateItem(idx, "importe", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="text-sm font-semibold text-foreground">
                Total:
              </span>
              <span className="text-sm font-bold text-foreground">
                {formatEur(total)} {"\u20AC"}
              </span>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            disabled={loading}
            className="mt-2 w-full"
          >
            <Download className="size-4" />
            {loading ? "Generando..." : "Descargar Factura PDF"}
          </Button>
        </div>
      </div>

      {/* Vista previa */}
      <div className="flex-1 overflow-auto">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Vista previa
        </p>
        <div className="rounded-lg border bg-background shadow-sm">
          <div
            ref={invoiceRef}
            className="mx-auto bg-[#ffffff] p-10 text-[#000000]"
            style={{
              width: "210mm",
              minHeight: "297mm",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Cabecera */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-base font-bold" style={{ color: BLUE }}>
                  TU SOLUCION ADMINISTRATIVA DRDL, S
                </p>
                <p className="text-xs text-[#000000]">B-22525505</p>
                <p className="text-xs text-[#000000]">
                  {"C/Los Emilios, 6-2\u00B04"}
                </p>
                <p className="text-xs text-[#000000]">
                  03183 Torrevieja (Alicante)
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: BLUE }}>
                FACTURA
              </p>
            </div>

            {/* N. Factura y Fecha */}
            <div className="mb-3 flex justify-end">
              <table className="text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th
                      className="border px-4 py-1.5 text-center align-middle font-bold text-[#ffffff]"
                      style={{ backgroundColor: BLUE, borderColor: BLUE }}
                    >
                      N. DE FACTURA
                    </th>
                    <th
                      className="border px-4 py-1.5 text-center align-middle font-bold text-[#ffffff]"
                      style={{ backgroundColor: BLUE, borderColor: BLUE }}
                    >
                      FECHA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#cccccc] px-4 py-1.5 text-center align-middle font-bold text-[#000000]">
                      {form.nFactura}
                    </td>
                    <td className="border border-[#cccccc] px-4 py-1.5 text-center align-middle text-[#000000]">
                      {form.fecha}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Facturar a + ID del cliente */}
            <div className="mb-2 flex">
              <div
                className="px-3 py-1 text-xs font-bold text-[#ffffff]"
                style={{ backgroundColor: BLUE }}
              >
                FACTURAR A
              </div>
              <div className="flex-1" />
              <div className="flex items-center">
                <span
                  className="px-3 py-1 text-xs font-bold text-[#ffffff]"
                  style={{ backgroundColor: BLUE }}
                >
                  ID. DEL CLIENTE
                </span>
              </div>
            </div>

            {/* Datos del cliente */}
            <div className="mb-4 text-xs text-[#000000]">
              <div className="mb-0.5 flex">
                <span className="w-24 font-bold" style={{ color: BLUE }}>
                  CLIENTE:
                </span>
                <span className="flex-1">{form.cliente}</span>
                <span className="inline-flex h-5.5 w-32 items-center justify-center border border-[#cccccc] px-2 py-0.5 text-center font-bold leading-none">
                  {form.idCliente}
                </span>
              </div>
              <div className="mb-0.5 flex">
                <span className="w-24 font-bold" style={{ color: BLUE }}>
                  DIRECCION:
                </span>
                <span className="flex-1">{form.direccion}</span>
              </div>
              <div className="mb-0.5 flex">
                <span className="w-24 font-bold" style={{ color: BLUE }}>
                  MATRICULA:
                </span>
                <span className="flex-1">{form.matricula}</span>
              </div>
              <div className="mb-0.5 flex">
                <span className="w-24 font-bold" style={{ color: BLUE }}>
                  MODELO:
                </span>
                <span className="flex-1">{form.modelo}</span>
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
                    className="border px-3 py-2 text-center align-middle font-bold text-[#ffffff]"
                    style={{ backgroundColor: BLUE, borderColor: BLUE }}
                  >
                    DESCRIPCION
                  </th>
                  <th
                    className="border px-3 py-2 text-center align-middle font-bold text-[#ffffff]"
                    style={{
                      backgroundColor: BLUE,
                      borderColor: BLUE,
                      width: "120px",
                    }}
                  >
                    IMPORTE
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border border-[#cccccc] px-3 py-2 text-center align-middle text-[#000000]">
                      {item.descripcion}
                    </td>
                    <td className="border border-[#cccccc] px-3 py-2 text-center align-middle text-[#000000]">
                      {parseNum(item.importe) > 0
                        ? formatEur(parseNum(item.importe))
                        : ""}
                    </td>
                  </tr>
                ))}
                {/* Filas vacias de relleno */}
                {items.length < 4 &&
                  Array.from({ length: 4 - items.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td className="border border-[#cccccc] px-3 py-2 text-center align-middle text-[#000000]">
                        &nbsp;
                      </td>
                      <td className="border border-[#cccccc] px-3 py-2 text-center align-middle text-[#000000]">
                        &nbsp;
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Total y mensaje */}
            <div className="flex items-center justify-between">
              <p className="text-sm italic" style={{ color: BLUE }}>
                Gracias por su confianza
              </p>
              <div className="flex items-center">
                <span
                  className="px-4 py-1.5 text-sm font-bold text-[#ffffff]"
                  style={{ backgroundColor: BLUE }}
                >
                  TOTAL
                </span>
                <span className="border border-[#cccccc] px-4 py-1.5 text-center text-sm font-bold text-[#000000]">
                  {formatEur(total)} {"\u20AC"}
                </span>
              </div>
            </div>

            {/* Pie de pagina */}
            <div className="mt-20 border-t border-[#cccccc] pt-3 text-center text-[8px] text-[#000000]">
              <p className="font-bold" style={{ color: BLUE }}>
                TU SOLUCION ADMINISTRATIVA DRDL, SLP
              </p>
              <p>B-22525505</p>
              <p>{"C/Los Emilios, 6 - 2\u00B0 4"}</p>
              <p>03183 TORREVIEJA (Alicante)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
