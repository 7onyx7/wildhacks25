import { Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ChatSupport from "./components/chat/chat-support";
import Home from "./components/scenes/home";
import UploadPage from "./components/scenes/predict/upload-content";
import Predict from "./components/scenes/predict";
import ResultsHistoryPage from "./components/scenes/history/results-history";



function AppRoutes() {

  return (
    <>
    <Navbar />
    <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/" element={<ChatSupport />} />
        <Route path="/predict" element={<Predict />}>
            <Route index element={<UploadPage />} />
        </Route>
        <Route path="/history" element={<Predict />}>
            <Route index element={<ResultsHistoryPage />} />
        </Route>
    </Routes>
        <ChatSupport />
      <Footer />
    </>
  );
}

export default AppRoutes;
