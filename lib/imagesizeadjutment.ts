export function resizeImageUrl(link: string, size?: string) {
  const [beforeQuery, query] = link.split("?");
  const lastSlashIndex = beforeQuery.lastIndexOf("/");
  const fileName = beforeQuery.substring(lastSlashIndex + 1);

  // Detect extension
  const hasExtension = /\.[^/.]+$/.test(fileName);

  let fileNameWithoutExt = fileName;
  let newFileName = fileName;

  if (!size) {
    // No size → just convert to .webp if extension exists
    if (hasExtension) {
      fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      newFileName = `${fileNameWithoutExt}.webp`;
    }
  } else {
    // Size provided → follow original logic
    if (hasExtension) {
      fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      newFileName = `${fileNameWithoutExt}_${size}.webp`;
    } else {
      newFileName = `${fileName}_${size}`;
    }
  }

  const basePath = beforeQuery.substring(0, lastSlashIndex + 1);
  return `${basePath}${newFileName}?${query}`;
}
