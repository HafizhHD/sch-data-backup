import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import axios from 'axios';
import Table from './Table/Table'
import columns from './columns'

import { GoogleLogin, GoogleLogout } from '@leecheuk/react-google-login';
import { gapi } from 'gapi-script';

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
  const [isPrevious, setPrevious] = useState(false);
  const [isNext, setNext] = useState(true);
  const [page, setPage] = useState(0);
  const [regex, setRegex] = useState('');
  const [npsn, setNpsn] = useState('');
  const [kec, setKec] = useState('');
  const [kot, setKot] = useState('');
  const [prov, setProv] = useState('');
  const [isSearch, setSearch] = useState(false);
  const [totalRow, setTotalRow] = useState(0);

  const search = (r, n, k, o, p) => {
    setRegex(r);
    setNpsn(n);
    setKec(k);
    setKot(o);
    setProv(p);
    setPage(0);
    setSearch(true);
  }

  const schoolRequest = async () => {
    let resultData = [];
    let school = async (query) => axios({
      method: 'post',
      url: 'https://as01.prod.ruangortu.id:8080/api/cobrand/rekapDataSekolahFilter',
      data: query,
      headers: {
          'Content-Type': 'application/json',
      }
    });
    let offsetInt = 0;
    let isThereMore = true;
    while(isThereMore) {
      await school({
        limit: 5000,
        offset: offsetInt,
        whereKeyValues: {
          nama: {
            '$regex': regex,
            '$options': 'i',
          },
          npsn: {
            '$regex': npsn,
            '$options': 'i',
          },
          induk_kecamatan: {
            '$regex': kec,
            '$options': 'i',
          },
          induk_kabupaten: {
            '$regex': kot,
            '$options': 'i',
          },
          induk_provinsi: {
            '$regex': prov,
            '$options': 'i',
          },
        }
      })
      .then(res => {
        console.log(offsetInt);
        console.log(res.data);
        resultData.push(...res.data.Data);
  
        if(res.data.Data.length >= 5000) {
        // if(offsetInt < 20000) {
          offsetInt += 5000;
        }
        else {
          isThereMore = false;
        }
      })
      .catch(err => {
        console.log('Error: ' + err);
        isThereMore = false;
      });
    }
    return resultData;
  }
  
  // useEffect(() => {
  //   const p = async() => {
  //     const u = await schoolRequest();
  //     console.log(u);
  //     setData(u);
  //   }

  //   p().then(() => {
  //     setLoading(false);
  //   });
  // }, [])

  const schoolRequestManual = async () => {
    let resultData = [];
    let school = async (query) => axios({
      method: 'post',
      url: 'https://as01.prod.ruangortu.id:8080/api/cobrand/rekapDataSekolahFilter',
      data: query,
      headers: {
          'Content-Type': 'application/json',
      }
    });
    let offsetInt = page*100;
    await school({
      limit: 100,
      offset: offsetInt,
      whereKeyValues: {
        nama: {
          '$regex': regex,
          '$options': 'i',
        },
        npsn: {
          '$regex': npsn,
          '$options': 'i',
        },
        induk_kecamatan: {
          '$regex': kec,
          '$options': 'i',
        },
        induk_kabupaten: {
          '$regex': kot,
          '$options': 'i',
        },
        induk_provinsi: {
          '$regex': prov,
          '$options': 'i',
        },
      }
    })
    .then(res => {
      console.log(offsetInt);
      console.log(res.data);
      resultData.push(...res.data.Data);
      setTotalRow(res.data.totalRow);
      // if(res.data.Data >= 100) {
      //   setNext(true);
      // }
      // else setNext(false);
      // if(page <= 0) setPrevious(false);
      // else setPrevious(true);
      // return resultData;

      // if(res.data.Data.length >= 5000) {
      //   offsetInt += 5000;
      // }
      // else {
      //   isThereMore = false;
      // }
    })
    .catch(err => {
      console.log('Error: ' + err);
      return resultData;
    });
    return resultData;
  }

  useEffect(() => {
    setLoading(true);
    const p = async() => {
      const u = await schoolRequestManual();
      console.log(u);
      setData(u);
      if(page > 0) setPrevious(true);
      else setPrevious(false);
      if(u.length < 100) setNext(false);
      else setNext(true);
    }

    p().then(() => {
      setSearch(false);
      setLoading(false);
    });
  }, [page, isSearch]);

  const [ profile, setProfile ] = useState([]);
  const clientId = '78925276663-l0mdaojf9ui0f87716baaatvjopeofqr.apps.googleusercontent.com';
  useEffect(() => {
      const initClient = () => {
          gapi.client.init({
              clientId: clientId,
              scope: ''
          });
      };
      gapi.load('client:auth2', initClient);
  });

  const onSuccess = (res) => {
      setProfile(res.profileObj);
  };

  const onFailure = (err) => {
      console.log('failed', err);
  };

  const logOut = () => {
      setProfile(null);
  };

  // useEffect(() => {
  //   let school = (query) => axios({
  //     method: 'post',
  //     url: 'https://as01.prod.ruangortu.id:8080/api/cobrand/rekapDataSekolahFilter',
  //     data: query,
  //     headers: {
  //         'Content-Type': 'application/json',
  //     }
  //   });
  //   school({
  //     limit: 20000
  //   })
  //   .then(res => {
  //     setData(res.data.Data);
  //     setLoading(false);
  //   })
  //   .catch(err => {
  //     console.log('Error: ' + err);
  //     setLoading(false);
  //   })
  // }, [])

  if(isLoading) return (
    <div className="App">
      <header className="App-header">
        <h2>Rekap Data Sekolah Indonesia</h2>
        {profile ? <GoogleLogout clientId={clientId} buttonText="Log out" onLogoutSuccess={logOut} /> : <div></div>}
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
        {profile ? <GoogleLogout clientId={clientId} buttonText="Log out" onLogoutSuccess={logOut} /> : <div></div>}
      </header>
      <div className="App-body">
      {profile ?
        <Table
          COLUMNS={columns(page*100)}
          DATA={data}
          pageNum={page}
          setPageNum={setPage}
          isPrevious={isPrevious}
          isNext={isNext}
          schoolRequest={schoolRequest}
          search={search}
          keyword={[regex, npsn, kec, kot, prov]}
          email={profile.email}
          totalRow={totalRow}
        ></Table>
      : <GoogleLogin
        clientId={clientId}
        buttonText="Sign in with Google"
        onSuccess={onSuccess}
        onFailure={onFailure}
        cookiePolicy={'single_host_origin'}
        isSignedIn={true}
    />}
    </div>
    </div>
  );
}

export default App;
