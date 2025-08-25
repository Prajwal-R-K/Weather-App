import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function exportElementPdf(el: HTMLElement, filename: string){
  // Render the element to canvas at higher scale for clarity
  const styles = getComputedStyle(el)
  const bg = styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)'
    ? styles.backgroundColor
    : getComputedStyle(document.body).backgroundColor || '#0b1220'
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: bg,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
  })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24
  const maxW = pageWidth - margin * 2
  const maxH = pageHeight - margin * 2

  const imgW = canvas.width
  const imgH = canvas.height
  // scale to fit within A4 page while preserving aspect
  const ratio = Math.min(maxW / imgW, maxH / imgH)
  const renderW = imgW * ratio
  const renderH = imgH * ratio
  const x = (pageWidth - renderW) / 2
  const y = (pageHeight - renderH) / 2

  pdf.addImage(imgData, 'PNG', x, y, renderW, renderH, undefined, 'FAST')
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}
