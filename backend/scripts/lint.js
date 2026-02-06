const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = path.join(__dirname, '..');
const scanDirs = [path.join(projectRoot, 'src')];
const filesToCheck = [path.join(projectRoot, 'server.js')];

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      filesToCheck.push(fullPath);
    }
  }
};

for (const dir of scanDirs) {
  walk(dir);
}

try {
  for (const filePath of filesToCheck) {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    new vm.Script(sourceCode, { filename: filePath });
  }
  console.log(`Syntax check passed for ${filesToCheck.length} file(s).`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
