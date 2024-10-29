import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AuctionDataGrid.css";
import Loading from "../Loading";
import Logo from "./Logo"

// ~억, ~만 단위로 숫자를 포맷팅해줌
const formatPrice = (price) => {
  if (!price || isNaN(Number(price))) {
    return "판매 정보 없음";
  }

  const numericPrice = parseInt(price, 10);

  if (numericPrice >= 100000000) {
    const billionPart = Math.floor(numericPrice / 100000000);
    const restPart = Math.floor((numericPrice % 100000000) / 10000);
    return `${billionPart}억${restPart > 0 ? restPart + '만' : ''} Gold`;
  }

  if (numericPrice >= 10000) {
    return `${Math.floor(numericPrice / 10000)}만 Gold`;
  }

  return `${numericPrice} Gold`;
};

// 금액에 따라 색상을 반환하는 함수
const getPriceColor = (price) => {
  if (!price || isNaN(Number(price))) {
    return "#ccc";
  }

  const numericPrice = parseInt(price, 10);

  if (numericPrice > 10000000000) {
    return "#CE9D17"; // 100억 초과인 경우 노란색
  } else if (numericPrice > 100000000) {
    return "#C75060"; // 1억 초과인 경우 빨간색
  } else {
    return "#43abcb"; // 0 ~ 1억 이하인 경우 파란색
  }
};

function MileageDataGrid() {
  const [auctionData, setAuctionData] = useState(() => {
    // 초기 로드 시 로컬 스토리지에서 데이터를 가져옴
    const savedData = localStorage.getItem('mileageAuctionData');
    return savedData ? JSON.parse(savedData) : [];
  });
  const [loading, setLoading] = useState(auctionData.length === 0);

  useEffect(() => {
    const savedData = localStorage.getItem('mileageAuctionData');
    const savedTimestamp = localStorage.getItem('mileageAuctionDataTimestamp');
    const currentTime = new Date().getTime();
    const THIRTY_MINUTES = 30 * 60 * 1000; // 30분을 밀리초로 변환

    if (savedData && savedTimestamp && currentTime - savedTimestamp < THIRTY_MINUTES) {
      setAuctionData(JSON.parse(savedData));
      setLoading(false);
      return;
    }

    let isMounted = true;

    axios
      .get("https://script.google.com/macros/s/AKfycbwrNQNq0BS08OEqwIWhDhfGFZe76icrnAY9DzCzGVOmN0kFu2vEoTdtzawVfFDJ_JNyiw/exec")
      .then((response) => {
        if (isMounted) {
          const dataWithoutHeader = response.data.slice(1);

          // 캐시템 환율 순위표 (마일리지 구매 아이템 환율 순위표) 필드를 기준으로 오름차순 정렬
          const sortedData = dataWithoutHeader.sort((a, b) => {
            const valueA = parseFloat(a['마일리지 구매 아이템 환율 순위표']);
            const valueB = parseFloat(b['마일리지 구매 아이템 환율 순위표']);

            if (valueA === valueB) {
              const mileageA = parseFloat(a["마일리지 요구량"]);
              const mileageB = parseFloat(b["마일리지 요구량"]);
              return mileageA - mileageB;
            }

            return valueA - valueB;
          });

          // "마일리지 상수" 값이 "N/A"가 아닌 항목만 필터링
          const filteredData = sortedData.filter(
            (item) => item["마일리지 상수"] !== "N/A"
          );

          setAuctionData(filteredData);
          localStorage.setItem('mileageAuctionData', JSON.stringify(filteredData));
          localStorage.setItem('mileageAuctionDataTimestamp', currentTime); // 데이터 저장 시간 기록
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedAuctionData = useMemo(() => {
    // 오름차순 정렬 결과를 useMemo로 캐싱하여 불필요한 정렬 작업 방지
    return auctionData;
  }, [auctionData]);

  if (loading) {
    return <Loading />;
  }

  // 경매장/마일리지 지표를 계산하는 함수
  const determinePurchaseOption = (mileageConstant, mileageRequired, currentPrice) => {
    const totalMileageCost = parseFloat(mileageConstant) * parseFloat(mileageRequired);
    return totalMileageCost > currentPrice ? "경매장" : "마일리지";
  };

  return (
    <div className="grid-container">
      {/* Section 2: 마일리지 정보 출력 */}
      <div className="section section_2">
        <div className="time_info">
          {auctionData.length > 0 ? `Updated at ${(auctionData[1]["업데이트 시간"])}` : "업데이트 시간 정보 없음"}
        </div>
        <div className="header"></div>
        <div className="header">아이템 이름</div>
        <div className="header" style={{color: getPriceColor}}>최근 경매가</div>
        <div className="header">현재 판매가</div>
        <div className="header">어디에서 살까?</div>

        {/* 데이터를 map으로 렌더링 */}
        {sortedAuctionData.map((item, index) => (
          <React.Fragment key={`section_two_` + index}>
            <div
              className="item_image data"
              style={{
                backgroundImage: `url(${
                  item["이미지"]
                    ? item["이미지"]
                    : "https://firebasestorage.googleapis.com/v0/b/erin-c62c7.appspot.com/o/77075.png?alt=media"
                })`,
              }}
            ></div>
            <div className="data item_ranking">
              {item["아이템 이름"]}
              {index < 9 && (
                <span className="badge bg-secondary position-absolute top-0 start-0 m-1">
                  #{index + 1}위
                </span>
              )}
            </div>
            <div className="data" style={{color: getPriceColor(item["최근 경매가"])}}>
              {formatPrice(item["최근 경매가"])}
            </div>
            <div className="data" style={{color: getPriceColor(item["현재 경매장 판매가"])}}>
              {formatPrice(item["현재 경매장 판매가"])}
            </div>
            <div className="data">
              {determinePurchaseOption(
                item["마일리지 상수"],
                item["마일리지 요구량"],
                item["현재 경매장 판매가"]
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      <Logo/>
    </div>
  );
}

export default MileageDataGrid;