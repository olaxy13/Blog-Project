module.exports = function calculateReadingTime(text) {
  const wordsPerMinute = 200; // Average reading speed
  const words = text.split(/\s+/).length;
  const readingTime = Math.ceil(words / wordsPerMinute);
  return readingTime; // Returns time in minutes;
  };