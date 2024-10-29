import React, { useState, useEffect } from 'react';
import Spinner from 'react-bootstrap/Spinner';

function GrowExample() {
  const [dots, setDots] = useState(''); // 점 상태 관리

  useEffect(() => {
    // 0.5초마다 점을 추가하거나 초기화하는 타이머 설정
    const interval = setInterval(() => {
      setDots(prevDots => (prevDots.length < 2 ? prevDots + '.' : ''));
    }, 500);

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading">
      <Spinner animation="grow" />
      <p>Loading.{dots}</p>
    </div>
  );
}

export default GrowExample;
