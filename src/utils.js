// @flow
export function getIn(path: string | Array<string>, obj: ?{} = {}) {
  if (!path || path.length === 0) {
    throw new Error('getIn: path param is required');
  }

  if (typeof path === 'string') {
    path = path.split('.');
  }

  let res = obj;
  for (let key of path) {
    if (res == null) return;
    res = res[key];
  }
  return res;
}

/**
 * Trims off leading & trailing spaces
 *
 * @param {string} value
 * @return {*}
 */
export function trim(value: string) {
  if (typeof value === 'string') {
    value = value.replace(/^\s+/, '').replace(/\s+$/, '');
  }
  return value;
}
