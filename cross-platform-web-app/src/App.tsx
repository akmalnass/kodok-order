import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import CustomerPage from './pages/CustomerPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Shared/Header';
import Footer from './components/Shared/Footer';
import './styles/Shared.css';

const App: React.FC = () => {
    return (
        <Router>
            <Header />
            <Switch>
                <Route path="/admin" component={AdminPage} />
                <Route path="/customer" component={CustomerPage} />
                <Route component={NotFoundPage} />
            </Switch>
            <Footer />
        </Router>
    );
};

export default App;