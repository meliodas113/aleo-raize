"use client";
import { NextPage } from "next";
import { useEffect, useRef, useState } from "react";

import "./styles.scss";
import BetHeroCard from "./BetHeroCard";
import { AMMA_LOGO, US_LOGO } from "../helpers/icons";
import BetCard from "./BetCard";
import { FPMMMarketInfo, Market } from "../helpers/types";
import { getNumber, getString } from "../helpers/functions";
import { motion } from "framer-motion";
import CustomLoader from "../common/CustomLoader";
import ContBetCard from "./ContBetCard";
import useFetchAleoMarket from "../hooks/useFetchAleoMarket";

interface Props {}

const tabList = [
  {
    tabName: "Trending",
  },
  {
    tabName: "Continuous Markets",
  },
  {
    tabName: "Closing Soon",
  },
  {
    tabName: "Crypto Market",
  },
  {
    tabName: "Sports",
  },
  {
    tabName: "Global Politics",
  },
  {
    tabName: "Pop Culture",
  },
];

const BetSection: NextPage<Props> = ({}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [contMarkets, setContMarkets] = useState<FPMMMarketInfo[]>([]);
  const betCardWrapperDiv = useRef<HTMLDivElement | null>(null);

  const scrollToElement = () => {
    if (betCardWrapperDiv.current) {
      betCardWrapperDiv.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { loading: aleoLoading } = useFetchAleoMarket();

  useEffect(() => {
    setActiveTab(0);
  }, []);

  return (
    <div className="BetSection">
      {/* HERO CARDS SECTION? */}
      <div className="BetSection-Hero">
        <div className="BetSection-HeroCard">
          <BetHeroCard
            setActiveTab={setActiveTab}
            categoryIndex={5}
            category="Politics"
            categoryLogo={US_LOGO}
            categoryName="US Elections"
            cardBgColor="linear-gradient(67.58deg, #E20000 -0.96%, #9B3838 78.06%)"
            image="/assets/images/pol.svg"
            scrollFn={scrollToElement}
            enabled={true}
          />
        </div>
        <div className="BetSection-HeroCard">
          <BetHeroCard
            setActiveTab={setActiveTab}
            categoryIndex={1}
            category="Sports"
            categoryLogo={AMMA_LOGO}
            categoryName="Armored MMA"
            cardBgColor="linear-gradient(90deg, #143CDA 0%, #0D268A 100%)"
            image="/assets/images/fighters.svg"
            scrollFn={scrollToElement}
            height="230px"
            width="370px"
            enabled={true}
          />
        </div>
      </div>
      {/* HERO CARDS SECTION? */}

      <div ref={betCardWrapperDiv} className="BetSection-CardWrapper">
        {/* Selection Tab */}
        <div className="Tabs-Section">
          {tabList.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                setActiveTab(index);
              }}
              className={activeTab === index ? "Tab-Active" : "Tab"}
            >
              {item.tabName}
            </div>
          ))}
        </div>
        {/* Selection Tab */}
        <div className="BetCard-Wrapper">
          {loading ? (
            <div className="LoaderDiv">
              <CustomLoader size={"55"} color="#9C9C9C" />
            </div>
          ) : activeTab == 1 ? (
            contMarkets.filter((market) => market.active).length > 0 ? (
              contMarkets
                .filter((market) => market.active)
                .map((item, index) => (
                  <div key={index} className="BetCard-Container">
                    <ContBetCard
                      marketId={item.market_id}
                      category={item.category}
                      logo={AMMA_LOGO}
                      deadline={item.deadline}
                      heading={item.question}
                      subHeading={item.description}
                      outcomes={item.outcomes}
                      isActive={item.active}
                    />
                  </div>
                  // Bet single Card
                ))
            ) : (
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ ease: "easeInOut", duration: 0.25 }}
                className="PlaceholderText"
              >
                No Active Events
              </motion.span>
            )
          ) : activeTab === 2 &&
            markets.filter((market) => {
              const deadline = new Date(parseFloat(market.deadline)).getTime();
              const oneDayFromNow = new Date().getTime();
              return deadline - oneDayFromNow < 86400000 * 7;
            }).length > 0 ? (
            markets
              .filter((market) => {
                const deadline = new Date(
                  parseFloat(market.deadline)
                ).getTime();
                const oneDayFromNow = new Date().getTime();
                return deadline - oneDayFromNow < 86400000 * 7;
              })
              .map((item, index) => (
                <div key={index} className="BetCard-Container">
                  <BetCard
                    index={index}
                    marketId={item.market_id}
                    category={item.category}
                    logo={item.image}
                    duration={item.deadline}
                    heading={item.name}
                    subHeading={item.description}
                    outcomes={item.outcomes}
                    moneyInPool={item.money_in_pool}
                    isActive={item.is_active}
                  />
                </div>
              ))
          ) : activeTab === 0 && markets.length > 0 ? (
            markets
              .sort(
                (a, b) =>
                  parseFloat(getNumber(b.money_in_pool)) -
                  parseFloat(getNumber(a.money_in_pool))
              )
              .map((item, index) => (
                <div key={index} className="BetCard-Container">
                  {item.market_id == 23 ? (
                    <BetCard
                      index={index}
                      marketId={item.market_id}
                      category={item.category}
                      logo={item.image}
                      duration={item.deadline}
                      heading={item.name}
                      subHeading={item.description}
                      outcomes={item.outcomes}
                      moneyInPool={item.money_in_pool}
                      isActive={false}
                    />
                  ) : (
                    <BetCard
                      index={index}
                      marketId={item.market_id}
                      category={item.category}
                      logo={item.image}
                      duration={item.deadline}
                      heading={item.name}
                      subHeading={item.description}
                      outcomes={item.outcomes}
                      moneyInPool={item.money_in_pool}
                      isActive={item.is_active}
                    />
                  )}
                </div>
              ))
          ) : markets.length > 0 &&
            markets.filter((market) =>
              tabList[activeTab].tabName.includes(getString(market.category))
            ).length > 0 ? (
            markets
              .filter((market) =>
                tabList[activeTab].tabName.includes(getString(market.category))
              )
              .sort(
                (a, b) =>
                  parseFloat(getNumber(b.money_in_pool)) -
                  parseFloat(getNumber(a.money_in_pool))
              )
              .map((item, index) => (
                <div key={index} className="BetCard-Container">
                  {item.market_id == 23 ? (
                    <BetCard
                      index={index}
                      marketId={item.market_id}
                      category={item.category}
                      logo={item.image}
                      duration={item.deadline}
                      heading={item.name}
                      subHeading={item.description}
                      outcomes={item.outcomes}
                      moneyInPool={item.money_in_pool}
                      isActive={false}
                    />
                  ) : (
                    <BetCard
                      index={index}
                      marketId={item.market_id}
                      category={item.category}
                      logo={item.image}
                      duration={item.deadline}
                      heading={item.name}
                      subHeading={item.description}
                      outcomes={item.outcomes}
                      moneyInPool={item.money_in_pool}
                      isActive={item.is_active}
                    />
                  )}
                </div>
              ))
          ) : (
            <motion.span
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ ease: "easeInOut", duration: 0.25 }}
              className="PlaceholderText"
            >
              No Active Events
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetSection;
