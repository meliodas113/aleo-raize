"use client";
import BetActions from "@/components/BetDetailView/BetActions";
import BetDetails from "@/components/BetDetailView/BetDetails";
import React, { useContext, useEffect, useState } from "react";
import "./styles.scss";
import { usePathname, useRouter } from "next/navigation";
import { useAccount, useContract } from "@starknet-react/core";
import abi from "../../../../abi/ContractABI.json";
import { CONTRACT_ADDRESS } from "@/components/helpers/constants";
import { Market } from "@/components/helpers/types";
import { NextPage } from "next";
import { enqueueSnackbar } from "notistack";
import CustomLogo from "@/components/common/CustomIcons";
import { BACK_LOGO } from "@/components/helpers/icons";
import { Box, Skeleton } from "@mui/material";
import { HiLockClosed } from "react-icons/hi";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { fetchData } from "@/components/services/api";
import { bigIntToString } from "leostringer";

const BetDetailView: NextPage = () => {
  const router = useRouter();
  const [market, setMarket] = useState<Market | null>(null);
  const handleBack = () => {
    router.push("/");
  };
  const pathname = usePathname();
  const { publicKey } = useWallet();

  useEffect(() => {
    const getMarket = async () => {
      const encoded = pathname.split("/")[3];
      const marketId = parseInt(encoded);
      console.log(marketId, encoded);
      const market = await fetchData("markets", marketId.toString());
      if (market && market !== "None") {
        const marketData = {} as Market;
        marketData.name = bigIntToString(
          BigInt(market.match(/name:\s*(\d+)field/)[1])
        );
        marketData.category = bigIntToString(
          BigInt(market.match(/category:\s*(\d+)field/)[1])
        );
        marketData.deadline = (Date.now() + 24 * 60 * 60 * 1000).toString();
        marketData.description = bigIntToString(
          BigInt(market.match(/description:\s*(\d+)field/)[1])
        );
        marketData.is_active = true;
        marketData.is_settled = false;
        marketData.outcomes = [
          {
            name: "Yes",
            bought_shares: market.match(/outcome1_pool:\s*(\d+)u64/)[1],
          },
          {
            name: "No",
            bought_shares: market.match(/outcome2_pool:\s*(\d+)u64/)[1],
          },
        ];
        marketData.money_in_pool = 0;
        marketData.image = "https://placehold.co/800@3x.svg";
        marketData.market_id = Number(
          bigIntToString(BigInt(market.match(/market_id:\s*(\d+)u64/)[1]))
        );
        console.log(marketData, "final object");
        setMarket(marketData);
      }
    };
    getMarket();
  }, [publicKey, pathname]);

  const checkDeadline = (): boolean => {
    const currentTime = new Date().getTime();
    const deadline = new Date(parseInt(market?.deadline!)).getTime();
    return currentTime > deadline;
  };

  return (
    <div className="BetDetailView">
      <div className="GoBack" onClick={handleBack}>
        <CustomLogo width={"30px"} height={"20px"} src={BACK_LOGO} />
        <div>Back</div>
      </div>
      <BetDetails
        category={market?.category || ""}
        duration={market?.deadline || ""}
        heading={market?.name || ""}
        logo={market?.image || ""}
        subHeading={market?.description || ""}
        moneyInPool={market?.money_in_pool || 0}
      />
      {market ? (
        !market?.is_active || checkDeadline() ? (
          <Box className="MarketClosed">
            <span>
              This Market is now closed, please wait patiently for the results
              to get declared, and be sure to claim your winnings!
            </span>
          </Box>
        ) : (
          <BetActions
            moneyInPool={market?.money_in_pool!}
            outcomes={market?.outcomes!}
            category={market?.category!}
          />
        )
      ) : (
        <Skeleton />
      )}
    </div>
  );
};

export default BetDetailView;
