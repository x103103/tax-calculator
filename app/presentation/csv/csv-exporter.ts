import * as fs from 'fs';
import * as path from 'path';
import type { TaxReport, ProfitDetail, FeeDetail } from '../../types';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvLine(fields: string[]): string {
  return fields.map(escapeCsvField).join(',');
}

function exportProfitBreakdownCsv(details: ProfitDetail[], outputPath: string): void {
  const headers = ['Symbol', 'Trade Date', 'Profit USD', 'Rate', 'Rate Date', 'Profit PLN'];
  const lines = [toCsvLine(headers)];

  for (const p of details) {
    lines.push(toCsvLine([
      p.symbol,
      p.tradeDate,
      p.profitUsd.toFixed(2),
      p.rate.toFixed(4),
      p.rateDate,
      p.profitPln.toFixed(2),
    ]));
  }

  fs.writeFileSync(outputPath, lines.join('\n') + '\n');
}

function exportFeeBreakdownCsv(details: FeeDetail[], type: 'buy' | 'sell', outputPath: string): void {
  const dateLabel = type === 'buy' ? 'Buy Date' : 'Sell Date';
  const headers = ['Symbol', dateLabel, 'Fee USD', 'Rate', 'Rate Date', 'Fee PLN'];
  const lines = [toCsvLine(headers)];

  for (const f of details) {
    const date = type === 'buy' ? f.buyDate ?? '' : f.sellDate ?? '';
    lines.push(toCsvLine([
      f.symbol,
      date,
      f.feeUsd.toFixed(2),
      f.rate.toFixed(4),
      f.rateDate,
      f.feePln.toFixed(2),
    ]));
  }

  fs.writeFileSync(outputPath, lines.join('\n') + '\n');
}

export function exportBreakdownCsvs(report: TaxReport, outputDir: string): string[] {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const paths: string[] = [];

  if (report.details.profitBreakdown.length > 0) {
    const p = path.join(outputDir, `profit-breakdown-${report.year}.csv`);
    exportProfitBreakdownCsv(report.details.profitBreakdown, p);
    paths.push(p);
  }

  if (report.details.buyFeeBreakdown.length > 0) {
    const p = path.join(outputDir, `buy-fee-breakdown-${report.year}.csv`);
    exportFeeBreakdownCsv(report.details.buyFeeBreakdown, 'buy', p);
    paths.push(p);
  }

  if (report.details.sellFeeBreakdown.length > 0) {
    const p = path.join(outputDir, `sell-fee-breakdown-${report.year}.csv`);
    exportFeeBreakdownCsv(report.details.sellFeeBreakdown, 'sell', p);
    paths.push(p);
  }

  return paths;
}
