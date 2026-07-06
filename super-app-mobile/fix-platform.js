const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('F:/01 Trung/Duan/nguyenly/super-app-mobile/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Check if it uses Platform. but does not import Platform
    const usesPlatform = content.includes('Platform.');
    const importsPlatform = content.match(/import\s+{([^}]*?)Platform([^}]*?)}\s+from\s+['"]react-native['"]/);
    
    if (usesPlatform && !importsPlatform) {
      // Find the react-native import block and add Platform if it exists, or create a new one
      const rnImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]react-native['"]/);
      if (rnImportMatch) {
         if (!rnImportMatch[1].includes('Platform')) {
            const newImport = `import { Platform, ${rnImportMatch[1]} } from 'react-native'`;
            content = content.replace(rnImportMatch[0], newImport);
            fs.writeFileSync(filePath, content, 'utf8');
            count++;
            console.log('Fixed:', filePath);
         }
      } else {
         const newImport = `import { Platform } from 'react-native';\n`;
         content = newImport + content;
         fs.writeFileSync(filePath, content, 'utf8');
         count++;
         console.log('Fixed:', filePath);
      }
    }
  }
});
console.log('Total fixed:', count);
