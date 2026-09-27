/**
 * Isolated Printing Service for Railway Contracts & Documents
 * Supports direct iframe printing, popup window printing, and standard browser print
 */

export function printDocumentHtml(htmlContent: string, documentTitle: string = 'In_Van_Ban_A4'): void {
  // 1. Try printing via an isolated hidden iframe (cleanest, no page refresh, no navbar)
  try {
    const existingFrame = document.getElementById('vtds-print-frame') as HTMLIFrameElement | null;
    if (existingFrame && existingFrame.parentNode) {
      existingFrame.parentNode.removeChild(existingFrame);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'vtds-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) {
      throw new Error('Cannot access iframe document');
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 20mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: "Times New Roman", Times, Georgia, serif;
            font-size: 11pt;
            line-height: 1.45;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .doc-page {
            width: 100%;
            page-break-after: always;
            break-after: page;
          }
          .doc-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          p {
            margin: 4px 0;
          }
          .no-print {
            display: none !important;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${htmlContent}
        </div>
      </body>
      </html>
    `;

    frameDoc.open();
    frameDoc.write(fullHtml);
    frameDoc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window print', err);
        fallbackWindowPrint(fullHtml, documentTitle);
      }
    }, 350);

  } catch (err) {
    console.warn('Primary iframe print failed, using fallback', err);
    fallbackNativePrint();
  }
}

function fallbackWindowPrint(fullHtml: string, title: string): void {
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(fullHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);
    } else {
      fallbackNativePrint();
    }
  } catch {
    fallbackNativePrint();
  }
}

function fallbackNativePrint(): void {
  window.print();
}
