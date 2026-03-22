/**
 * PDF Reporter for Polish Tax Office (PIT-38)
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import type { TaxSummary } from '../../types';

function formatPln(amount: number): string {
  return amount.toFixed(2) + ' PLN';
}

function formatUsd(amount: number): string {
  return amount.toFixed(2) + ' USD';
}

export async function generatePdfReport(
  report: TaxSummary,
  outputPath: string
): Promise<void> {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(`Poland Tax Report ${report.year}`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toISOString().split('T')[0]}`, { align: 'center' });
    doc.moveDown(2);

    // PIT-38 Summary
    doc.fontSize(16).font('Helvetica-Bold').text('PIT-38 Summary', { underline: true });
    doc.moveDown();

    const pit38Data = [
      ['Box 20 - Przychod (Revenue)', formatPln(report.profits)],
      ['Box 21 - Koszty (Costs)', formatPln(report.buyFees + report.sellFees)],
      ['Box 22 - Dochod (Income)', formatPln(report.taxableBase)],
      ['Box 30 - Podatek 19% (Tax)', formatPln(report.taxOwed)],
    ];

    doc.fontSize(11).font('Helvetica');
    for (const [label, value] of pit38Data) {
      doc.text(`${label}: ${value}`);
      doc.moveDown(0.3);
    }

    doc.moveDown();

    // USD Summary
    doc.fontSize(14).font('Helvetica-Bold').text('USD Summary');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Profits: ${formatUsd(report.profitsUSD)}`);
    doc.text(`Buy Fees: ${formatUsd(report.buyFeesUSD)}`);
    doc.text(`Sell Fees: ${formatUsd(report.sellFeesUSD)}`);
    doc.moveDown();

    // Dividend Section
    if (report.dividendTax) {
      doc.fontSize(16).font('Helvetica-Bold').text('Dividend Tax', { underline: true });
      doc.moveDown();

      const div = report.dividendTax;
      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Dividends: ${formatPln(div.dividends.totalPln)} (${formatUsd(div.dividends.totalUsd)})`);
      doc.text(`Dividend Tax (19%): ${formatPln(div.dividendTaxPln)}`);
      doc.text(`Broker Interest: ${formatPln(div.brokerInterest.totalPln)} (${formatUsd(div.brokerInterest.totalUsd)})`);
      doc.text(`Interest Tax (19%): ${formatPln(div.interestTaxPln)}`);
      doc.text(`Withholding Tax Credit: ${formatPln(div.withholdingCreditPln)}`);
      doc.text(`Net Dividend/Interest Tax: ${formatPln(div.taxOwedPln)}`);
      doc.moveDown();
    }

    // Total Tax
    doc.fontSize(16).font('Helvetica-Bold').text('Total Tax Owed', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text(formatPln(report.totalTaxOwed));
    doc.moveDown(2);

    doc.end();
  });
}
