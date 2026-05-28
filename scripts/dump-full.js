const fs = require('fs');
const path = require('path');

const outputFilePath = path.join(__dirname, '..', 'project_dump.txt');
const rootDir = path.join(__dirname, '..');

const ignoreDirs = ['node_modules', '.next', '.git', 'out', 'build', 'coverage'];
const ignoreFiles = ['project_dump.txt', 'package-lock.json', 'yarn.lock'];

function dump(dir, relativePath = '') {
  let result = '';
  if (!fs.existsSync(dir)) return result;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      if (!ignoreDirs.includes(entry.name)) {
        result += dump(entryPath, entryRelativePath);
      }
    } else {
      if (!ignoreFiles.includes(entry.name)) {
        try {
          const content = fs.readFileSync(entryPath, 'utf8');
          result += `===== ${entryRelativePath.replace(/\\/g, '/')} =====\n${content}\n`;
        } catch (e) {}
      }
    }
  }
  return result;
}

console.log('Creating project dump...');
const fullDump = dump(rootDir);
fs.writeFileSync(outputFilePath, fullDump, 'utf8');
console.log(`Dump saved to: ${outputFilePath}`);

