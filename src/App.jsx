import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Play from './pages/Play';

export default function App() {
    return (
        <BrowserRouter>
            <header style={{ padding: 12 }}>
                <Link to="/">Home</Link> | <Link to="/play">Play</Link>
            </header>

            <main style={{ padding: 16 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/play" element={<Play />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}
