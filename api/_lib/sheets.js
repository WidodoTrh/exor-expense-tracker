const APP_TAG = 'cashflow-tracker';

const TRANSACTIONS_SHEET_TITLE = 'Transactions';
const TRANSACTIONS_HEADERS = ['id', 'title', 'spent by', 'amount', 'category', 'payment type', 'spend datetime', 'month', 'year', 'day'];

const CATEGORIES_SHEET_TITLE = 'Categories';
const CATEGORIES_HEADERS = ['id', 'name', 'type'];

const PAYMENTTYPE_SHEET_TITLE = 'payment_type';
const PAYMENTTYPE_HEADERS = ['id', 'name'];

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

async function listSheetTitles(accessToken, spreadsheetId) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to list sheet tabs: ${JSON.stringify(data)}`);
  }
  return (data.sheets || []).map((s) => s.properties.title);
}

/**
 * Create a new tab (worksheet) inside an existing spreadsheet, with an
 * optional header row and optional seed rows appended right after.
 */
async function createSheetTab(accessToken, spreadsheetId, sheetTitle, headers = [], seedRows = []) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: sheetTitle } } }],
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Failed to create sheet tab "${sheetTitle}": ${JSON.stringify(data)}`);
  }

  const rows = [...(headers.length ? [headers] : []), ...seedRows];
  if (rows.length > 0) {
    const putRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetTitle}!A1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rows }),
      }
    );
    const putData = await putRes.json();
    if (!putRes.ok) {
      throw new Error(`Failed to write rows to "${sheetTitle}": ${JSON.stringify(putData)}`);
    }
  }

  return data.replies[0].addSheet.properties.sheetId;
}

/**
 * Ensure a tab with the given title exists; create it (with headers/seed rows)
 * if it doesn't. Safe to call on every request — the existence check makes it
 * a no-op once the tab is there.
 */
async function ensureSheetTabs(accessToken, spreadsheetId, sheetDefs) {
  const existingTitles = await listSheetTitles(accessToken, spreadsheetId);
  const missing = sheetDefs.filter((def) => !existingTitles.includes(def.title));

  // Create them one by one (Sheets API doesn't batch addSheet + data write
  // for multiple new sheets cleanly in a single call worth the complexity here)
  for (const def of missing) {
    await createSheetTab(accessToken, spreadsheetId, def.title, def.headers || [], def.seedRows || []);
  }
}

// ---------------------------------------------------------------------------
// Categories sheet
// ---------------------------------------------------------------------------

/**
 * Make sure the Categories tab exists on this spreadsheet. Call this
 * on-demand (e.g. from the categories endpoint, or during login) so users
 * who created their spreadsheet before this feature existed still get it
 * without needing a whole new spreadsheet.
 */
export async function ensureTypeOf_sheet(accessToken, spreadsheetId) {
  await ensureSheetTabs(accessToken, spreadsheetId, [
    { title: CATEGORIES_SHEET_TITLE, headers: CATEGORIES_HEADERS },
    { title: PAYMENTTYPE_SHEET_TITLE, headers: PAYMENTTYPE_HEADERS },
  ]);
}
export { CATEGORIES_SHEET_TITLE, CATEGORIES_HEADERS, PAYMENTTYPE_SHEET_TITLE, PAYMENTTYPE_HEADERS };

// ---------------------------------------------------------------------------
// Spreadsheet find-or-create (existing logic, now creates Categories too)
// ---------------------------------------------------------------------------

export async function findOrCreateSpreadsheet(accessToken, userEmail) {
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=appProperties has { key='app' and value='${APP_TAG}' } and trashed=false&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();

  if (!searchRes.ok) {
    throw new Error(`Drive search failed: ${JSON.stringify(searchData)}`);
  }

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // 2. Not found -> this is a new user, create their spreadsheet now,
  //    with both the Transactions and Categories tabs from the start.
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: `Cashflow Tracker - ${userEmail}` },
      sheets: [
        {
          properties: { title: TRANSACTIONS_SHEET_TITLE },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: TRANSACTIONS_HEADERS.map((v) => ({
                    userEnteredValue: { stringValue: v },
                  })),
                },
              ],
            },
          ],
        },
        {
          properties: { title: CATEGORIES_SHEET_TITLE },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: CATEGORIES_HEADERS.map((v) => ({
                    userEnteredValue: { stringValue: v },
                  })),
                },
              ],
            },
          ],
        },
      ],
    }),
  });

  const createData = await createRes.json();

  if (!createRes.ok) {
    throw new Error(`Spreadsheet create failed: ${JSON.stringify(createData)}`);
  }

  const spreadsheetId = createData.spreadsheetId;
  const patchRes = await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ appProperties: { app: APP_TAG } }),
  });

  if (!patchRes.ok) {
    const patchData = await patchRes.json();
    throw new Error(`Tagging spreadsheet failed: ${JSON.stringify(patchData)}`);
  }

  return spreadsheetId;
}