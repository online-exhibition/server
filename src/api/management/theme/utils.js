export function themeDataProjection() {
  return (entry) => ({
    id: entry._id,
    name: entry.name,
    styles: entry.styles,
  });
}

export function themeShortDataProjection() {
  return (entry) => ({
    id: entry._id,
    name: entry.name,
  });
}
