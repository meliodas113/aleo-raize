export async function fetchData(mapping: string, field: string) {
  try {
    const response = await fetch(
      `https://testnet.aleoscan.io/api/v1/mapping/get_value/raize_market_maker.aleo/${mapping}/${field}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
