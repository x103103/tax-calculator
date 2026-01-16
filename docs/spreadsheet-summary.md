# Stock Trading Portfolio Analysis

## Overview

This document provides a comprehensive summary and analysis of stock market trading activity and USD to PLN exchange rates from a Google Spreadsheet containing 5 tabs of financial data.

**Spreadsheet ID:** `1BljW-SI44Otuq6Tf0DtzNuB9BBGg8p9Ntxfu7jU1Hfw`

**Analysis Date:** January 16, 2026

---

## Table of Contents

1. [Data Sources](#data-sources)
2. [USD to PLN Exchange Rates](#usd-to-pln-exchange-rates)
3. [Trading Activity 2024](#trading-activity-2024)
4. [Trading Activity 2025](#trading-activity-2025)
5. [Closed Positions 2025](#closed-positions-2025)
6. [Portfolio Insights](#portfolio-insights)
7. [Performance Summary](#performance-summary)

---

## Data Sources

The spreadsheet contains the following tabs:

| Tab Name | GID | Description | Records |
|----------|-----|-------------|---------|
| **Report** | 522490912 | Empty/Summary tab | 0 |
| **rates** | 1407611262 | Daily USD to PLN exchange rates | 502 |
| **trades_2024** | 1654450809 | Stock trades executed in 2024 | 31 |
| **trades_2025** | 2123430458 | Stock trades executed in 2025 | 40 |
| **closed_2025** | 1401837732 | Closed positions with realized P&L | 20 |

**Total Data Points:** 593 records across all tabs

---

## USD to PLN Exchange Rates

### Overview

The `rates` tab contains daily USD to PLN (Polish Złoty) exchange rate data, essential for converting trading profits/losses from USD to PLN for tax and reporting purposes.

### Key Statistics

- **Data Points:** 502 daily rates
- **Date Range:** January 2, 2024 → December 31, 2025
- **Starting Rate:** 3.9432 PLN per USD (Jan 2, 2024)
- **Ending Rate:** 3.6016 PLN per USD (Dec 31, 2025)
- **Rate Change:** -0.3416 PLN (-8.66%)

### Observations

- The Polish Złoty **strengthened** against the US Dollar by approximately 8.66% over the 2-year period
- This currency movement affects the PLN-denominated returns on USD stock investments
- Lower USD/PLN rates mean USD profits convert to fewer PLN

### Data Format

```csv
Date,USD to PLN Rate
2024-01-02,3.9432
2024-01-03,3.9909
...
2025-12-31,3.6016
```

---

## Trading Activity 2024

### Overview

The `trades_2024` tab contains all stock purchase and sale transactions from the 2024 calendar year.

### Key Statistics

- **Total Transactions:** 31 trades
- **Period:** June 20, 2024 → December 9, 2024
- **Transaction Type:** Predominantly BUY orders (31 buys, 1 sell)
- **Account:** Interactive Brokers (Account ID: U19904268)
- **Currency:** USD

### Portfolio Composition

Stock positions acquired in 2024:

| Symbol | Company | Trades | Type |
|--------|---------|--------|------|
| **VOO** | Vanguard S&P 500 ETF | 6 | ETF |
| **GOOGL** | Alphabet Inc (Class A) | 5 | Stock |
| **NVDA** | NVIDIA Corp | 4 | Stock |
| **CRWD** | CrowdStrike Holdings | 4 | Stock |
| **AMZN** | Amazon.com Inc | 4 | Stock |
| **AAPL** | Apple Inc | 3 | Stock |
| **GOOG** | Alphabet Inc (Class C) | 2 | Stock |
| **V** | Visa Inc | 2 | Stock |
| **MSFT** | Microsoft Corp | 2 | Stock |

### Trading Pattern

- **Strategy:** Primarily accumulation phase with buy-and-hold approach
- **ETF Allocation:** 6 trades in VOO (S&P 500 ETF) for diversified exposure
- **Tech Focus:** Heavy concentration in technology stocks (NVDA, GOOGL, GOOG, AAPL, MSFT, AMZN)
- **Security Focus:** CrowdStrike (CRWD) added for cybersecurity exposure
- **Financial Services:** Visa (V) for payment processing exposure

### Notable Transactions

- First trade: **AAPL** purchase on June 20, 2024
- Last trade: **VOO** purchase on December 9, 2024
- Only 1 SELL transaction in 2024 (CRWD partial position)

---

## Trading Activity 2025

### Overview

The `trades_2025` tab shows continued trading activity into 2025.

### Key Statistics

- **Total Transactions:** 40 trades
- **Period:** January 22, 2025 → February 18, 2025 (preliminary data)
- **Transaction Type:** All BUY orders
- **Trading Intensity:** Higher frequency than 2024

### Portfolio Composition

Most actively traded stocks in 2025:

| Symbol | Company | Trades | Notes |
|--------|---------|--------|-------|
| **AMZN** | Amazon.com Inc | 10 | Top position |
| **NVDA** | NVIDIA Corp | 8 | Continued accumulation |
| **GOOG** | Alphabet Inc (Class C) | 8 | Increased position |
| **UNH** | UnitedHealth Group | 3 | New position |
| **SOFI** | SoFi Technologies | 3 | New fintech position |
| **GOOGL** | Alphabet Inc (Class A) | 3 | Continued |
| **AMD** | Advanced Micro Devices | 3 | New semiconductor position |
| **VOO** | Vanguard S&P 500 ETF | 1 | Maintenance |
| **MELI** | MercadoLibre Inc | 1 | New e-commerce position |
| **AAPL** | Apple Inc | 1 | Reduced activity |

### New Positions Added in 2025

1. **UNH (UnitedHealth Group)** - Healthcare sector diversification
2. **AMD (Advanced Micro Devices)** - Additional semiconductor exposure alongside NVDA
3. **SOFI (SoFi Technologies)** - Fintech/banking sector
4. **MELI (MercadoLibre)** - Latin American e-commerce

### Trading Pattern Evolution

- **Increased Activity:** 40 trades in ~4 weeks vs 31 trades in ~6 months (2024)
- **Diversification:** Adding new sectors (healthcare, fintech, Latin America)
- **Tech Concentration:** Still heavy focus on AMZN, NVDA, GOOG
- **AMD Addition:** Diversifying semiconductor exposure beyond NVDA

---

## Closed Positions 2025

### Overview

The `closed_2025` tab tracks positions that were opened and then closed, showing realized gains and losses.

### Key Statistics

- **Total Closed Positions:** 20 trades
- **Total Realized P&L:** **$18,133.98** (USD)
- **All Profitable:** All closed positions show positive P&L

### Realized P&L by Stock

| Symbol | Company | Closed Trades | Realized P&L | Notes |
|--------|---------|--------------|--------------|-------|
| **GOOG** | Alphabet Inc (Class C) | 9 | **$13,087.61** | Best performer |
| **AMD** | Advanced Micro Devices | 2 | **$2,374.00** | Strong returns |
| **GOOGL** | Alphabet Inc (Class A) | 5 | **$1,275.34** | Solid gains |
| **SOFI** | SoFi Technologies | 2 | **$747.75** | Quick profit |
| **AAPL** | Apple Inc | 3 | **$649.28** | Modest gains |

### Performance Analysis

#### Top Performer: GOOG (Alphabet Class C)
- **9 closed trades** generating **$13,087.61** in realized profit
- Average profit per trade: **$1,454.18**
- Represents **72.2%** of total realized P&L
- Excellent timing on Alphabet positions

#### Strong Secondary Performer: AMD
- **2 closed trades** with **$2,374.00** profit
- Average profit per trade: **$1,187.00**
- Strong performance in semiconductor sector

#### Alphabet Combined (GOOG + GOOGL)
- **14 total closed trades** (9 GOOG + 5 GOOGL)
- **$14,362.95** combined realized profit
- Represents **79.2%** of total realized P&L
- Clear winning position in the portfolio

### Trading Strategy Insights

1. **Short-term Trading:** Positions opened in 2024/early 2025 and closed within months
2. **Momentum Trading:** Capitalizing on tech stock rallies
3. **Profit Taking:** Disciplined approach to locking in gains
4. **Winning Focus:** Heavy concentration in Alphabet (GOOG/GOOGL) paid off

---

## Portfolio Insights

### Sector Allocation

Based on combined 2024-2025 trading activity:

**Technology (Dominant)**
- NVDA, GOOGL, GOOG, AAPL, MSFT, AMZN, CRWD, AMD, SOFI
- Approximately 75-80% of trading activity

**Financial Services**
- V (Visa), SOFI
- ~5-10% allocation

**Healthcare**
- UNH (UnitedHealth)
- ~5% allocation

**E-commerce/International**
- MELI (MercadoLibre)
- ~5% allocation

**Diversified ETF**
- VOO (S&P 500)
- ~5-10% allocation

### Risk Profile

**High Concentration Risk:**
- Heavy overweight in technology sector
- Limited diversification across sectors
- Alphabet (GOOG + GOOGL) represents largest position

**Positive Factors:**
- VOO ETF provides S&P 500 diversification
- Recent expansion into healthcare (UNH) and fintech (SOFI)
- Quality companies with strong fundamentals

### Stock Selection Characteristics

The portfolio focuses on:
1. **Large-cap tech leaders:** AAPL, MSFT, GOOGL, AMZN
2. **High-growth momentum:** NVDA, AMD (semiconductors)
3. **Disruption themes:** CRWD (cybersecurity), SOFI (fintech)
4. **Market leaders:** VOO (index), V (payments), UNH (healthcare)

---

## Performance Summary

### Realized Performance (2025 Closed Positions)

- **Total Realized Gains:** $18,133.98 USD
- **Win Rate:** 100% (all 20 closed positions profitable)
- **Best Trade:** GOOG positions averaging $1,454 profit each
- **Average Profit per Closed Position:** $906.70

### Currency Considerations

**USD to PLN Conversion Impact:**
- Starting rate (Jan 2024): 3.9432 PLN/USD
- Ending rate (Dec 2025): 3.6016 PLN/USD
- Change: -8.66% (PLN strengthened)

**PLN-Denominated Returns:**
- The $18,133.98 USD profit at current rates: ~65,218 PLN
- If converted at initial rates: ~71,518 PLN
- Currency headwind: ~6,300 PLN (-8.8%)

**Impact:** The strengthening PLN means USD profits are worth less in PLN terms, reducing PLN-denominated returns by approximately 8-9%.

### Portfolio Characteristics

**Strengths:**
- ✅ 100% win rate on closed positions
- ✅ Strong performance in Alphabet (GOOG/GOOGL)
- ✅ Disciplined profit-taking approach
- ✅ Positioned in quality, market-leading companies

**Areas for Consideration:**
- ⚠️ High concentration in technology sector
- ⚠️ Limited sector diversification
- ⚠️ Currency risk (USD/PLN exchange rate)
- ⚠️ Recent increase in trading frequency (2025)

---

## Trading Timeline

```
2024
├── June 20: First trade (AAPL)
├── June-July: Initial accumulation (AAPL, AMZN, GOOGL, VOO, NVDA)
├── August-September: Continued buying (NVDA, VOO, GOOG)
├── October-December: Final 2024 positions (MSFT, VOO, V, NVDA)
│
2025
├── January 22: Year begins with AAPL sale
├── January-February: Rapid accumulation phase
│   ├── New positions: AMD, UNH, SOFI, MELI
│   ├── Expansion: AMZN (10 trades), NVDA (8 trades)
│   └── Continued: GOOG (8 trades), GOOGL (3 trades)
└── February 18: Latest recorded trade (AMD, VOO)
```

---

## Data Files

All spreadsheet data has been downloaded and stored locally in CSV format:

```
data/spreadsheet-tabs/
├── rates.csv          (502 lines - USD to PLN daily rates)
├── trades_2024.csv    (31 trades - 2024 transactions)
├── trades_2025.csv    (40 trades - 2025 transactions)
├── closed_2025.csv    (20 positions - Realized P&L)
└── report.csv         (0 lines - Empty)
```

---

## Technical Notes

### Data Source
- **Platform:** Interactive Brokers
- **Account Type:** Individual/Independent
- **Account ID:** U19904268
- **Data Format:** IB Trade Confirmation Reports (CSV export)
- **Fields:** 82 columns including trade details, P&L calculations, exchange info

### Exchange Rates Source
- Daily USD to PLN exchange rates
- 502 data points covering 2024-2025
- Used for currency conversion and tax reporting

---

## Appendix: Stock Ticker Reference

| Ticker | Company Name | Sector |
|--------|--------------|--------|
| AAPL | Apple Inc | Technology |
| AMD | Advanced Micro Devices | Semiconductors |
| AMZN | Amazon.com Inc | E-commerce/Cloud |
| CRWD | CrowdStrike Holdings | Cybersecurity |
| GOOG | Alphabet Inc - Class C | Technology |
| GOOGL | Alphabet Inc - Class A | Technology |
| MELI | MercadoLibre Inc | E-commerce (LatAm) |
| MSFT | Microsoft Corp | Technology |
| NVDA | NVIDIA Corp | Semiconductors/AI |
| SOFI | SoFi Technologies Inc | Fintech |
| UNH | UnitedHealth Group Inc | Healthcare |
| V | Visa Inc | Financial Services |
| VOO | Vanguard S&P 500 ETF | Index Fund |

---

*Document generated on January 16, 2026*
*Data source: Google Spreadsheet ID 1BljW-SI44Otuq6Tf0DtzNuB9BBGg8p9Ntxfu7jU1Hfw*
*Analysis includes 593 total data records across 5 spreadsheet tabs*
