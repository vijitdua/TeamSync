/**
 * Recursively traverses a JavaScript object and returns a string of final key-value pairs,
 * excluding specific fields.
 *
 * @param {Object} obj - The object to traverse.
 * @param {Array} excludedFields - Array of field names to exclude from the result.
 * @returns {string} A formatted string containing the final key-value pairs.
 */
export function getFinalKeyValuePairs(obj, excludedFields = []) {
    let result = '';

    function recurse(currentObj) {
        for (const key in currentObj) {
            if (excludedFields.includes(key)) continue;

            const value = currentObj[key];

            if (value === null) continue;

            if (typeof value === 'object') {
                recurse(value);
            } else {
                result += `${key}: ${value}\n`;
            }
        }
    }

    recurse(obj);
    return result;
}