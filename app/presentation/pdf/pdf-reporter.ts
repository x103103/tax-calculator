/**
 * PDF Reporter for Polish Tax Office (PIT-38)
 */

import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import type { TaxReport, TaxSummary, ProfitDetail, FeeDetail } from '../../types';

function isTaxReport(report: TaxReport | TaxSummary): report is TaxReport {
  return 'details' in report;
}

function formatPln(amount: number): string {
  return amount.toFixed(2) + ' PLN';
}

function formatUsd(amount: number): string {
  return amount.toFixed(2) + ' USD';
}

export async function generatePdfReport(
  report: TaxReport | TaxSummary,
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

    // Transaction Tables (only for full TaxReport)
    if (isTaxReport(report)) {
      addTransactionTables(doc, report);
    }

    doc.end();
  });
}

function addTransactionTables(doc: PDFKit.PDFDocument, report: TaxReport): void {
  // Profit Breakdown
  if (report.details.profitBreakdown.length > 0) {
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Profit Breakdown', { underline: true });
    doc.moveDown();

    addProfitTable(doc, report.details.profitBreakdown);
  }

  // Buy Fee Breakdown
  if (report.details.buyFeeBreakdown.length > 0) {
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Buy Fee Breakdown', { underline: true });
    doc.moveDown();

    addFeeTable(doc, report.details.buyFeeBreakdown, 'buy');
  }

  // Sell Fee Breakdown
  if (report.details.sellFeeBreakdown.length > 0) {
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Sell Fee Breakdown', { underline: true });
    doc.moveDown();

    addFeeTable(doc, report.details.sellFeeBreakdown, 'sell');
  }
}

function addProfitTable(doc: PDFKit.PDFDocument, profits: ProfitDetail[]): void {
  const headers = ['Symbol', 'Trade Date', 'Profit USD', 'Rate', 'Rate Date', 'Profit PLN'];
  const colWidths = [70, 80, 70, 50, 80, 80];

  addTableHeader(doc, headers, colWidths);

  for (const p of profits) {
    const row = [
      p.symbol,
      p.tradeDate,
      p.profitUsd.toFixed(2),
      p.rate.toFixed(4),
      p.rateDate,
      p.profitPln.toFixed(2),
    ];
    addTableRow(doc, row, colWidths);
  }
}

function addFeeTable(doc: PDFKit.PDFDocument, fees: FeeDetail[], type: 'buy' | 'sell'): void {
  const dateLabel = type === 'buy' ? 'Buy Date' : 'Sell Date';
  const headers = ['Symbol', dateLabel, 'Fee USD', 'Rate', 'Rate Date', 'Fee PLN'];
  const colWidths = [70, 80, 70, 50, 80, 80];

  addTableHeader(doc, headers, colWidths);

  for (const f of fees) {
    const date = type === 'buy' ? f.buyDate ?? '' : f.sellDate ?? '';
    const row = [
      f.symbol,
      date,
      f.feeUsd.toFixed(2),
      f.rate.toFixed(4),
      f.rateDate,
      f.feePln.toFixed(2),
    ];
    addTableRow(doc, row, colWidths);
  }
}

function addTableHeader(doc: PDFKit.PDFDocument, headers: string[], colWidths: number[]): void {
  doc.fontSize(9).font('Helvetica-Bold');
  let x = 50;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], x, doc.y, { width: colWidths[i], continued: i < headers.length - 1 });
    x += colWidths[i];
  }
  doc.moveDown(0.5);
  doc.font('Helvetica');
}

function addTableRow(doc: PDFKit.PDFDocument, values: string[], colWidths: number[]): void {
  doc.fontSize(8);
  const startY = doc.y;

  // Check if we need a new page
  if (startY > 700) {
    doc.addPage();
  }

  let x = 50;
  for (let i = 0; i < values.length; i++) {
    doc.text(values[i], x, doc.y, { width: colWidths[i], continued: i < values.length - 1 });
    x += colWidths[i];
  }
  doc.moveDown(0.3);
}
