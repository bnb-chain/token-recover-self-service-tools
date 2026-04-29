// SPDX-License-Identifier: LicenseRef-Innovation-Enabling
const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const sortObject = (obj: any): any => {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;
  // arrays have typeof "object" in js!
  if (Array.isArray(obj)) return obj.map(sortObject);
  const sortedKeys = Object.keys(obj)
    .filter((key) => !DANGEROUS_KEYS.has(key))
    .sort();
  const result: Record<string, unknown> = Object.create(null);
  sortedKeys.forEach((key) => {
    result[key] = sortObject(obj[key]);
  });
  return result;
};

export const convertObjectToSignBytes = (obj: any) => Buffer.from(JSON.stringify(sortObject(obj)));
