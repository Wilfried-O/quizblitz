// CHANGED: add AppHeader + shared container; remove inline style on <main>
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Play from './pages/Play';
import PlayGate from './pages/gates/PlayGate';
import { QuizProvider } from './context/QuizContext';
import Results from './pages/Results';
import AppHeader from './AppHeader'; // NEW

export default function App() {
    return (
        <BrowserRouter>
            {/* settings provided to the whole app */}
            <QuizProvider>
                {/* CHANGED: Shared app shell (header + main) */}
                <div className="app-container">
                    <AppHeader />

                    {/* CHANGED: page slot */}
                    <main className="qz-main">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route
                                path="/play"
                                element={
                                    <PlayGate>
                                        <Play />
                                    </PlayGate>
                                }
                            />
                            <Route path="/results" element={<Results />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                </div>
            </QuizProvider>
        </BrowserRouter>
    );
}
