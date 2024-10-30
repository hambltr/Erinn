import './App.css';
import AuctionDataGrid from "./pages/AuctionDataGrid";
import MileageDataGrid from "./pages/MileageDataGrid";
import {useState, useEffect} from 'react';
import {Navbar, Nav, Container, Button} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  // 다크모드 상태를 localStorage에서 가져옴, 기본값은 true
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : true;
  });

  // 선택된 탭 상태를 localStorage에서 가져옴, 기본값은 'auction'
  const [selectedTab, setSelectedTab] = useState(() => {
    const savedSelectedTab = localStorage.getItem('selectedTab');
    return savedSelectedTab ? savedSelectedTab : 'auction';
  });

  // 다크모드 상태 변경 시 클래스 추가/제거 및 localStorage에 저장
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // 선택된 탭 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('selectedTab', selectedTab);
  }, [selectedTab]);

  return (
    <div>
      <Navbar className="nav" variant={darkMode ? "dark" : "light"}>
        {/*bg={darkMode ? "dark" : "light"}*/}
        <Container>
          {/*<Navbar.Brand href="/">마비노기 방울토마토</Navbar.Brand>*/}
          <div>
            <Nav className="me-auto">
              <Nav.Link href="#" onClick={() => setSelectedTab('auction')} active={selectedTab === 'auction'}>
                경매장
              </Nav.Link>
              <Nav.Link href="#" onClick={() => setSelectedTab('mileage')} active={selectedTab === 'mileage'}>
                마일리지
              </Nav.Link>
            </Nav>
          </div>
          {/* 다크모드 토글 버튼 */}
          <div>
            <Button variant={darkMode ? "light" : "dark"} onClick={() => setDarkMode(!darkMode)}>
              <i className={darkMode ? "bi bi-sun" : "bi bi-moon"}></i>
            </Button>
          </div>
        </Container>
      </Navbar>
      <div className="main_title">
        <h1>마비노기 에린 상회</h1>
      </div>
      {/* 선택된 탭에 따라 컴포넌트 렌더링 */}
      <div className="content">
        {selectedTab === 'auction' && <AuctionDataGrid/>}
        {selectedTab === 'mileage' && <MileageDataGrid/>}
      </div>
    </div>
  );
}

export default App;
