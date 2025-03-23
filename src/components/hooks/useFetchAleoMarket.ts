import { useEffect, useState } from "react";
import { fetchData } from "../services/api";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { stringConverter, formatInput } from "leostringer";

function useFetchAleoMarket() {
  const [loading, setLoading] = useState(false);
  const { requestTransaction, publicKey } = useWallet();

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

  }

  const createMarket = async () => {
    if (requestTransaction && publicKey) {
      try {
        console.log("Test", publicKey);
        const string = "TestTest";
        const convertedInput = stringConverter(string);
        const formattedNew = formatInput(convertedInput);
        console.log(formattedNew, "string converted", convertedInput, typeof formattedNew);
        console.log(JSON.parse(JSON.stringify(formattedNew)), 'oarsed', typeof formattedNew)
        convertData(formattedNew);
        console.log({
          program: "raize_aleo.aleo",
          functionName: "create_market",
          inputs: [
            {
              market_id: "1u64",
              name: `${convertData(formatInput(stringConverter("Test")))}field`,
              description: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
              category: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
              image: `${convertData(formatInput(stringConverter(
                "https://placehold.co/600x400/000000/FFFFFF/png"
              ))
    )}field`,
              outcome_1: {
                name: `${convertData(formatInput(stringConverter("yes")))}field`,
                description: `${convertData(formatInput(stringConverter("TestDescription")))
                  }field`,
                category: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
                image: `${convertData(formatInput(stringConverter(
                  "https://placehold.co/600x400/000000/FFFFFF/png"
                )))
                  }field`,
              },
              outcome_2: {
                name: `${convertData(formatInput(stringConverter("no")))}field`,
                description: `${convertData(formatInput(stringConverter("TestDescription")
    ))}field`,
                category: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
                image: `${convertData(formatInput(stringConverter(
                  "https://placehold.co/600x400/000000/FFFFFF/png"
                )
    ))}field`,
              },
              outcome_1_shares: "0u64",
              outcome_2_shares: "0u64",
              outcome_1_pool: "0u64",
              outcome_2_pool: "0u64",
              is_Settled: "false",
              winning_outcome: "0u8",
            },
          ],
        })
        const result = await requestTransaction({
          address: publicKey || "",
          chainId: "testnetbeta",
          transitions: [
            {
              program: "raize_aleo.aleo",
              functionName: "create_market",
              inputs: [
                {
                  market_id: "1u64",
                  name: `${convertData(formatInput(stringConverter("Test")))}field`,
                  description: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
                  category: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
                  image: `${convertData(formatInput(stringConverter(
                    "https://placehold.co/600x400/000000/FFFFFF/png"
                  ))
        )}field`,
                  outcome_1: {
                    name: `${convertData(formatInput(stringConverter("yes")))}field`,
                    description: `${convertData(formatInput(stringConverter("TestDescription")))
                      }field`,
                    category: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
                    image: `${convertData(formatInput(stringConverter(
                      "https://placehold.co/600x400/000000/FFFFFF/png"
                    )))
                      }field`,
                  },
                  outcome_2: {
                    name: `${convertData(formatInput(stringConverter("no")))}field`,
                    description: `${convertData(formatInput(stringConverter("TestDescription")
        ))}field`,
                    category: `${convertData(formatInput(stringConverter("TestDescription")))}field`,
                    image: `${convertData(formatInput(stringConverter(
                      "https://placehold.co/600x400/000000/FFFFFF/png"
                    )
        ))}field`,
                  },
                  outcome_1_shares: "0u64",
                  outcome_2_shares: "0u64",
                  outcome_1_pool: "0u64",
                  outcome_2_pool: "0u64",
                  is_Settled: "false",
                  winning_outcome: "0u8",
                },
              ],
            },
          ],
          fee: 100000,
          feePrivate: false,
        }).catch((error) => {
          console.log(error, 'requestTransaction');
        });
        console.log({ result });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    createMarket();
  }, [requestTransaction, publicKey]);

  useEffect(() => {
    const fetchAleoData = async () => {
      setLoading(true);
      try {
        const marketCount = await fetchData("market_count", "0");
        console.log(marketCount, "count");
        const marketCountNumber =
          marketCount === "None" ? 0 : Number(marketCount);
        if (marketCountNumber > 0) {
          for (let i = 0; i < marketCountNumber; i++) {
            const market = await fetchData("markets", i.toString());
            console.log(market);
          }
        }
      } catch (error) {
        throw new Error("Error in fetch Market Data");
      } finally {
        setLoading(false);
      }
    };
    fetchAleoData();
  }, []);

  return { loading };
}

export default useFetchAleoMarket;
