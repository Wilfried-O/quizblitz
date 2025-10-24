import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';

export default function App() {
    return (
        <BrowserRouter>
            <main style={{ padding: 16 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/play" element={<Play />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}
