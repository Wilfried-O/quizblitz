import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Play from './pages/Play';
import PlayGate from './pages/gates/PlayGate';
import { QuizProvider } from './context/QuizContext';
import Results from './pages/Results';

export default function App() {
    return (
        <BrowserRouter>
            {/* settings provided to the whole app */}
            <QuizProvider>
                <main style={{ padding: 0 }}>
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
                        <Route path="/results" element={<Results />} />{' '}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </QuizProvider>
        </BrowserRouter>
    );
}
