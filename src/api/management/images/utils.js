export function imageDataProjection(origin) {
  return (entry) => ({'id': entry._id, 'size': entry.length,
    'filename': entry.filename, 'mimeType': entry.contentType,
    'updated': entry.metadata.updated, 'created': entry.uploadDate,
    'category': entry.metadata.category, 'author': entry.metadata.author,
    'description': entry.metadata.description,
    '$href': `${origin}/api/images/${entry._id}`});
}

export function imageShortDataProjection(origin) {
  return (entry) => ({'id': entry._id, 'size': entry.length,
    'filename': entry.filename,
    'category': entry.metadata.category, 'author': entry.metadata.author,
    '$href': `${origin}/api/images/${entry._id}`});
}
