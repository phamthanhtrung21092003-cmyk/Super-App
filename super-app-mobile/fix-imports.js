const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Platform.') && !content.includes('Platform,')) {
        const rnImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]react-native['"]/);
        if (rnImportMatch) {
          if (!rnImportMatch[1].includes('Platform')) {
            const newImport = rnImportMatch[0].replace('{', '{ Platform,');
            content = content.replace(rnImportMatch[0], newImport);
            fs.writeFileSync(fullPath, content);
            console.log('Fixed:', fullPath);
          }
        } else {
          content = "import { Platform } from 'react-native';\n" + content;
          fs.writeFileSync(fullPath, content);
          console.log('Added:', fullPath);
        }
      }
    }
  });
}

walk('src');
