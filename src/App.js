import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import axios from 'axios';
import Table from './Table/Table'
import columns from './columns'

function App() {
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries
  
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
      apiKey: "AIzaSyCieqPmBRPRMQeyEYIyhksCcSfvt5_V2z0",
      authDomain: "ruang-keluarga-315704.firebaseapp.com",
      databaseURL: "https://ruang-keluarga-315704-default-rtdb.firebaseio.com",
      projectId: "ruang-keluarga-315704",
      storageBucket: "ruang-keluarga-315704.appspot.com",
      messagingSenderId: "78925276663",
      appId: "1:78925276663:web:01b9545c15db36ac9f7af2",
      measurementId: "G-PJ66DP9Y21"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);

  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const schoolRequest = async (offsetInt = 0) => {
    let resultData = [];
    let school = async (query) => axios({
      method: 'post',
      url: 'https://as01.prod.ruangortu.id:8080/api/cobrand/rekapDataSekolahFilter',
      data: query,
      headers: {
          'Content-Type': 'application/json',
      }
    });
    await school({
      limit: 5000,
      offset: offsetInt
    })
    .then(res => {
      console.log(offsetInt);
      console.log(res.data.Data);
      resultData.push(res.data.Data);
      // if(res.data.Data.length >= 5000) {
      if(offsetInt < 5000) {
        let p = schoolRequest(offsetInt + 5000)
        resultData.push(p);
      }
      else {
        return resultData;
      }
    })
    .catch(err => {
      console.log('Error: ' + err);
      setLoading(false);
      return resultData;
    });
    setLoading(false);
    return resultData;
  }
  
  // useEffect(() => {
  //   let p = schoolRequest();

  //   setData(p);
  // }, [])

  useEffect(() => {
    let school = (query) => axios({
      method: 'post',
      url: 'https://as01.prod.ruangortu.id:8080/api/cobrand/rekapDataSekolahFilter',
      data: query,
      headers: {
          'Content-Type': 'application/json',
      }
    });
    school({
      limit: 20000
    })
    .then(res => {
      setData(res.data.Data);
      setLoading(false);
    })
    .catch(err => {
      console.log('Error: ' + err);
      setLoading(false);
    })
  }, [])

  if(isLoading) return (
    <div className="App">
      <header className="App-header">
        <h2>Rekap Data Sekolah Indonesia</h2>
      </header>
      <div className="App-body">
        <h1>Loading...</h1>
      </div>
    </div>
  )

  return (
    <div className="App">
      <header className="App-header">
        <h2>Rekap Data Sekolah Indonesia</h2>
      </header>
      <div className="App-body">
        <Table
          COLUMNS={columns}
          DATA={data}
        ></Table>
      </div>
    </div>
  );
}

export default App;
