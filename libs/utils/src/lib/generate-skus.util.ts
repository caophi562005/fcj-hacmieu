export const generateSKUs = (variants: any[]): any[] => {
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce(
      (acc, curr) =>
        acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)),
      ['']
    );
  }

  const options = variants.map((variant) => variant.options);

  const combinations = getCombinations(options);

  return combinations.map((value) => ({
    value,
    price: 0,
    stock: 100,
    image: '',
  }));
};
