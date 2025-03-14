import type { Convict } from "@/lib/storage"
import { formatDate } from "@/lib/utils"

/**
 * Generate PDF content for a suspect record
 */
export const generatePDF = async (convict: Convict) => {
  // Dynamically import jspdf to avoid SSR issues
  const { jsPDF } = await import("jspdf")
  // Import autoTable plugin for better table formatting
  const autoTable = (await import("jspdf-autotable")).default

  try {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("ExBASe - Suspect Record", 105, 15, { align: "center" })

    // Add creation date
    doc.setFontSize(10)
    doc.text(`Generated on: ${formatDate(Date.now())}`, 195, 10, { align: "right" })

    // Add suspect image if available
    if (convict.image) {
      try {
        doc.addImage(convict.image, "JPEG", 15, 30, 50, 50)
      } catch (error) {
        console.error("Error adding image to PDF:", error)
      }
    }

    // Add suspect details
    doc.setFontSize(16)
    doc.text("Personal Information", 80, 35)

    // Create a table for personal information
    autoTable(doc, {
      startY: 40,
      head: [["Field", "Value"]],
      body: [
        ["Name", convict.name],
        ["Phone", convict.phone],
        ["Category", convict.category || "N/A"],
        ["Record Created", convict.createdAt ? formatDate(convict.createdAt) : "N/A"],
      ],
      margin: { left: 80 },
      tableWidth: 100,
    })

    // Add tags if available
    if (convict.tags && convict.tags.length > 0) {
      doc.setFontSize(16)
      doc.text("Tags", 15, 100)

      doc.setFontSize(12)
      doc.text(convict.tags.join(", "), 15, 110)
    }

    // Add case details
    doc.setFontSize(16)
    doc.text("Case Details", 15, 130)

    // Split case details into lines to fit the page
    const splitText = doc.splitTextToSize(convict.caseDetails, 180)
    doc.setFontSize(12)
    doc.text(splitText, 15, 140)

    // Add footer
    doc.setFontSize(10)
    doc.text("CONFIDENTIAL - ExBASe", 105, 285, { align: "center" })

    // Save the PDF with the suspect's name
    doc.save(`suspect-record-${convict.name.replace(/\s+/g, "-").toLowerCase()}.pdf`)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}

/**
 * Generate a batch PDF for multiple suspect records
 */
export const generateBatchPDF = async (convicts: Convict[]) => {
  if (convicts.length === 0) return false

  // Dynamically import jspdf to avoid SSR issues
  const { jsPDF } = await import("jspdf")
  // Import autoTable plugin for better table formatting
  const autoTable = (await import("jspdf-autotable")).default

  try {
    // Create a new PDF document
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(20)
    doc.text("ExBASe - Suspect Records Report", 105, 15, { align: "center" })

    // Add creation date
    doc.setFontSize(10)
    doc.text(`Generated on: ${formatDate(Date.now())}`, 195, 10, { align: "right" })
    doc.text(`Total Records: ${convicts.length}`, 195, 15, { align: "right" })

    // Create a table for all suspects
    const tableData = convicts.map((convict) => [
      convict.name,
      convict.phone,
      convict.category || "N/A",
      convict.createdAt ? formatDate(convict.createdAt) : "N/A",
      (convict.tags || []).join(", "),
    ])

    autoTable(doc, {
      startY: 25,
      head: [["Name", "Phone", "Category", "Created", "Tags"]],
      body: tableData,
      didDrawPage: (data) => {
        // Add footer on each page
        doc.setFontSize(10)
        doc.text("CONFIDENTIAL - ExBASe", 105, 285, { align: "center" })
        doc.text(`Page ${doc.getNumberOfPages()}`, 195, 285, { align: "right" })
      },
    })

    // Save the PDF
    doc.save(`suspect-records-report-${new Date().toISOString().slice(0, 10)}.pdf`)

    return true
  } catch (error) {
    console.error("Error generating batch PDF:", error)
    return false
  }
}

