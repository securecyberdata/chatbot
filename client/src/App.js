import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard/Dashboard';
import Chat from './components/Chat/Chat';
import Settings from './components/Settings/Settings';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
