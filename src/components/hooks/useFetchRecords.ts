import { useEffect, useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { ClosedMarket, OpenMarket } from "../helpers/types";
import { fetchData } from "../services/api";
import { bigIntToString } from "leostringer";

function useFetchRecords() {
  const [loading, setLoading] = useState(false);
  const { publicKey, requestRecords } = useWallet();
  const [openMarkets, setOpenMarkets] = useState<OpenMarket[]>([]);
  const [closedMarkets, setClosedMarkets] = useState<ClosedMarket[]>([]);

  useEffect(() => {
    const fetchAleoData = async () => {
      if (!publicKey || !requestRecords) return;

      setLoading(true);
      try {
        const records = await requestRecords("raize_market_new_aleo.aleo");

        const open: OpenMarket[] = [];
        const closed: ClosedMarket[] = [];

        await Promise.all(
          records.map(async (record) => {
            try {
              const marketIdRaw = record.data.market_id.split(".")[0];
              const marketId = marketIdRaw.match(/\s*(\d+)u64/)?.[1];
              if (!marketId) return;

              const marketData = await fetchData("markets", marketId);
              if (!marketData || marketData === "None") return;

              const name = bigIntToString(
                BigInt(marketData.match(/name:\s*(\d+)field/)?.[1])
              );
              const deadline = (Date.now() + 24 * 60 * 60 * 1000).toString();
              const betAmount =
                parseInt(
                  record.data.amount_paid
                    .split(".")[0]
                    .match(/\s*(\d+)u64/)?.[1] || "0"
                ) /
                10 ** 5;
              const betOutcome = record.data.outcome
                .split(".")[0]
                .match(/\s*(\d+)u8/)?.[1];

              const isSettledRaw = marketData.match(
                /is_settled:\s*(true|false)/
              )?.[1];
              const isSettled = isSettledRaw === "true";

              if (isSettled) {
                const winningOutcome = marketData.match(
                  /winning_outcome:\s*(\d+)u8/
                )?.[1];
                closed.push({
                  name,
                  deadline,
                  betAmount,
                  betOutcome,
                  winning_outcome: winningOutcome || "0",
                  isClaimed: record.spent,
                  Bet: record,
                });
              } else {
                open.push({
                  name,
                  deadline,
                  betAmount,
                  betOutcome,
                });
              }
            } catch (err) {
              console.warn("Error parsing record:", err);
            }
          })
        );

        setOpenMarkets(open);
        setClosedMarkets(closed);
      } catch (error) {
        console.error("Error fetching Aleo records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAleoData();
  }, [publicKey, requestRecords]);

  return {
    loading,
    data: openMarkets,
    closedMarkets,
  };
}

export default useFetchRecords;
