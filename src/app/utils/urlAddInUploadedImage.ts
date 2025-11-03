/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../config';

import path from 'path';

function generateImageUrl(destination: string, filename: string): string {
  // Normalize slashes (Windows uses \, Linux uses /)
  const normalizedDest = destination.replace(/\\/g, '/');

  // Remove any leading './' or 'public/' parts
  const folderPath = normalizedDest
    .replace(/^\.?\/*public\/*/, '') // remove ./public/ or public/
    .replace(/^\/+/, ''); // remove leading slashes if any

  // Construct clean relative URL
  const url = path.posix.join(folderPath, filename);

  return url;
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
