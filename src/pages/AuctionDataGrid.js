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

function AuctionDataGrid() {
  const [auctionData, setAuctionData] = useState(() => {
    // 초기 로드 시 로컬 스토리지에서 데이터를 가져옴
    const savedData = localStorage.getItem('auctionData');
    return savedData ? JSON.parse(savedData) : [];
  });
  const [loading, setLoading] = useState(auctionData.length === 0);

  useEffect(() => {
    const savedData = localStorage.getItem('auctionData');
    const savedTimestamp = localStorage.getItem('auctionDataTimestamp');
    const currentTime = new Date().getTime();
    const TEN_MINUTES = 10 * 60 * 1000; // 10분을 밀리초로 변환 (데이터 유효성 검사)


    if (savedData && savedTimestamp && currentTime - savedTimestamp < TEN_MINUTES) {
      setAuctionData(JSON.parse(savedData));
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Google Apps Script에서 데이터를 가져오는 API 호출
    axios
      .get(
        "https://script.google.com/macros/s/AKfycbwrNQNq0BS08OEqwIWhDhfGFZe76icrnAY9DzCzGVOmN0kFu2vEoTdtzawVfFDJ_JNyiw/exec"
      )
      .then((response) => {
        if (isMounted) {
          const dataWithoutHeader = response.data.slice(1);

          // 특정 항목들을 제외하기 위해 필터링
          const filteredOutItems = [
            "스페셜 쥬얼 모나크 웨어(여성용)",
            "쥬얼 모나크 가발(여성용)",
          ];
          const filteredDataWithoutItems = dataWithoutHeader.filter(
            (item) => !filteredOutItems.includes(item["아이템 이름"])
          );

          // 캐시템 환율 순위표 (마일리지x) 필드를 기준으로 오름차순 정렬
          const sortedData = filteredDataWithoutItems.sort((a, b) => {
            if (a["종합 순위"] === "N/A") return 1; // N/A는 마지막으로 이동
            if (b["종합 순위"] === "N/A") return -1; // N/A는 마지막으로 이동
            return a["종합 순위"] - b["종합 순위"];
          });

          // "마일리지 상수" 값이 "N/A"인 항목만 필터링
          const filteredData = sortedData.filter(
            (item) => item["마일리지 상수"] === "N/A"
          );

          setAuctionData(filteredData);
          localStorage.setItem('auctionData', JSON.stringify(filteredData)); // 로컬 스토리지에 데이터 저장
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
        setLoading(false);
      });

    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 isMounted를 false로 설정
    };
  }, [auctionData.length]);

  const sortedAuctionData = useMemo(() => {
    // 오름차순 정렬 결과를 useMemo로 캐싱하여 불필요한 정렬 작업 방지
    return auctionData;
  }, [auctionData]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="grid-container">
      <div className="section section_1">
        <div className="time_info">
          {auctionData.length > 0 ? `Updated at ${(auctionData[1]["업데이트 시간"])}` : "업데이트 시간 정보 없음"}
        </div>
        <div className="header"></div>
        <div className="header">아이템 이름</div>
        <div className="header">전날 대비</div>
        <div className="header" style={{color: getPriceColor}}>최근 경매가</div>
        <div className="header">현재 판매가</div>
        <div className="header">어디에서 살까?</div>

        {/* 데이터를 map으로 렌더링 */}
        {sortedAuctionData.map((item, index) => (
          <React.Fragment key={`section_one_` + index}>
            <div
              className="item_image data"
              style={{
                backgroundImage: `url(${
                  item["이미지"]
                    ? item["이미지"]
                    : "https://firebasestorage.googleapis.com/v0/b/erin-c62c7.appspot.com/o/77075.png?alt=media"
                })`
              }}
            ></div>
            <div className="data item_ranking">
              {item["아이템 이름"]}
              {/*상시 순위 표기*/}
              {index < 9 && (
                <span className="badge bg-danger position-absolute top-0 start-0 m-1">
                  #{index + 1}위
                </span>
              )}
              {/*주간 제한 순위 표기*/}
              {item["주간 구매제한 캐시템 환율 순위표 (마일리지x)"] >= 1 &&
                item["주간 구매제한 캐시템 환율 순위표 (마일리지x)"] <= 3 && (
                  <span className="badge bg-success position-absolute bottom-0 start-0 m-1">
                    #주간 {item["주간 구매제한 캐시템 환율 순위표 (마일리지x)"]}위
                  </span>
                )}
            </div>
            <div
              className="data"
              style={{
                color:
                  item["등락률"] > 0
                    ? "#C75060"
                    : item["등락률"] < 0
                      ? "#43abcb"
                      : "rgb(204, 204, 204)",
              }}
            >
              {item["등락률"] > 0 ? "▲" : item["등락률"] < 0 ? "▼" : ""} {" "}
              {Math.abs(item["등락률"] * 100).toFixed(2)}%
            </div>
            <div className="data" style={{color: getPriceColor(item["최근 경매가"])}}>
              {formatPrice(item["최근 경매가"])}
            </div>
            <div className="data" style={{color: getPriceColor(item["현재 경매장 판매가"])}}>
              {formatPrice(item["현재 경매장 판매가"])}
            </div>
            <div className="data">
              {item["경매장/캐시샵 구매 추천"] === "GOLD"
                ? "경매장"
                : item["경매장/캐시샵 구매 추천"] === "CASH"
                  ? "캐시샵"
                  : ""}
            </div>
          </React.Fragment>
        ))}
      </div>
      <Logo/>
    </div>
  );
}

export default AuctionDataGrid;