function generateExactType(obj: any): string {
    const getType = (value: any): string => {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                return `${getType(value[0])}[]`;
            }
            return "any[]";
        } else if (value === null) {
            return "null";
        } else if (typeof value === "object") {
            return generateExactType(value);
        } else if (typeof value === "string") {
            return "string";
        } else if (typeof value === "number") {
            return "number";
        } else if (typeof value === "boolean") {
            return "boolean";
        } else {
            return "any";
        }
    };

    const entries = Object.entries(obj)
        .map(([key, value]) => `${key}: ${getType(value)};`)
        .join("\n  ");

    return `{\n  ${entries}\n}`;
}

// // Example usage:
// const exampleType = generateExactType(data.transactions[0]);
// console.log(exampleType);