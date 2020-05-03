export function imageDataProjection(origin) {
  return (entry) => ({'id': entry._id, 'size': entry.length,
    'filename': entry.filename, 'mimeType': entry.contentType,
    'originalCreated': entry.metadata.originalCreated,
    'updated': entry.metadata.updated, 'created': entry.uploadDate,
    'category': entry.metadata.category, 'author': entry.metadata.author,
    'description': entry.metadata.description,
    'exif': entry.metadata.exif,
    '$href': `${origin}/api/image/${entry._id}`});
}

export function imageShortDataProjection(origin) {
  return (entry) => ({'id': entry._id, 'size': entry.length,
    'filename': entry.filename,
    'category': entry.metadata.category, 'author': entry.metadata.author,
    'originalCreated': entry.metadata.originalCreated,
    '$href': `${origin}/api/image/${entry._id}`});
}
