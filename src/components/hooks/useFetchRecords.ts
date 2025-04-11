import { useEffect, useState } from "react";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { ClosedMarket, Market, OpenMarket } from "../helpers/types";
import { fetchData } from "../services/api";
import { bigIntToString } from "leostringer";

function useFetchRecords() {
  const [loading, setLoading] = useState(false);
  const { publicKey, requestRecords } = useWallet();
  const [markets, setMarkets] = useState<OpenMarket[]>([]);
  const [closedMarkets, setClosedMarkets] = useState<ClosedMarket[]>([]);

  useEffect(() => {
    const fetchAleoData = async () => {
      setLoading(true);
      try {
        let records = await requestRecords!("raize_market_new_aleo.aleo");
        /**
         * [
    {
        "id": "1c2f7a49-6ff3-53a6-b5d2-faa6ca00266f",
        "owner": "aleo1hkj4afvdh4x39zcq58q7c73agvne765m00u0y45k7eansrkxcygqcplf63",
        "program_id": "raize_market_new_aleo.aleo",
        "spent": false,
        "recordName": "Bet",
        "data": {
            "market_id": "1u64.private",
            "outcome": "1u8.private",
            "amount_paid": "60000u64.private"
        }
    }
]
         */
        console.log(records, "record");
        records.forEach(async (el) => {
          const market = {} as any;
          const marketId = el.data.market_id.split(".")[0];
          const marketIdFormatted = marketId.match(/\s*(\d+)u64/)[1];
          console.log(marketId, marketIdFormatted);
          const marketData = await fetchData("markets", marketId);
          console.log(marketData, "market");
          if (marketData && marketData !== "None") {
            market.name = bigIntToString(
              BigInt(marketData.match(/name:\s*(\d+)field/)[1])
            );
            market.deadline = (Date.now() + 24 * 60 * 60 * 1000).toString();
            market.betAmount =
              parseInt(
                el.data.amount_paid.split(".")[0].match(/\s*(\d+)u64/)[1]
              ) /
              10 ** 5;
            market.betOutcome = el.data.outcome
              .split(".")[0]
              .match(/\s*(\d+)u8/)[1];
            const is_Settled = Boolean(
              marketData.match(/is_settled:\s*(true|false)/)[1] === "false"
                ? 0
                : 1
            );
            if (is_Settled) {
              //@ts-ignore
              market.winning_outcome = marketData.match(
                /winning_outcome:\s*(\d+)u8/
              )[1];
              //@ts-ignore
              market.isClaimed = el.spent;
              market.Bet = el;
              setClosedMarkets((prevMarkets) => [...prevMarkets, market]);
            } else {
              setMarkets((prevMarkets) => [...prevMarkets, market]);
            }
          }
        });

        console.log(markets, "open");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAleoData();
  }, [publicKey, requestRecords]);

  return { loading, data: markets, closedMarkets };
}

export default useFetchRecords;
