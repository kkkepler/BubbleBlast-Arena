const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dumpFilePath = path.join(__dirname, '..', 'project_dump.txt');
const outputDir = path.join(__dirname, '..');

function createDumpIfMissing() {
  if (fs.existsSync(dumpFilePath)) return;

  console.log('Файл project_dump.txt не найден. Создаю новый дамп проекта...');
  
  const ignoreDirs = ['node_modules', '.next', '.git', 'out', 'build', 'coverage'];
  const ignoreFiles = ['project_dump.txt', 'package-lock.json', 'yarn.lock'];
  const rootDir = path.join(__dirname, '..');

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
            result += '===== ' + entryRelativePath.replace(/\\/g, '/') + ' =====\n';
            result += content + '\n';
          } catch (e) {
            console.error(`Error reading file ${entryPath}:`, e.message);
          }
        }
      }
    }
    return result;
  }

  try {
    const fullDump = dump(rootDir);
    fs.writeFileSync(dumpFilePath, fullDump, 'utf8');
    console.log('Дамп успешно создан: ' + dumpFilePath);
  } catch (err) {
    console.error('Ошибка при создании дампа:', err);
    process.exit(1);
  }
}

createDumpIfMissing();

if (!fs.existsSync(dumpFilePath)) {
  console.error('Критическая ошибка: файл дампа все еще не найден.');
  process.exit(1);
}

const dumpContent = fs.readFileSync(dumpFilePath, 'utf-8');

const fileRegex = new RegExp('===== (.+?) =====\\n', 'g');
const matches = [...dumpContent.matchAll(fileRegex)];

if (matches.length === 0) {
  console.error('Не удалось найти разделители файлов в дампе.');
  process.exit(1);
}

function getHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

const fileMap = new Map();
for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  const filePath = match[1].trim();
  const contentStart = match.index + match[0].length;
  const contentEnd = i + 1 < matches.length ? matches[i + 1].index : dumpContent.length;
  
  let content = dumpContent.slice(contentStart, contentEnd);
  content = content.replace(/\r\n/g, '\n');
  if (content.endsWith('\n')) {
    content = content.slice(0, -1);
  }
  
  fileMap.set(filePath, content);
}

console.log('Найдено файлов в дампе: ' + fileMap.size);

const keepDirs = new Set(['node_modules', '.next', '.git']);
const keepFiles = new Set(['project_dump.txt', 'scripts/restore-project-force.js']);

function shouldKeep(relativePath) {
  const normalized = relativePath.replace(/\\/g, '/');
  const topDir = normalized.split('/')[0];
  if (keepDirs.has(topDir)) return true;
  if (keepFiles.has(normalized)) return true;
  return false;
}

function deleteIfNotInDump(dir, baseDir) {
  if (!baseDir) baseDir = outputDir;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (shouldKeep(relativePath)) {
      continue;
    }
    
    const normalizedPath = relativePath.replace(/\\/g, '/');
    
    if (entry.isDirectory()) {
      deleteIfNotInDump(fullPath, baseDir);
      try {
        const remaining = fs.readdirSync(fullPath);
        if (remaining.length === 0) {
          fs.rmdirSync(fullPath);
          console.log('  🗑️  Пустая папка: ' + normalizedPath + '/');
        }
      } catch (e) {}
    } else {
      if (!fileMap.has(normalizedPath)) {
        fs.unlinkSync(fullPath);
        console.log('  🗑️  Удалён: ' + normalizedPath);
      }
    }
  }
}

console.log('Проверка и удаление файлов, которых нет в дампе...');
deleteIfNotInDump(outputDir);
console.log('');
console.log('Восстановление файлов из дампа...');

let createdCount = 0;
let updatedCount = 0;
let skippedCount = 0;

for (const [filePath, content] of fileMap) {
  const fullPath = path.join(outputDir, filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (fs.existsSync(fullPath)) {
    let existingContent = fs.readFileSync(fullPath, 'utf-8');
    existingContent = existingContent.replace(/\r\n/g, '\n');
    if (existingContent.endsWith('\n')) {
      existingContent = existingContent.slice(0, -1);
    }
    
    const existingHash = getHash(existingContent);
    const newHash = getHash(content);
    
    if (existingHash === newHash) {
      skippedCount++;
      continue;
    }
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    updatedCount++;
    console.log('  🔄 ' + filePath + ' (изменён)');
  } else {
    fs.writeFileSync(fullPath, content, 'utf-8');
    createdCount++;
    console.log('  ✅ ' + filePath + ' (новый)');
  }
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Готово!');
console.log('  ✅ Создано:     ' + createdCount);
console.log('  🔄 Обновлено:   ' + updatedCount);
console.log('  ⏭️  Без изменений: ' + skippedCount);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (updatedCount > 0 || createdCount > 0) {
  console.log('');
  console.log('Действия:');
  console.log('  npm install     # если добавились новые зависимости');
  console.log('  npm run build   # пересобрать проект');
} else {
  console.log('');
  console.log('Все файлы актуальны — изменений нет.');
}

