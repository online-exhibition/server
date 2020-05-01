import fs from 'fs';

export function getModificationDate(filename) {
  const stat = fs.statSync(filename);
  return stat.mtime;
}

export function ensureDirectory(path, mode) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true, mode });
  }
}
