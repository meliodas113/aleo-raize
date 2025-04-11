import React from "react";
import "./styles.scss";
import { Market, OpenMarket, UserBet } from "@/components/helpers/types";
import { getNumber, getString } from "@/components/helpers/functions";
import { ALEO_LOGO, USDC_LOGO } from "@/components/helpers/icons";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import CustomLogo from "@/components/common/CustomIcons";
import LoaderComponent from "../LoaderComponent";
import EmptyBetComponent from "../EmptyBetComponent";
import DetailsButton from "./DetailsButton";
import { options } from "@/components/helpers/constants";

interface Props {
  openMarkets: OpenMarket[];
  loading: boolean;
}

function OpenPositions({ openMarkets, loading }: Props) {
  return (
    <div className="OpenPositions">
      <div className="Heading">Open Positions</div>
      <div className="Container">
        {loading ? (
          <LoaderComponent />
        ) : openMarkets.length > 0 ? (
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
            {openMarkets.map((market, index) => (
              <div className="Data" key={index}>
                <span className="Status">Open</span>
                <span className="Event">{market.name}</span>
                <span className="DatePlaced">
                  {
                    new Date(parseInt(market.deadline))
                      .toString()
                      .split("GMT")[0]
                  }
                </span>
                <span className="BetToken StakedAmount">
                  <Box className="TokenLogo">
                    <CustomLogo src={ALEO_LOGO} />
                  </Box>
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
            ))}
          </>
        ) : (
          <EmptyBetComponent text="You have no open positions" />
        )}
      </div>
    </div>
  );
}

export default OpenPositions;
