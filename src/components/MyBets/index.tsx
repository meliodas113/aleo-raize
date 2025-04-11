"use client";
import React, { useEffect, useState } from "react";
import OpenPositions from "./OpenPositions";
import ClosedPositions from "./ClosedPositions";
import "./styles.scss";
import { Market, UserBet } from "../helpers/types";
import { useAccount, useContract } from "@starknet-react/core";
import { CONTRACT_ADDRESS } from "../helpers/constants";
import abi from "../../abi/ContractABI.json";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import useFetchRecords from "../hooks/useFetchRecords";

function MyBets() {
  const { publicKey } = useWallet();

  const [openMarkets, setOpenMarkets] = useState<Market[]>([]);
  const [openBets, setOpenBets] = useState<any>([]);
  const [closedMarkets, setClosedMarkets] = useState<Market[]>([]);
  const [closedBets, setClosedBets] = useState<any>([]);
  const { loading, data, closedMarkets: dataClosed } = useFetchRecords();

  useEffect(() => {
    const getAllMarkets = async () => {
      if (!publicKey) {
        return;
      }
      if (openMarkets.length > 0 || closedMarkets.length > 0) return;
      // const normal_res = await contract.get_user_markets(address);
      const openMarketsRes: Market[] = [];
      const closedMarketsRes: Market[] = [];
      const openBets: any[] = [];
      const closedBets: any[] = [];
      // for (const market of normal_res) {
      //   const getBetCount = await contract.get_num_bets_in_market(
      //     address,
      //     market.market_id
      //   );
      //   for (let i = 0; i < getBetCount; i++) {
      //     let betNumber = i + 1;
      //     const outcomeAndBet: UserBet = await contract.get_outcome_and_bet(
      //       address,
      //       market.market_id,
      //       i + 1
      //     );
      //     if (market.is_active) {
      //       openMarketsRes.push(market);
      //       openBets.push(outcomeAndBet);
      //     } else {
      //       closedBets.push({ outcomeAndBet, betNumber });
      //       closedMarketsRes.push(market);
      //     }
      //   }
      // }
      setOpenMarkets(openMarketsRes);
      setClosedMarkets(closedMarketsRes);
      setOpenBets(openBets);
      setClosedBets(closedBets);
    };
    getAllMarkets();
  }, [publicKey]);

  return (
    <div className="MyBets">
      <OpenPositions loading={loading} openMarkets={data} />
      <ClosedPositions loading={loading} closedMarkets={dataClosed} />
    </div>
  );
}

export default MyBets;
