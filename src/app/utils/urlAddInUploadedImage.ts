/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../config';

// Function to generate the URL
function generateImageUrl(destination: string, filename: string): string {
  // Extract the folder path after 'public' to create the URL
  const folderPath = destination.replace('./public/', '');
  // Construct the URL
  return folderPath + '/' + filename;
}

// Function to add the URL to the file object
export function ImageUrl(fileObj: any): string {
  if (!fileObj) return '';

  // Handle AWS S3 case
  if (config.file.UploaderServices === 'AWS_S3') return fileObj.location || '';

  // Handle Local Storage case
  if (config.file.UploaderServices === 'LOCAL')
    return generateImageUrl(fileObj.destination, fileObj.filename);
  return fileObj.url || '';
}
