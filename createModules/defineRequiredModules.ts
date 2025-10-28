import { createFolderAndFiles } from './createRequiredModules';

const moduleNames = {
  conversation: { addFiles: ['message.model.ts'] },
  conversationReport: { addFiles: [] },
};

type ModuleKey = keyof typeof moduleNames;

const keys = Object.keys(moduleNames) as ModuleKey[];
for (const moduleName of keys) {
  const baseDir = `./src/app/modules/${moduleName}`;
  const files = [
    ...moduleNames[moduleName].addFiles,
    `${moduleName}.controller.ts`,
    `${moduleName}.service.ts`,
    `${moduleName}.model.ts`,
    `${moduleName}.route.ts`,
    `${moduleName}.validation.ts`,
    `${moduleName}.interface.ts`,
  ];

  createFolderAndFiles(baseDir, files, ``);
}
