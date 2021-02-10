import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, CSSReset, ColorModeScript } from "@chakra-ui/react";
import { BrowserRouter as Router } from 'react-router-dom';
import theme from "./theme";
import { Helmet } from "react-helmet";
import DocumentTitle from 'react-document-title';
export const host = window.location.hostname === "localhost" ? "http://localhost:3005" : "https://stratum.hauge.rocks";

ReactDOM.render(
  <React.StrictMode>
    <DocumentTitle title="Stratum Dashboard">
      <ChakraProvider>
        <CSSReset />
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Helmet>
          <link rel="canonical" href="https://statum.hauge.rocks" />
        </Helmet>
        <Router >
          <App />
        </Router>
      </ChakraProvider>
    </DocumentTitle>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
