module.exports = (current, pre) => {
  const time = current - pre;
  const seconds = Math.round(time / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(months / 12);

  if (!minutes) return "Just Now";
  if (!hours) return `${minutes} minutes ago.`;
  if (!days) return `${hours} hours ago.`;
  if (!months) return `approximately ${days} days ago.`;
  if (!years) return `approximately ${months} months ago.`;
  return `approximately ${years} years ago.`;
}