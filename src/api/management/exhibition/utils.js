export function exhibitionDataProjection(origin) {
  return (entry) => ({
    'id': entry._id,
    'title': entry.title,
    'description': entry.description,
    'maxCount': entry.maxCount,
    'expire': entry.expire,
    'backgroundColor': entry.backgroundColor,
    'images': entry.images,
    'active': entry.active,
    'updated': entry.updated,
    'created': entry.created,
    'modifier': entry.modifier,
    'owner': entry.owner,
  });
}

export function exhibitionShortDataProjection(origin) {
  return (entry) => ({
    'id': entry._id,
    'title': entry.title,
    'count': entry.images.length,
    'maxCount': entry.maxCount,
    'expire': entry.expire,
    'active': entry.active,
    'created': entry.created,
    'modifier': entry.modifier,
    'owner': entry.owner,
  });
}
