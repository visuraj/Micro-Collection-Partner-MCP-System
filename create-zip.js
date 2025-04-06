import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(__dirname, 'mcp_system.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log('Archive created successfully');
  console.log('Total bytes: ' + archive.pointer());
});

// Good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Exclude these directories and files
const excludes = [
  'node_modules',
  '.git',
  'mcp_system.zip',
  'create-zip.js'
];

// Function to recursively add files to the archive
function addFilesToArchive(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    
    // Check if the file should be excluded
    if (excludes.includes(file) || file.startsWith('.')) {
      continue;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively add files from subdirectories
      addFilesToArchive(filePath);
    } else {
      // Add file to archive
      archive.file(filePath, { name: filePath });
    }
  }
}

// Add files (getting everything from current directory)
addFilesToArchive('.');

// Finalize the archive (ie we are done appending files but streams have to finish yet)
archive.finalize();