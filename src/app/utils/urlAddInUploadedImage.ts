// Define a type for the file object
interface FileObject {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  url?: string; // Optional field for URL
}

// Function to generate the URL
function generateImageUrl(destination: string, filename: string): string {
  // Extract the folder path after 'public' to create the URL
  const folderPath = destination.replace('./', '');
  // Construct the URL
  return folderPath + '/' + filename;
}

// Function to add the URL to the file object
export function addUrlToFileObject(fileObj: FileObject): FileObject {
  // Add the generated URL to the file object
  fileObj.url = generateImageUrl(fileObj.destination, fileObj.filename);

  return fileObj;
}
