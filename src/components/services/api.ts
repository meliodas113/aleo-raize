/**
 * Fetches a specific value from an Aleo program mapping on the AleoScan API.
 *
 * @param mapping - The name of the mapping to fetch from (e.g. "markets")
 * @param field - The key within the mapping (usually an ID or identifier)
 * @returns The value retrieved from the API, or undefined if an error occurs
 */
export async function fetchData(mapping: string, field: string) {
  try {
    // Construct the request URL for the AleoScan testnet API
    const response = await fetch(
      `https://testnet.aleoscan.io/api/v1/mapping/get_value/raize_market_new_aleo.aleo/${mapping}/${field}`
    );

    // Check for non-OK responses and throw an error to trigger the catch block
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response body as JSON
    const data = await response.json();

    // Log the result for debugging purposes
    console.log("Fetched Data:", data);

    // Return the fetched mapping value
    return data;
  } catch (error) {
    // Catch and log any errors that occur during fetch or JSON parsing
    console.error("Error fetching data:", error);
  }
}
