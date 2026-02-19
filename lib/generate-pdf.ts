import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const PDF_SAFE_THEME_VARIABLES: Record<string, string> = {
  "--background": "#ffffff",
  "--foreground": "#171717",
  "--card": "#ffffff",
  "--card-foreground": "#171717",
  "--popover": "#ffffff",
  "--popover-foreground": "#171717",
  "--primary": "#262626",
  "--primary-foreground": "#fafafa",
  "--secondary": "#f5f5f5",
  "--secondary-foreground": "#262626",
  "--muted": "#f5f5f5",
  "--muted-foreground": "#737373",
  "--accent": "#f5f5f5",
  "--accent-foreground": "#262626",
  "--destructive": "#dc2626",
  "--destructive-foreground": "#ffffff",
  "--border": "#e5e5e5",
  "--input": "#e5e5e5",
  "--ring": "#a3a3a3",
  "--sidebar": "#fafafa",
  "--sidebar-foreground": "#171717",
  "--sidebar-primary": "#262626",
  "--sidebar-primary-foreground": "#fafafa",
  "--sidebar-accent": "#f5f5f5",
  "--sidebar-accent-foreground": "#262626",
  "--sidebar-border": "#e5e5e5",
  "--sidebar-ring": "#a3a3a3",
};

export async function generatePDF(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const pdfTargetAttribute = "data-pdf-capture-target";
  element.setAttribute(pdfTargetAttribute, "true");
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      onclone: (clonedDocument) => {
        clonedDocument.documentElement.classList.remove("dark");

        for (const [variableName, variableValue] of Object.entries(
          PDF_SAFE_THEME_VARIABLES,
        )) {
          clonedDocument.documentElement.style.setProperty(
            variableName,
            variableValue,
          );
        }

        const clonedTarget = clonedDocument.querySelector<HTMLElement>(
          `[${pdfTargetAttribute}="true"]`,
        );

        if (clonedTarget) {
          clonedTarget.style.backgroundColor = "#ffffff";
          clonedTarget.style.color = "#171717";
        }
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio,
    );
    pdf.save(`${filename}.pdf`);
  } finally {
    element.removeAttribute(pdfTargetAttribute);
  }
}
