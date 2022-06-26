module.exports = function stubableImportsLoader(source) {
  // const options = this.getOptions();

  const newSource = source.replace(
    "var",
    "888888888888888888888888888888888888888888888888888888888"
  );

  // console.log(source);
  console.log(newSource);

  return source;
};
