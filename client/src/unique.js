function unique(array) {
  return array.reduce((uniqueArray, currentValue) => {
    if (!uniqueArray.includes(currentValue)) {
      return [...uniqueArray, currentValue];
    } else {
      // the callback must return some value which will be used as the first argument for next iteration
      return uniqueArray;
    }
  }, []);
}

export default unique;
