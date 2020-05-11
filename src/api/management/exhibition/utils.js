export function exhibitionDataProjection(origin) {
  return (entry) => ({
    id: entry._id,
    title: entry.title,
    summary: entry.summary,
    description: entry.description,
    maxCount: entry.maxCount,
    start: entry.start,
    expire: entry.expire,
    theme: entry.theme,
    images: entry.images,
    active: entry.active,
    updated: entry.updated,
    created: entry.created,
    modifier: entry.modifier,
    owner: entry.owner,
  });
}

export function exhibitionShortDataProjection(origin) {
  return (entry) => ({
    id: entry._id,
    title: entry.title,
    summary: entry.summary,
    count: entry.images.length,
    maxCount: entry.maxCount,
    start: entry.start,
    expire: entry.expire,
    active: entry.active,
    created: entry.created,
    modifier: entry.modifier,
    owner: entry.owner,
  });
}
