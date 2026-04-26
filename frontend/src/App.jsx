import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import ListLevel from './pages/ListLevel';
import ReviewAttempt from './pages/ReviewAttempt';
import DetailAttempt from './pages/DetailAttempt';
import AddSoalPG from './pages/add/AddSoalPG';
import DetailSoalPG from './pages/DetailSoalPG';
import DetailSoalEsai from './pages/DetailSoalEsai';
import AddSoalEsai from './pages/add/AddSoalEsai';
import EditSoalEsai from './pages/edit/EditSoalEsai';
import EditSoalPG from './pages/edit/EditSoalPG';
import ListSoal from './pages/ListSoal';

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* 2. HomePage*/}
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/home" element={<Homepage />} />

        {/* 3. Level */}
        <Route path="/:slugSection/levels" element={<ListLevel />} />
        {/* <Route path="/levels/:id" element={<DetailLevel/>}/> */}

        {/* 4. Soal PG */}
        <Route path="/soal-pg/detail/:id" element={<DetailSoalPG />} />
        <Route path="/soal-pg/edit/:id" element={<EditSoalPG />} />
        <Route path="/add-soal-pg" element={<AddSoalPG />} />

        {/* 5. Soal Essai */}
        <Route path="/soal-esai/detail/:id" element={<DetailSoalEsai />} />
        <Route path="/soal-esai/add" element={<AddSoalEsai />} />
        <Route path="/soal-esai/edit/:id" element={<EditSoalEsai />} />

        {/* 6. Review Attempt */}
        <Route path="/review-attempt" element={<ReviewAttempt />} />
        <Route path="/detail-attempt/:id" element={<DetailAttempt />} />

        {/* 7. Review Attempt */}
        <Route path="/list-soal/:id_level" element={<ListSoal />} />
      </Routes>
    </Router>
  );
}

export default App;