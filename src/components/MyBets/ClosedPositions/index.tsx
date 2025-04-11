import React, { useEffect, useMemo, useState } from "react";
import "./styles.scss";
import Image from "next/image";
import { ClosedMarket, Market, UserBet } from "@/components/helpers/types";
import { getNumber, getString } from "@/components/helpers/functions";
import {
  useAccount,
  useContract,
  useContractWrite,
  useWaitForTransaction,
} from "@starknet-react/core";
import { CONTRACT_ADDRESS, options } from "@/components/helpers/constants";
import abi from "../../../abi/ContractABI.json";
import { USDC_LOGO } from "@/components/helpers/icons";
import { enqueueSnackbar } from "notistack";
import LoaderComponent from "../LoaderComponent";
import EmptyBetComponent from "../EmptyBetComponent";
import { motion } from "framer-motion";
import { Box } from "@mui/material";
import CustomLogo from "@/components/common/CustomIcons";
import DetailsButton from "../OpenPositions/DetailsButton";
import useClaimWinnings from "@/components/hooks/useClaimWinnings";

interface Props {
  closedMarkets: ClosedMarket[];
  loading: boolean;
}

enum WinStatus {
  Won = "Won",
  Lost = "Lost",
  Claimable = "Claim",
}

function ClosedPositions({ closedMarkets, loading }: Props) {
  const [winStatus, setWinStatus] = useState<WinStatus[]>([]);
  const { ClaimWinnings, ClaimTransfer, userWinnings } = useClaimWinnings();

  useEffect(() => {
    const newWinStatus = closedMarkets.map((market, index) => {
      const bet = market.betOutcome;

      if (!bet) return WinStatus.Lost;
      if (market.winning_outcome && market.winning_outcome === bet) {
        return market.isClaimed ? WinStatus.Won : WinStatus.Claimable;
      } else {
        return WinStatus.Lost;
      }
    });
    setWinStatus(newWinStatus);
  }, [closedMarkets]);

  const storeMarket = (marketId: number, betNumber: number) => {};

  const handleToast = (
    message: string,
    subHeading: string,
    type: string,
    hash?: string
  ) => {
    enqueueSnackbar(message, {
      //@ts-ignore
      variant: "custom",
      subHeading: subHeading,
      hash: hash,
      type: type,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
    });
  };

  const handleStartClaim = (bet: any) => {
    ClaimWinnings(bet);
  };

  const renderMarket = (market: ClosedMarket, index: number) => {
    const isClaimable = market.isClaimed;
    const hasWon = market.winning_outcome === market.betOutcome;
    const statusClass = isClaimable ? "Claim" : hasWon ? "Won" : "Lost";

    return (
      <div className="Data" key={index}>
        <span className={`Status`}>
          {userWinnings && winStatus[index] === "Claim" ? (
            <span
              className={`${statusClass}`}
              onClick={() => {
                ClaimTransfer();
              }}
            >
              Claim now
            </span>
          ) : (
            <span
              className={`${statusClass}`}
              onClick={() => {
                handleStartClaim(market.Bet);
              }}
            >
              {winStatus[index]}
            </span>
          )}
        </span>
        <span className="Event">{market.name}</span>
        <span className="DatePlaced">
          {new Date(parseInt(market.deadline)).toString().split("GMT")[0]}
        </span>
        <span className="BetToken StakedAmount">
          <Box className="TokenLogo">
            <CustomLogo src={USDC_LOGO} />
          </Box>{" "}
          {market.betAmount}
        </span>
        <span className="Yes Prediction">
          {market.betOutcome === "1" ? "Yes" : "No"}
        </span>
        <DetailsButton
          name={market.name}
          date={new Date(parseInt(market.deadline)).toLocaleDateString(
            "en-US",
            options
          )}
          amount={market.betAmount.toString()}
          prediction={market.betOutcome === "1" ? "Yes" : "No"}
        />
      </div>
    );
  };

  return (
    <div className="ClosedPositions">
      <div className="Heading">Closed Positions</div>
      <div className="Container">
        {loading ? (
          <LoaderComponent />
        ) : closedMarkets.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 0.35 }}
              className="Headings"
            >
              <span className="Status">Status</span>
              <span className="Event">Event</span>
              <span className="DatePlaced">Bet Deadline</span>
              <span className="StakedAmount">Staked Amount</span>
              <span className="Prediction">Prediction</span>
              <span className="Details"></span>
            </motion.div>
            {closedMarkets.map(renderMarket)}
          </>
        ) : (
          <EmptyBetComponent text="You have no closed positions" />
        )}
      </div>
    </div>
  );
}

export default ClosedPositions;
