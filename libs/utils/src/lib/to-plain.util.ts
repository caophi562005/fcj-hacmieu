export const toPlain = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data));
};
