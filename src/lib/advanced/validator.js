import browser from "webextension-polyfill";
import { sampleTestData } from "./examples.js";

/**
 * Validates a custom filter script for basic syntax errors
 * @param {string} script - The JavaScript code to validate
 * @returns {string[]} - Array of error messages, empty if valid
 */
export function validateScriptSyntax(script) {
  const errors = [];

  if (!script.trim()) {
    return errors; // Empty script is valid (no errors)
  }

  try {
    const trimmedScript = script.trim();

    // Check if the script contains a filter function
    if (!trimmedScript.includes("function filter")) {
      errors.push('Script must contain a function named "filter"');
      return errors;
    }

    // Basic syntax checks
    const openBraces = (trimmedScript.match(/\{/g) || []).length;
    const closeBraces = (trimmedScript.match(/\}/g) || []).length;
    const openParens = (trimmedScript.match(/\(/g) || []).length;
    const closeParens = (trimmedScript.match(/\)/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push("Mismatched curly braces { }");
    } else if (openParens !== closeParens) {
      errors.push("Mismatched parentheses ( )");
    } else {
      // Check for basic function structure
      const functionMatch = trimmedScript.match(
        /function\s+filter\s*\(\s*\w+\s*\)/,
      );
      if (!functionMatch) {
        errors.push('Function must be declared as "function filter(download)"');
      } else if (!trimmedScript.includes("return")) {
        errors.push("Function must contain a return statement");
      }
    }
  } catch (error) {
    errors.push(error.message);
  }

  return errors;
}

/**
 * Formats a JavaScript script with basic indentation
 * @param {string} script - The JavaScript code to format
 * @returns {string} - The formatted script
 */
export function formatScript(script) {
  if (!script.trim()) return script;

  try {
    // Basic formatting - add proper indentation
    const formatted = script
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .replace(/\{/g, "{\n  ")
      .replace(/\}/g, "\n}")
      .replace(/;/g, ";\n")
      .split("\n")
      .map((line) => {
        const depth =
          (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        return "  ".repeat(Math.max(0, depth)) + line.trim();
      })
      .join("\n")
      .replace(/\n\s*\n/g, "\n"); // Remove extra blank lines

    return formatted;
  } catch (error) {
    console.warn("Failed to format script:", error);
    return script; // Return original if formatting fails
  }
}

/**
 * Tests a custom filter script by sending it to the background script
 * @param {string} script - The JavaScript code to test
 * @param {Object} testData - Optional test data, defaults to sample data
 * @returns {Promise<Object>} - Test result object
 */
export async function testScript(script, testData = sampleTestData) {
	if (!script.trim()) {
		throw new Error("Script is empty");
	}

	try {
		const response = await browser.runtime.sendMessage({
			type: "TEST_CUSTOM_FILTER",
			script: script,
			testData: testData,
		});

		return response;
	} catch (error) {
		return {
			success: false,
			error: error.message,
		};
	}
}

/**
 * Creates a debounced version of the validation function
 * @param {Function} validationFn - The validation function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced validation function
 */
export function createDebouncedValidator(validationFn, delay = 500) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => validationFn(...args), delay);

    // Return cleanup function
    return () => clearTimeout(timeoutId);
  };
}
