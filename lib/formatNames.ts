export default function formatName(name: string) {
  if (!name) return "";

  // If starts with number, return as is
  if (/^\d/.test(name)) {
    return name;
  }

  // Capitalize first letter, lowercase the rest
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
