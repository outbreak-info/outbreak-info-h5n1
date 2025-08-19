import { siteMap } from '../utils/siteNumberingMap.js';

export function convertSiteHANumbering(inputValue, fromKey, toKey) {
    const entry = siteMap.find(row => String(row[fromKey]) === String(inputValue));
    return entry ? entry[toKey] : null;
}