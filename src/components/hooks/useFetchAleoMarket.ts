import { useEffect, useState } from "react";
import { fetchData } from "../services/api";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import {
  stringConverter,
  formatInput,
  bigIntToString,
  stringToBigInt,
  splitStringToBigInts,
  bigIntConverter,
  calculateDataFieldsNeeded,
} from "leostringer";
import { Market } from "../helpers/types";

function cleanInput(input: string) {
  // Remove control characters (codes 0-31 and 127)
  return input.replace(/[\u0000-\u001F\u007F]/g, "");
}

// Function to process individual values
function processValue(valueStr: string) {
  valueStr = valueStr.trim();

  // Handle boolean values
  if (valueStr === "true") return true;
  if (valueStr === "false") return false;

  // Handle nested objects
  if (valueStr.startsWith("{") && valueStr.endsWith("}")) {
    return processString(valueStr); // Recursively process nested object
  }

  // Handle values ending with "field" (e.g., large numbers)
  if (valueStr.endsWith("field")) {
    let strValue = valueStr.slice(0, -5); // Remove "field" suffix
    if (/^\d+$/.test(strValue)) {
      // Check if it’s all digits
      try {
        const bigIntValue = BigInt(strValue); // Convert to BigInt
        return bigIntToString(bigIntValue); // Convert to string
      } catch (e) {
        console.error(`Failed to convert ${strValue} to BigInt: ${e}`);
        return strValue; // Fallback to original string if invalid
      }
    }
    return strValue; // Non-numeric, return as-is
  }

  // Handle numeric values with type suffixes (e.g., "2u64")
  const typeSuffixRegex = /u\d+$/;
  if (typeSuffixRegex.test(valueStr)) {
    let numStr = valueStr.replace(typeSuffixRegex, ""); // Remove suffix
    try {
      const bigIntValue = BigInt(numStr);
      return bigIntToString(bigIntValue);
    } catch (e) {
      console.error(`Failed to convert ${numStr} to BigInt: ${e}`);
      return numStr;
    }
  }

  // Default: return the value as a string
  return valueStr;
}

// Function to parse the input string into an object
function processString(content: string) {
  let result = {};
  let pos = 0;
  const len = content.length;

  // Remove outer braces
  content = content.trim();
  if (content.startsWith("{") && content.endsWith("}")) {
    content = content.substring(1, content.length - 1);
  }

  while (pos < len) {
    // Skip leading commas or spaces
    while (pos < len && (content[pos] === "," || content[pos] === " ")) {
      pos++;
    }
    if (pos >= len) break;

    // Capture key
    let keyStart = pos;
    while (pos < len && content[pos] !== ":") {
      pos++;
    }
    let key = content.substring(keyStart, pos).trim();
    pos++; // Skip colon

    // Skip spaces after colon
    while (pos < len && content[pos] === " ") {
      pos++;
    }

    // Capture value
    let valueStart = pos;
    let braceLevel = 0;
    while (pos < len) {
      if (content[pos] === "{") braceLevel++;
      else if (content[pos] === "}") braceLevel--;
      else if (content[pos] === "," && braceLevel === 0) break;
      pos++;
    }
    let valueEnd = pos;
    let valueStr = content.substring(valueStart, valueEnd).trim();

    // Process the value and assign to result
    //@ts-ignore
    result[key] = processValue(valueStr);

    // Move past comma
    if (pos < len && content[pos] === ",") pos++;
  }

  return result;
}

// Main function to transform input
function transformInput(input: string) {
  const cleanedInput = cleanInput(input); // Remove control characters
  return processString(cleanedInput); // Parse and process
}

function useFetchAleoMarket() {
  const [loading, setLoading] = useState(false);
  const { requestTransaction, publicKey } = useWallet();
  const [markets, setMarkets] = useState<Market[]>([]);

  const convertData = (formatInputStr: string) => {
    // Regular expression to match both data1 and data2 values
    const regex = /data1:\s*(\d+)u128(?:,\s*data2:\s*(\d+)u128)?/;
    const match = formatInputStr.match(regex);

    if (match) {
      const data1 = match[1];
      const data2 = match[2];

      console.log("data1:", data1);
      console.log("data2:", data2);
      return `${data1}u128`;
    } else {
      console.log("No match found");
    }
  };

  // const createMarket = async () => {
  //   if (requestTransaction && publicKey) {
  //     try {
  //       console.log("Test", publicKey);
  //       const string = "TestTest";
  //       const convertedInput = stringConverter(string);
  //       const formattedNew = formatInput(convertedInput);
  //       console.log(
  //         formattedNew,
  //         "string converted",
  //         convertedInput,
  //         typeof formattedNew
  //       );
  //       console.log(
  //         JSON.parse(JSON.stringify(formattedNew)),
  //         "oarsed",
  //         typeof formattedNew
  //       );
  //       convertData(formattedNew);
  //       console.log({
  //         program: "raize_aleo.aleo",
  //         functionName: "create_market",
  //         inputs: [
  //           {
  //             market_id: "1u64",
  //             name: `${convertData(formatInput(stringConverter("Test")))}field`,
  //             description: `${convertData(
  //               formatInput(stringConverter("TestDescription"))
  //             )}field`,
  //             category: `${convertData(
  //               formatInput(stringConverter("TestDescription"))
  //             )}field`,
  //             image: `${convertData(
  //               formatInput(
  //                 stringConverter(
  //                   "https://placehold.co/600x400/000000/FFFFFF/png"
  //                 )
  //               )
  //             )}field`,
  //             outcome_1: {
  //               name: `${convertData(
  //                 formatInput(stringConverter("yes"))
  //               )}field`,
  //               description: `${convertData(
  //                 formatInput(stringConverter("TestDescription"))
  //               )}field`,
  //               category: `${convertData(
  //                 formatInput(stringConverter("TestDescription"))
  //               )}field`,
  //               image: `${convertData(
  //                 formatInput(
  //                   stringConverter(
  //                     "https://placehold.co/600x400/000000/FFFFFF/png"
  //                   )
  //                 )
  //               )}field`,
  //             },
  //             outcome_2: {
  //               name: `${convertData(formatInput(stringConverter("no")))}field`,
  //               description: `${convertData(
  //                 formatInput(stringConverter("TestDescription"))
  //               )}field`,
  //               category: `${convertData(
  //                 formatInput(stringConverter("TestDescription"))
  //               )}field`,
  //               image: `${convertData(
  //                 formatInput(
  //                   stringConverter(
  //                     "https://placehold.co/600x400/000000/FFFFFF/png"
  //                   )
  //                 )
  //               )}field`,
  //             },
  //             outcome_1_shares: "0u64",
  //             outcome_2_shares: "0u64",
  //             outcome_1_pool: "0u64",
  //             outcome_2_pool: "0u64",
  //             is_Settled: "false",
  //             winning_outcome: "0u8",
  //           },
  //         ],
  //       });
  //       const result = await requestTransaction({
  //         address: publicKey || "",
  //         chainId: "testnetbeta",
  //         transitions: [
  //           {
  //             program: "raize_aleo.aleo",
  //             functionName: "create_market",
  //             inputs: [
  //               "{market_id: 5u64,name: 1953719636field,description: 573412356898059161959434995262252372field,category: 573412356898059161959434995262252372field,image: 144135085899468267716631502586916402280field,outcome_1: {name: 7562617field,description: 573412356898059161959434995262252372field,image: 144135085899468267716631502586916402280field, category: 573412356898059161959434995262252372field},outcome_2: {name: 28526field,description: 573412356898059161959434995262252372field,image: 144135085899468267716631502586916402280field, category: 573412356898059161959434995262252372field},outcome1_pool: 0u64,outcome2_pool: 0u64,is_settled: false,winning_outcome: 0u8}",
  //             ],
  //           },
  //         ],
  //         fee: 100000,
  //         feePrivate: false,
  //       }).catch((error) => {
  //         console.log(error, "requestTransaction");
  //       });
  //       console.log({ result });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // };

  useEffect(() => {
    const fetchAleoData = async () => {
      setLoading(true);
      try {
        const marketCount = await fetchData("market_count", "0");
        const marketCountNumber =
          marketCount === "None"
            ? 0
            : Number(marketCount.match(/^(\d+)u64$/)[1]);
        if (marketCountNumber > 0) {
          for (let i = 0; i < marketCountNumber; i++) {
            const market = await fetchData("markets", i.toString());
            if (market && market !== "None") {
              console.log(
                market.match(/is_settled:\s*(true|false)/)[1],
                "bool"
              );
              const marketData = {} as Market;
              marketData.name =
                i === 4
                  ? "Will BTC cross 100k?"
                  : bigIntToString(
                      BigInt(market.match(/name:\s*(\d+)field/)[1])
                    );
              marketData.category =
                i === 4
                  ? "Crypto"
                  : bigIntToString(
                      BigInt(market.match(/category:\s*(\d+)field/)[1])
                    );
              marketData.deadline = (
                Date.now() +
                24 * 60 * 60 * 1000
              ).toString();
              marketData.description =
                i === 4
                  ? "Will BTC cross 100k in 2025?"
                  : bigIntToString(
                      BigInt(market.match(/description:\s*(\d+)field/)[1])
                    );
              marketData.is_active = !Boolean(
                market.match(/is_settled:\s*(true|false)/)[1] === "false"
                  ? 0
                  : 1
              );
              marketData.is_settled = Boolean(
                market.match(/is_settled:\s*(true|false)/)[1] === "false"
                  ? 0
                  : 1
              );
              marketData.outcomes = [
                {
                  name: "Yes",
                  bought_shares: "0",
                },
                {
                  name: "No",
                  bought_shares: "0",
                },
              ];
              marketData.money_in_pool =
                Number(market.match(/outcome1_pool:\s*(\d+)u64/)[1]) +
                Number(market.match(/outcome2_pool:\s*(\d+)u64/)[1]);
              marketData.image = "https://placehold.co/800@3x.svg";
              marketData.market_id = Number(
                market.match(/market_id:\s*(\d+)u64/)[1]
              );
              setMarkets((prevMarkets) => [...prevMarkets, marketData]);
            }
          }
        }
      } catch (error) {
        console.log(error);
        throw new Error("Error in fetch Market Data");
      } finally {
        setLoading(false);
      }
    };
    console.log(bigIntToString(BigInt(1953719636)), "string format");
    fetchAleoData();
  }, []);

  const placeBet = async () => {
    try {
      const result = await requestTransaction?.({
        address: publicKey || "",
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_aleo.aleo",
            functionName: "place_bet",
            inputs: ["1u64", "1u8", "1u64"],
          },
        ],
        fee: 100000, // fees in microcredits
        feePrivate: false,
      });
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  return { loading, data: markets, placeBet };
}

export default useFetchAleoMarket;
