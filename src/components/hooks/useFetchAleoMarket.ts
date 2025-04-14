import { useEffect, useState } from "react";
import { fetchData } from "../services/api";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { bigIntToString } from "leostringer";
import { Market } from "../helpers/types";

const PLACEHOLDER_IMAGE = "https://placehold.co/800@3x.svg";

function useFetchAleoMarket() {
  const { requestTransaction, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    const fetchMarkets = async () => {
      setLoading(true);
      try {
        const rawMarketCount = await fetchData("market_count", "0");

        const marketCount =
          rawMarketCount === "None"
            ? 0
            : Number(rawMarketCount.match(/^(\d+)u64$/)?.[1] ?? 0);

        if (marketCount === 0) return;

        const fetchedMarkets: Market[] = [];

        for (let i = 0; i < marketCount; i++) {
          const rawMarket = await fetchData("markets", i.toString());
          if (!rawMarket || rawMarket === "None") continue;

          const getFieldValue = (pattern: RegExp) => {
            const match = rawMarket.match(pattern);
            return match ? match[1] : "0";
          };

          const isSettled =
            getFieldValue(/is_settled:\s*(true|false)/) === "true";

          //@ts-ignore
          const market: Market = {
            name: bigIntToString(BigInt(getFieldValue(/name:\s*(\d+)field/))),
            category: bigIntToString(
              BigInt(getFieldValue(/category:\s*(\d+)field/))
            ),
            description: bigIntToString(
              BigInt(getFieldValue(/description:\s*(\d+)field/))
            ),
            deadline: (Date.now() + 24 * 60 * 60 * 1000).toString(), // 1 day later
            is_active: !isSettled,
            is_settled: isSettled,
            market_id: Number(getFieldValue(/market_id:\s*(\d+)u64/)),
            money_in_pool:
              Number(getFieldValue(/outcome1_pool:\s*(\d+)u64/)) +
              Number(getFieldValue(/outcome2_pool:\s*(\d+)u64/)),
            outcomes: [
              { name: "Yes", bought_shares: "0" },
              { name: "No", bought_shares: "0" },
            ],
            image: PLACEHOLDER_IMAGE,
          };

          fetchedMarkets.push(market);
        }

        setMarkets(fetchedMarkets);
      } catch (error) {
        console.error("Failed to fetch market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const placeBet = async () => {
    if (!publicKey || !requestTransaction) {
      console.warn("Wallet not connected or requestTransaction unavailable");
      return;
    }

    try {
      const result = await requestTransaction({
        address: publicKey,
        chainId: "testnetbeta",
        transitions: [
          {
            program: "raize_aleo.aleo",
            functionName: "place_bet",
            inputs: ["1u64", "1u8", "1u64"],
          },
        ],
        fee: 100000, // microcredits
        feePrivate: false,
      });

      console.log("Transaction result:", result);
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  return { loading, data: markets, placeBet };
}

export default useFetchAleoMarket;
