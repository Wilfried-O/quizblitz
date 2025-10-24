import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';
import PlayGate from './pages/gates/PlayGate';

export default function App() {
    return (
        <BrowserRouter>
            <main style={{ padding: 16 }}>
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
                </Routes>
            </main>
        </BrowserRouter>
    );
}
