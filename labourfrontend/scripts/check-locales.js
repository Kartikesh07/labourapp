const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const BASE_LOCALE = 'en.json';

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function checkLocales() {
  const baseFilePath = path.join(LOCALES_DIR, BASE_LOCALE);
  if (!fs.existsSync(baseFilePath)) {
    console.error(`Base locale file not found: ${baseFilePath}`);
    process.exit(1);
  }

  const baseJSON = JSON.parse(fs.readFileSync(baseFilePath, 'utf8'));
  const baseKeys = flattenKeys(baseJSON);
  
  const files = fs.readdirSync(LOCALES_DIR).filter(file => file.endsWith('.json') && file !== BASE_LOCALE);
  
  let errors = 0;

  files.forEach(file => {
    const filePath = path.join(LOCALES_DIR, file);
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const keys = flattenKeys(json);

    const missingKeys = baseKeys.filter(key => !keys.includes(key));
    const extraKeys = keys.filter(key => !baseKeys.includes(key));

    if (missingKeys.length > 0) {
      console.error(`\n❌ [${file}] is missing ${missingKeys.length} keys:`);
      missingKeys.forEach(k => console.error(`   - ${k}`));
      errors++;
    }

    if (extraKeys.length > 0) {
      console.warn(`\n⚠️ [${file}] has ${extraKeys.length} extra keys (not in ${BASE_LOCALE}):`);
      extraKeys.forEach(k => console.warn(`   - ${k}`));
    }
  });

  if (errors > 0) {
    console.error('\n🚨 Locale checks failed! Please add the missing keys.');
    process.exit(1);
  } else {
    console.log('\n✅ All locales are perfectly synced with ' + BASE_LOCALE);
  }
}

checkLocales();
