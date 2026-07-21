import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Presenca from "./pages/Presenca";
import Fotos from "./pages/Fotos";
import Admin from "./pages/Admin";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-ink">
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route
        path="/presenca"
        element={
          <Layout>
            <Presenca />
          </Layout>
        }
      />
      <Route
        path="/fotos"
        element={
          <Layout>
            <Fotos />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <Admin />
          </Layout>
        }
      />
    </Routes>
  );
}
