// http.ts
import axios from "axios";

const port = process.env.REACT_APP_APIPORT || 3001;
const url = process.env.REACT_APP_APIURL || `http://localhost:${port}`;

const http = axios.create({
  baseURL: url,
  headers: {
    "Content-type": "application/json",
  },
});

export default http;
