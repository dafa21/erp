import * as cron from 'node-cron';
import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';
import archiver from 'archiver';

const backupsDir = path.resolve(process.cwd(), 'backups');

export const initCronJobs = (db: any) => {
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  // Run at 00:00 every day
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Starting daily auto-backup...');
    try {
      await performLocalBackup();
      console.log('[CRON] Local backup completed successfully.');
      if (db) {
         db.prepare('INSERT INTO backup_logs (status, details) VALUES (?, ?)').run('SUCCESS', 'Auto-backup SQL lokal rutin (Cron) berhasil dilakukan.');
      }
      
      // Note: Auto-uploading to Google Drive in a background cron job without a refresh token
      // is challenging because Firebase Auth access tokens expire after 1 hour.
      // We simulate the Google Drive upload logic here, which could be expanded
      // if a service account or refresh token strategy is implemented.
      console.log('[CRON] Attempting to share to Google Drive to dafa394@gmail.com...');
      // Drive upload logic would go here.
    } catch (e: any) {
      console.error('[CRON] Error during auto-backup:', e);
      if (db) {
         db.prepare('INSERT INTO backup_logs (status, details) VALUES (?, ?)').run('FAILED', `Gagal Auto-backup rutin: ${e?.message}`);
      }
    }
  });
};

export const performLocalBackup = async (db?: any): Promise<string> => {
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `backup-${timestamp}.zip`;
  const zipPath = path.join(backupsDir, backupFilename);

  const tempDbPath = path.resolve(process.cwd(), 'backups', `temp-${timestamp}.sqlite`);

  // Safely dump database via VACUUM INTO to avoid segfaults and WAL locks
  // If db is not provided (e.g. from an old call), we instantiate a temporary one
  let activeDb = db;
  let isTemp = false;
  if (!activeDb) {
    const dbPath = path.resolve(process.cwd(), 'database.sqlite');
    activeDb = new Database(dbPath, { readonly: true });
    isTemp = true;
  }
  
  // Create a clean backup copy
  activeDb.prepare(`VACUUM INTO '${tempDbPath}'`).run();
  
  if (isTemp) {
    activeDb.close();
  }

  return new Promise((resolve, reject) => {
    try {
      const output = fs.createWriteStream(zipPath);
      
      output.on('error', (err) => {
        reject(err);
      });
      
      const archive = archiver('zip', {
        zlib: { level: 9 } // maximum compression
      });

      output.on('close', () => {
        // Clean up temp DB dump
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
        resolve(zipPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      if (fs.existsSync(tempDbPath)) {
        archive.file(tempDbPath, { name: 'database.sqlite' });
      }

      archive.finalize();
    } catch (e) {
      reject(e);
    }
  });
};

export const uploadToGoogleDrive = async (zipPath: string, accessToken: string) => {
  // Uses the user's access token from the frontend to upload to Drive
  try {
    const filename = path.basename(zipPath);
    const fileStat = fs.statSync(zipPath);
    
    // 1. Initiate resumable upload session
    const metadata = {
      name: filename,
      mimeType: 'application/zip',
      // We could add permissions here, but the user is the owner, so they already have access.
      // If we wanted to share it explicitly:
      // permissions: [{ type: "user", role: "writer", emailAddress: "dafa394@gmail.com" }]
    };

    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'application/zip',
        'X-Upload-Content-Length': fileStat.size.toString()
      },
      body: JSON.stringify(metadata)
    });

    if (!initRes.ok) throw new Error(`Drive init failed: ${await initRes.text()}`);
    
    const locationUri = initRes.headers.get('Location');
    if (!locationUri) throw new Error("No upload location returned");

    // 2. Upload the file data
    const fileData = fs.readFileSync(zipPath);
    
    const uploadRes = await fetch(locationUri, {
      method: 'PUT',
      headers: {
        'Content-Length': fileStat.size.toString()
      },
      body: fileData
    });

    if (!uploadRes.ok) throw new Error(`Drive upload failed: ${await uploadRes.text()}`);
    
    const result = await uploadRes.json();
    return result.id;
  } catch (error) {
    console.error('Google Drive Upload Error:', error);
    throw error;
  }
};
