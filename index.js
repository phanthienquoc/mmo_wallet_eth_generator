const fs = require("fs");
const ethers = require("ethers");
const { faker } = require("@faker-js/faker");
const { google } = require("googleapis");
const path = require("path");

const credentials = require("./credentials.json");
const spreadsheetId = "1w-7RaTsWcQZ0R3Tjh_l3lv8vc43GqXlInQfKEj-qiyY";

const SHEET_NAME = "Account";
const FILE_NAME = "wallets.json";
const VALUE_INPUT_OPTION = "USER_ENTERED";
const URL_SHEET = "https://www.googleapis.com/auth/spreadsheets";
const NUMBER_WALLETS = 1000;

const authConfig = {
  credentials,
  scopes: [URL_SHEET],
};

const auth = new google.auth.GoogleAuth(authConfig);

const writeToSpreadsheet = async (src) => {
  try {
    const sheets = google.sheets({ version: "v4", auth });
    // Read data from wallets.json
    const rawData = fs.readFileSync(path.resolve(__dirname, src));
    const data = JSON.parse(rawData);
    // Map the data to an array of arrays
    const rows = data.map((wallet) => Object.values(wallet));
    // Clear the existing data in the spreadsheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: SHEET_NAME,
    });
    // Write the new data to the spreadsheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: SHEET_NAME,
      valueInputOption: VALUE_INPUT_OPTION,
      requestBody: {
        values: rows,
      },
    });
  } catch (err) {
    console.error(err);
  }
};

const createObjectWallet = (numWallets) => {
  const wallets = [];
  for (let i = 0; i < numWallets; i++) {
    // Create a new Ethereum wallet
    const wallet = ethers.Wallet.createRandom();
    // Store the wallet data in an object
    const walletInfo = {
      email: faker.internet.email(),
      address: wallet.address,
      privateKey: wallet.privateKey,
      seed_phrase: wallet.mnemonic.phrase,
      phone: faker.datatype.uuid(),
      password: "",
      telegram: "",
      twitter: "",
      discord: "",
    };

    // Add the wallet object to the array
    wallets.push(walletInfo);
  }
  return wallets;
};

const exportJSON = (fileName, wallets) => {
  fs.writeFileSync(fileName, JSON.stringify(wallets, null, 2));
};

// Save the wallets to a JSON file
exportJSON(FILE_NAME, createObjectWallet(NUMBER_WALLETS));

writeToSpreadsheet(FILE_NAME);
