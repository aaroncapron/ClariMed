/**
 * Clean build script that handles locked .next/trace files on Windows.
 * Retries deletion with exponential backoff if files are locked.
 */

const fs = require('fs');
const path = require('path');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function deleteWithRetry(filePath, retries = 0) {
  try {
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        const files = fs.readdirSync(filePath);
        for (const file of files) {
          await deleteWithRetry(path.join(filePath, file), retries);
        }
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EBUSY') {
      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retries);
        console.log(`File locked: ${filePath}. Retrying in ${delay}ms... (${retries + 1}/${MAX_RETRIES})`);
        await sleep(delay);
        return deleteWithRetry(filePath, retries + 1);
      } else {
        console.warn(`[WARNING] Could not delete locked file: ${filePath}`);
        console.warn('This is safe to ignore. Close VS Code/editors and run again if needed.');
        return;
      }
    }
    throw error;
  }
}

async function cleanBuild() {
  const nextDir = path.join(process.cwd(), '.next');
  
  console.log('[INFO] Cleaning .next directory...');
  
  try {
    await deleteWithRetry(nextDir);
    console.log('[SUCCESS] Clean complete');
  } catch (error) {
    console.error('[ERROR] Clean failed:', error.message);
    console.log('\nIf files are locked:');
    console.log('  1. Close VS Code and any editors');
    console.log('  2. Stop all Node processes (Ctrl+C in terminals)');
    console.log('  3. Delete .next folder manually in File Explorer');
    process.exit(1);
  }
}

cleanBuild();
