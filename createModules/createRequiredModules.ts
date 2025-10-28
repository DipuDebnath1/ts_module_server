/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';

/**
 * Create a folder and files dynamically
 * @param {string} folderPath - Path where folder will be created
 * @param {string[]} files - Array of file names to create inside folder
 * @param {string} [defaultContent] - Optional default content for each file
 */

const routeContent = (fileName: string) => {
  return `import express from 'express';

const router = express.Router();

export const ${fileName.replace('.route.ts', 'Route')} = router;
`;
};
export const createFolderAndFiles = (
  folderPath: string,
  files: string[],
  defaultContent: string = '',
): void => {
  // create folder if does not exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ 📁 Folder created: ${folderPath}`);
  } else {
    console.log(`ℹ️ 📁 Folder already exists: ${folderPath}`);
  }

  // create files inside the folder
  files.forEach((fileName) => {
    const filesPath = path.join(folderPath, fileName);
    if (!fs.existsSync(filesPath)) {
      let content = defaultContent || `// ${fileName} content`;

      if (fileName.endsWith('.route.ts')) {
        // Custom template for route files
        content = routeContent(fileName);
      }

      fs.writeFileSync(filesPath, content);
      console.log(`✅ 📄 File created: ${filesPath}`);
    } else {
      console.log(`ℹ️ 📄 File already exists: ${filesPath}`);
    }
  });
};
