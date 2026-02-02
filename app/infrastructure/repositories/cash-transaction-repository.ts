import type { CashTransactionData, CashTransactionRow } from '../../types';
import { loadCsv } from '../data/csv-loader';

export class CashTransactionRepository {
  async load(csvPath: string): Promise<CashTransactionData> {
    const rows = await loadCsv<CashTransactionRow>(csvPath);

    return {
      dividends: rows.filter((r) => r.Type === 'Dividends'),
      withholdingTax: rows.filter((r) => r.Type === 'Withholding Tax'),
      brokerInterest: rows.filter((r) => r.Type === 'Broker Interest Received'),
    };
  }
}
