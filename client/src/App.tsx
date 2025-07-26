import { Routes, Route, Navigate } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import Navbar from "./components/Navbar";
import MusicPage from "./pages/MusicPage.tsx";
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate replace to="/musics" />} />
        <Route path="/musics" element={<MusicPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Routes>
    </>
  );
}
