import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, 'pages');

if (fs.existsSync(pagesDir)) {
  fs.readdirSync(pagesDir).forEach(file => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(pagesDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('useSupabase')) {
        content = content.replace(/useSupabase/g, 'useAppHooks');
        fs.writeFileSync(filePath, content);
        console.log(`✅ Actualizado import en: ${file}`);
      }
    }
  });
}
