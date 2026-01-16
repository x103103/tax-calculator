const { getRateForPreviousDay, getRate } = require('./app/services/usd-pln-rate');

console.log('=== USD to PLN Rate Service Test ===\n');

// Test 1: Get rate for previous day of a working day
console.log('Test 1: Get rate for previous day of 2025-01-17 (Friday)');
try {
  const result = getRateForPreviousDay('2025-01-17');
  console.log(`  Result: Date ${result.date}, Rate: ${result.rate}, Days back: ${result.daysBack}`);
} catch (error) {
  console.error(`  Error: ${error.message}`);
}

// Test 2: Get rate for previous day of a Monday (should skip weekend)
console.log('\nTest 2: Get rate for previous day of 2025-01-20 (Monday)');
try {
  const result = getRateForPreviousDay('2025-01-20');
  console.log(`  Result: Date ${result.date}, Rate: ${result.rate}, Days back: ${result.daysBack}`);
} catch (error) {
  console.error(`  Error: ${error.message}`);
}

// Test 3: Get rate for previous day with a date that has missing days
console.log('\nTest 3: Get rate for previous day of 2025-01-07 (Tuesday after 3-day weekend)');
try {
  const result = getRateForPreviousDay('2025-01-07');
  console.log(`  Result: Date ${result.date}, Rate: ${result.rate}, Days back: ${result.daysBack}`);
} catch (error) {
  console.error(`  Error: ${error.message}`);
}

// Test 4: Direct lookup with fallback
console.log('\nTest 4: Direct lookup for 2025-01-18 (Saturday - missing) with fallback');
try {
  const result = getRate('2025-01-18', true);
  console.log(`  Result: Date ${result.date}, Rate: ${result.rate}, Days back: ${result.daysBack}`);
} catch (error) {
  console.error(`  Error: ${error.message}`);
}

// Test 5: Direct lookup without fallback
console.log('\nTest 5: Direct lookup for 2025-01-16 (Thursday - exists) without fallback');
try {
  const result = getRate('2025-01-16', false);
  if (result) {
    console.log(`  Result: Date ${result.date}, Rate: ${result.rate}, Days back: ${result.daysBack}`);
  } else {
    console.log('  No rate found');
  }
} catch (error) {
  console.error(`  Error: ${error.message}`);
}

// Test 6: Using Date object instead of string
console.log('\nTest 6: Using Date object for 2025-01-10');
try {
  const date = new Date('2025-01-10');
  const result = getRateForPreviousDay(date);
  console.log(`  Result: Date ${result.date}, Rate: ${result.rate}, Days back: ${result.daysBack}`);
} catch (error) {
  console.error(`  Error: ${error.message}`);
}

console.log('\n=== All tests completed ===');
