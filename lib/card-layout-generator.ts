// Simple card layout generator without Canva dependency
export interface CardLayoutData {
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
  artworkUrl: string
  cardId: string
}

// Generate HTML template for a complete greeting card (4 pages)
export function generateCardLayout(cardData: CardLayoutData): string {
  const { heartData, occasion, poetry, artworkUrl, cardId } = cardData

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
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Georgia', serif;
      line-height: 1.4;
    }
    
    .page {
      width: 5in;
      height: 7in;
      page-break-after: always;
      position: relative;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* Page 1: Front Cover with Leonardo Artwork */
    .front-cover {
      background-image: url('${artworkUrl}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }
    
    .front-cover::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1in;
      background: linear-gradient(transparent, rgba(0,0,0,0.3));
    }
    
    .card-id {
      position: absolute;
      top: 0.1in;
      right: 0.1in;
      font-size: 8px;
      color: rgba(255,255,255,0.7);
      background: rgba(0,0,0,0.3);
      padding: 2px 4px;
      border-radius: 2px;
    }
    
    /* Page 2: Inside Left (Blank for personal message) */
    .inside-left {
      background: #fefefe;
      padding: 0.75in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .personal-space {
      width: 100%;
      height: 4in;
      border: 1px dashed #e0e0e0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 12px;
      font-style: italic;
      text-align: center;
    }
    
    /* Page 3: Inside Right (Poetry) */
    .inside-right {
      background: #fefefe;
      padding: 0.75in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .poetry-container {
      text-align: center;
      line-height: 1.6;
      font-size: 14px;
      color: #333;
      font-style: italic;
      max-width: 100%;
      word-wrap: break-word;
    }
    
    .poetry-text {
      margin-bottom: 0.5in;
      white-space: pre-line;
    }
    
    .signature {
      font-size: 12px;
      color: #666;
      font-style: normal;
      margin-top: 0.3in;
      border-top: 1px solid #eee;
      padding-top: 0.2in;
    }
    
    /* Page 4: Back Cover */
    .back-cover {
      background: #fefefe;
      padding: 0.75in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
    }
    
    .recipient-info {
      text-align: center;
      font-size: 11px;
      color: #666;
      line-height: 1.4;
    }
    
    .brand-footer {
      text-align: center;
    }
    
    .logo {
      width: 40px;
      height: 40px;
      margin-bottom: 8px;
      border-radius: 50%;
      background: #f0c040;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    
    .brand-text {
      font-size: 10px;
      color: #999;
      font-weight: 400;
    }
    
    /* Print optimizations */
    @media print {
      body { -webkit-print-color-adjust: exact; }
      .page { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <!-- Page 1: Front Cover -->
  <div class="page front-cover">
    <div class="card-id">ID: ${cardId}</div>
  </div>
  
  <!-- Page 2: Inside Left (Personal Message Space) -->
  <div class="page inside-left">
    <div class="personal-space">
      <div>
        <div>Space for your</div>
        <div>personal message</div>
      </div>
    </div>
  </div>
  
  <!-- Page 3: Inside Right (Poetry) -->
  <div class="page inside-right">
    <div class="poetry-container">
      <div class="poetry-text">${poetry}</div>
      <div class="signature">
        With love,<br>
        Write Our Heart
      </div>
    </div>
  </div>
  
  <!-- Page 4: Back Cover -->
  <div class="page back-cover">
    <div class="recipient-info">
      <div><strong>${heartData.name}</strong></div>
      <div>${heartData.address}</div>
      <div>${heartData.city}, ${heartData.state} ${heartData.zipCode}</div>
      <div style="margin-top: 0.2in; font-size: 10px;">
        ${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Card
      </div>
    </div>
    
    <div class="brand-footer">
      <div class="logo">♥</div>
      <div class="brand-text">Write Our Heart</div>
      <div class="brand-text">Personalized Greeting Cards</div>
    </div>
  </div>
</body>
</html>
  `
}

// Generate batch of cards for printing
export interface BatchPrintData {
  cards: CardLayoutData[]
  batchId: string
  createdAt: string
  totalCards: number
}

export function generateBatchForPrinting(cards: CardLayoutData[]): BatchPrintData {
  const batchId = `WOH_${Date.now()}`

  return {
    cards,
    batchId,
    createdAt: new Date().toISOString(),
    totalCards: cards.length,
  }
}

// Generate print-ready HTML for entire batch
export function generateBatchHTML(batchData: BatchPrintData): string {
  const batchCoverPage = `
  <div class="page" style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; text-align: center; padding: 1in;">
    <div>
      <h1 style="color: #333; margin-bottom: 0.5in;">Write Our Heart</h1>
      <h2 style="color: #666; margin-bottom: 0.3in;">Print Batch ${batchData.batchId}</h2>
      <p style="color: #666; font-size: 14px;">
        <strong>Cards in batch:</strong> ${batchData.totalCards}<br>
        <strong>Created:</strong> ${new Date(batchData.createdAt).toLocaleDateString()}<br>
        <strong>Print Date:</strong> ${new Date().toLocaleDateString()}
      </p>
      <div style="margin-top: 0.5in; font-size: 12px; color: #999;">
        <p><strong>Recipients:</strong></p>
        <div style="text-align: left; display: inline-block;">
          ${batchData.cards.map((card) => `<div>• ${card.heartData.name} - ${card.occasion}</div>`).join("")}
        </div>
      </div>
    </div>
  </div>
  `

  const allCardsHTML = batchData.cards.map((card) => generateCardLayout(card)).join("\n")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Write Our Heart - Batch ${batchData.batchId}</title>
  <style>
    @page { size: 5in 7in; margin: 0; -webkit-print-color-adjust: exact; }
    body { margin: 0; padding: 0; font-family: 'Georgia', serif; }
    .page { width: 5in; height: 7in; page-break-after: always; box-sizing: border-box; }
    .page:last-child { page-break-after: avoid; }
  </style>
</head>
<body>
  ${batchCoverPage}
  ${allCardsHTML}
</body>
</html>
  `
}

// Generate CSV for mailing labels
export function generateMailingCSV(batchData: BatchPrintData): string {
  const headers = [
    "BatchID",
    "CardID",
    "RecipientName",
    "Address",
    "City",
    "State",
    "ZipCode",
    "Occasion",
    "PrintDate",
    "Relationship",
  ]

  const rows = batchData.cards.map((card) => [
    batchData.batchId,
    card.cardId,
    card.heartData.name,
    card.heartData.address,
    card.heartData.city,
    card.heartData.state,
    card.heartData.zipCode,
    card.occasion,
    new Date().toISOString().slice(0, 10),
    card.heartData.relationship,
  ])

  return [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
}

// Download helpers
export function downloadHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Convert HTML to PDF using browser print
export async function printCardBatch(html: string, batchId: string) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Could not open print window")
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for images to load
  await new Promise((resolve) => {
    printWindow.onload = resolve
    setTimeout(resolve, 2000) // Fallback
  })

  // Auto-trigger print dialog
  printWindow.print()

  // Instructions for user
  alert(`Print dialog opened for batch ${batchId}. Please select "Save as PDF" or send directly to your printer.`)
}
