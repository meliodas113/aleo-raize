import { useEffect, useState } from "react";
import { fetchData } from "../services/api";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { stringConverter, formatInput } from "leostringer";

function useFetchAleoMarket() {
  const [loading, setLoading] = useState(false);
  const { requestTransaction, publicKey } = useWallet();

  const createMarket = async () => {
    if (requestTransaction) {
      try {
        console.log("Test");
        const string = "Test Test";
        const convertedInput = stringConverter(string);
        const formattedNew = formatInput(convertedInput);
        console.log(formattedNew, "string converted");
        const result = await requestTransaction({
          address: publicKey || "",
          chainId: "testnetbeta",
          transitions: [
            {
              program: "raize_market_maker.aleo",
              functionName: "create_market",
              inputs: [
                {
                  market_id: "1u64",
                  name: `${stringConverter("Test")[0]}field`,
                  description: `${stringConverter("TestDescription")[0]}field`,
                  category: `${stringConverter("TestDescription")[0]}field`,
                  image: `${
                    stringConverter(
                      "https://placehold.co/600x400/000000/FFFFFF/png"
                    )[0]
                  }field`,
                  outcome_1: {
                    name: `${stringConverter("yes")[0]}field`,
                    description: `${
                      stringConverter("TestDescription")[0]
                    }field`,
                    category: `${stringConverter("TestDescription")[0]}field`,
                    image: `${
                      stringConverter(
                        "https://placehold.co/600x400/000000/FFFFFF/png"
                      )[0]
                    }field`,
                  },
                  outcome_2: {
                    name: `${stringConverter("no")[0]}field`,
                    description: `${
                      stringConverter("TestDescription")[0]
                    }field`,
                    category: `${stringConverter("TestDescription")[0]}field`,
                    image: `${
                      stringConverter(
                        "https://placehold.co/600x400/000000/FFFFFF/png"
                      )[0]
                    }field`,
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
        });
        console.log({ result });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    createMarket();
  }, [requestTransaction]);

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
