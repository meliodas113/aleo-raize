import { NextPage } from "next";
import { useContext, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useRouter } from "next/navigation";

import "./styles.scss";
import CustomLogo from "@/components/common/CustomIcons";
import { ALEO_LOGO, CLOCK_ICON, USDC_LOGO } from "@/components/helpers/icons";
import { MarketContext } from "@/app/context/MarketProvider";
import { Outcome } from "@/components/helpers/types";
import {
  getProbabilites,
  getString,
  getTimeBetween,
} from "@/components/helpers/functions";
import Image from "next/image";
import { Box } from "@mui/material";
import { HiLockClosed } from "react-icons/hi2";

interface Props {
  category: string;
  logo: string;
  duration: string;
  heading: string;
  subHeading: string;
  outcomes: Outcome[];
  moneyInPool: number;
  marketId: number;
  isActive: boolean;
  index?: number;
}

const BetCard: NextPage<Props> = ({
  category,
  logo,
  duration,
  heading,
  subHeading,
  outcomes,
  moneyInPool,
  marketId,
  isActive,
  index,
}) => {
  const router = useRouter();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [percent1, setPercent1] = useState(0);
  const [percent2, setPercent2] = useState(0);

  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [minutes, setMinutesRemaining] = useState(0);

  useEffect(() => {
    const currentTime = new Date().getTime();
    const deadline = new Date(parseInt(duration)).getTime();
    const timeBetween = getTimeBetween(deadline, currentTime);
    setDaysRemaining(timeBetween[0]);
    setHoursRemaining(timeBetween[1]);
    setMinutesRemaining(timeBetween[2]);
  }, [duration]);

  useEffect(() => {
    console.log(outcomes, marketId);
    const percentages = getProbabilites(
      outcomes[0].bought_shares.toString(),
      outcomes[1].bought_shares.toString()
    );
    setPercent1(percentages[0]);
    setPercent2(percentages[1]);
  }, [outcomes]);

  const { setChoice } = useContext(MarketContext);

  const stringToHex = (int: number) => {
    const hex = int.toString(16); // Convert to hex without padding
    const randomChars = Math.random().toString(36).substring(2, 6); // Generate 4 random characters
    return `${hex}${randomChars}`;
  };

  const handleOpen = (outcome: number) => {
    setChoice(outcome);
    router.push(`/bet-details/${category.replace(" ", "-")}/${marketId}`);
  };

  const checkDeadline = (): boolean => {
    const currentTime = new Date().getTime();
    const deadline = new Date(parseInt(duration)).getTime();
    return currentTime > deadline;
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transition:
          typeof index === "number"
            ? `all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) ${(index % 3) / 10}s`
            : "all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s",
      }}
      className="BetCard"
    >
      {(!isActive || checkDeadline()) && (
        <Box className="MarketClosed">
          <HiLockClosed />
          <span>Market Closed</span>
        </Box>
      )}

      <div className="BetCard-HeadingContainer">
        <div className="BetCard-CategoryContainer">
          <div className="CategoryLogo">
            <Image src={logo} alt="Logo" width={30} height={30} />
          </div>
          <div className="CategoryName">{category}</div>
        </div>
        <div className="Bet-Duration">
          <div className="DurationIcon">
            <CustomLogo src={CLOCK_ICON} />
          </div>
          {daysRemaining}d : {hoursRemaining}h : {minutes}m
        </div>
      </div>
      <div className="BetCard-DetailsWrapper">
        <span className="Heading">{heading}</span>
        <span className="Sub-Heading">{subHeading}</span>
      </div>
      <div className="BetCard-OptionsContainer">
        <div
          onClick={() => {
            handleOpen(0);
          }}
          className="BetCard-Option"
        >
          <span className="Green-Text">{outcomes[0].name}</span>
          <span className="Bet-Stat">{percent1.toFixed(2)}%</span>
        </div>
        <div
          onClick={() => {
            handleOpen(1);
          }}
          className="BetCard-Option"
        >
          <span className="Red-Text">{outcomes[1].name}</span>
          <span className="Bet-Stat">{percent2.toFixed(2)}%</span>
        </div>
      </div>
      <div className="Pool-Stats">
        Prize Pool
        <span className="Pool-Value">
          {(parseFloat(BigInt(moneyInPool).toString()) / 10 ** 5)
            .toString()
            .slice(0, 7)}
        </span>
        <div className="Starknet-logo">
          <CustomLogo src={ALEO_LOGO} />
        </div>
      </div>
    </div>
  );
};

export default BetCard;
