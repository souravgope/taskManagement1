import axios from "axios";

const api = axios.create({
  baseURL: "https://taskmanagement1-firebase.onrender.com",
});

export default api;
