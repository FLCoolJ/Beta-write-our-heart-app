// PDF generation for card assembly using HTML/CSS
export interface CardData {
  heartData: {
    name: string
    relationship: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  occasion: string
  poetry: string
  artworkUrl?: string
  artworkFile?: File
}

export interface BatchCardData {
  cards: CardData[]
  batchId: string
  createdAt: string
}

// Generate HTML template for individual card (4 pages)
export function generateCardHTML(cardData: CardData): string {
  const { heartData, occasion, poetry, artworkUrl } = cardData

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${heartData.name} - ${occasion} Card</title>
  <style>
    @page { 
      size: 5in 7in; 
      margin: 0; 
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Cormorant Garamond', serif;
    }
    
    .page {
      width: 5in;
      height: 7in;
      page-break-after: always;
      position: relative;
      box-sizing: border-box;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* Page 1: Front Cover */
    .page-1 {
      background-image: url('${artworkUrl || "/placeholder-artwork.jpg"}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .artwork-placeholder {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: #666;
      text-align: center;
      flex-direction: column;
    }
    
    /* Page 2: Inside Left (Blank) */
    .page-2 {
      background: #fefefe;
      padding: 0.5in;
    }
    
    .blank-page {
      width: 100%;
      height: 100%;
      border: 1px dashed #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ccc;
      font-size: 14px;
      font-style: italic;
    }
    
    /* Page 3: Inside Right (Poetry) */
    .page-3 {
      background: #fefefe;
      padding: 0.5in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .poetry-container {
      text-align: center;
      line-height: 1.8;
      font-size: 11pt;
      color: #333;
      font-style: italic;
      max-width: 3.5in;
    }
    
    /* Page 4: Back Cover */
    .page-4 {
      background: #fefefe;
      padding: 0.5in;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding-bottom: 1in;
    }
    
    .logo-container {
      text-align: center;
    }
    
    .logo {
      width: 60px;
      height: 60px;
      margin-bottom: 10px;
    }
    
    .brand-text {
      font-family: 'Playfair Display', serif;
      font-size: 12px;
      color: #666;
      font-weight: 400;
    }
    
    /* Print job info for Catprint */
    .print-info {
      position: absolute;
      top: 0.1in;
      right: 0.1in;
      font-size: 8px;
      color: #999;
      background: rgba(255,255,255,0.8);
      padding: 2px 4px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <!-- Page 1: Front Cover -->
  <div class="page page-1">
    <div class="print-info">
      ${heartData.name} - ${occasion}
    </div>
    ${!artworkUrl ? `
      <div class="artwork-placeholder">
        <div>Midjourney Artwork</div>
        <div style="font-size: 16px; margin-top: 10px;">${occasion} for ${heartData.name}</div>
      </div>
    ` : ''}
  </div>
  
  <!-- Page 2: Inside Left (Blank) -->
  <div class="page page-2">
    <div class="blank-page">
      Space for personal notes
    </div>
  </div>
  
  <!-- Page 3: Inside Right (Poetry) -->
  <div class="page page-3">
    <div class="poetry-container">
      ${poetry.replace(/\n/g, "<br>")}
    </div>
  </div>
  
  <!-- Page 4: Back Cover -->
  <div class="page page-4">
    <div class="logo-container">
      <img src="/logo.png" alt="Write Our Heart" class="logo" />
      <div class="brand-text">Write Our Heart</div>
    </div>
  </div>
</body>
</html>
  `
}

// Generate batch HTML for multiple cards (for Catprint submission)
export function generateBatchHTML(batchData: BatchCardData): string {
  const cardsHTML = batchData.cards.map(card => generateCardHTML(card)).join('\n')
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Batch ${batchData.batchId} - ${batchData.cards.length} Cards</title>
  <style>
    @page { 
      size: 5in 7in; 
      margin: 0; 
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Cormorant Garamond', serif;
    }
    
    .batch-separator {
      page-break-before: always;
      height: 7in;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      box-sizing: border-box;
      padding: 1in;
      text-align: center;
    }
    
    .batch-info {
      font-family: 'Arial', sans-serif;
      color: #495057;
    }
    
    .batch-title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .batch-details {
      font-size: 14px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <!-- Batch Cover Page -->
  <div class="batch-separator">
    <div class="batch-info">
      <div class="batch-title">Write Our Heart</div>
      <div class="batch-title">Print Batch ${batchData.batchId}</div>
      <div class="batch-details">
        <p><strong>Cards in batch:</strong> ${batchData.cards.length}</p>
        <p><strong>Created:</strong> ${new Date(batchData.createdAt).toLocaleDateString()}</p>
        <p><strong>Recipients:</strong></p>
        <ul style="text-align: left; display: inline-block;">
          ${batchData.cards.map(card => 
            `<li>${card.heartData.name} - ${card.occasion}</li>`
          ).join('')}
        </ul>
      </div>
    </div>
  </div>
  
  ${cardsHTML}
</body>
</html>
  `
}

// Generate filename for the batch
export function generateBatchFilename(batchData: BatchCardData): string {
  const timestamp = new Date().toISOString().slice(0, 10)
  return `WriteOurHeart_Batch_${batchData.batchId}_${timestamp}.pdf`
}

// Generate mailing labels CSV for Catprint
export function generateMailingLabelsCSV(batchData: BatchCardData): string {
  const headers = ["BatchID", "CardNumber", "Name", "Address", "City", "State", "ZipCode", "Occasion", "Date"]

  const rows = batchData.cards.map((card, index) => [
    batchData.batchId,
    (index + 1).toString(),
    card.heartData.name,
    card.heartData.address,
    card.heartData.city,
    card.heartData.state,
    card.heartData.zipCode,
    card.occasion,
    new Date().toISOString().slice(0, 10),
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  return csvContent
}

// Download file helper
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Convert HTML to PDF using browser's print functionality
export async function generatePDFFromHTML(html: string, filename: string): Promise<void> {
  // Open HTML in new window for printing
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error('Could not open print window')
  }
  
  printWindow.document.write(html)
  printWindow.document.close()
  
  // Wait for content to load
  await new Promise(resolve => {
    printWindow.onload = resolve
    setTimeout(resolve, 1000) // Fallback timeout
  })
  
  // Trigger print dialog
  printWindow.print()
  
  // Note: User will need to "Save as PDF" in the print dialog
  alert(`Print dialog opened for ${filename}. Please select "Save as PDF" as your printer destination.`)
}
