module.exports = function calculateReadingTime(body) {
    const wordsPerMinute = 200;
    const textLength = body.split(' ').length;
    const time = Math.ceil(textLength / wordsPerMinute);
    return `${time} min read`;
  };