export function imageDataProjection(origin) {
  return (entry) => ({
    id: entry._id,
    size: entry.length,
    filename: entry.filename,
    title: entry.metadata.title,
    width: entry.metadata.width,
    height: entry.metadata.height,
    category: entry.metadata.category,
    author: entry.metadata.author,
    description: entry.metadata.description,
    mimeType: entry.contentType,
    license: entry.license,
    originalCreated: entry.metadata.originalCreated,
    updated: entry.metadata.updated,
    created: entry.uploadDate,
    exif: entry.metadata.exif,
    $href: `${origin}/api/image/${entry._id}`,
  });
}

export function imageShortDataProjection(origin) {
  return (entry) => ({
    id: entry._id,
    size: entry.length,
    filename: entry.filename,
    title: entry.metadata.title,
    width: entry.metadata.width,
    height: entry.metadata.height,
    category: entry.metadata.category,
    author: entry.metadata.author,
    license: entry.license,
    originalCreated: entry.metadata.originalCreated,
    $href: `${origin}/api/image/${entry._id}`,
  });
}
