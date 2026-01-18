const fs = require('fs').promises;
const path = require('path');

const { fetchGoogleSheetAsCSV } = require('./fetch-service');

const SPREADSHEET_ID = '1BljW-SI44Otuq6Tf0DtzNuB9BBGg8p9Ntxfu7jU1Hfw';

async function fetchAllTabs() {
  const tabs = [];
  const maxAttempts = 10; // Try first 10 possible gids

  for (let gid = 0; gid < maxAttempts; gid++) {
    try {
      console.log(`Attempting to fetch tab with gid=${gid}...`);
      const csvData = await fetchGoogleSheetAsCSV(SPREADSHEET_ID, gid.toString());

      if (csvData && csvData.trim().length > 0) {
        console.log(`✓ Successfully fetched tab with gid=${gid}`);
        tabs.push({ gid, data: csvData });
      }
    } catch (error) {
      console.log(`✗ Failed to fetch tab with gid=${gid}: ${error.message}`);
    }
  }

  return tabs;
}

async function saveTabsToFiles(tabs) {
  const dataDir = path.join(__dirname, 'data', 'spreadsheet-tabs');
  await fs.mkdir(dataDir, { recursive: true });

  for (const tab of tabs) {
    const filename = path.join(dataDir, `tab-gid-${tab.gid}.csv`);
    await fs.writeFile(filename, tab.data);
    console.log(`Saved: ${filename}`);
  }

  return dataDir;
}

async function main() {
  console.log('Fetching all tabs from spreadsheet...\n');
  const tabs = await fetchAllTabs();

  console.log(`\nFound ${tabs.length} tabs with data`);

  if (tabs.length > 0) {
    const dataDir = await saveTabsToFiles(tabs);
    console.log(`\nAll tabs saved to: ${dataDir}`);

    // Return tabs data for analysis
    return tabs;
  } else {
    console.log('No tabs found with data');
    return [];
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✓ Complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { fetchAllTabs, saveTabsToFiles };
