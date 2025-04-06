import { Routes, Route} from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import ChatSupport from "./components/chat/chat-support";
import Home from "./components/scenes/home";
import UploadPage from "./components/scenes/predict/upload-content";
import Predict from "./components/scenes/predict";
import ResultsHistoryPage from "./components/scenes/history/results-history";
import History from "./components/scenes/history";
import Timeline from "./components/scenes/timeline";



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
        <Route path="/history" element={<History />}>
            <Route index element={<ResultsHistoryPage />} />
        </Route>
        <Route path="/goals" element={<Predict />}>
            <Route index element={<ResultsHistoryPage />} />
        </Route>
        <Route path="/timeline" element={<Timeline />}>
            <Route index element={<ResultsHistoryPage />} />
        </Route>
    </Routes>
        <ChatSupport />
      <Footer />
    </>
  );
}

export default AppRoutes;
