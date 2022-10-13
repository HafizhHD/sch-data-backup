import logoro from './assets/ruangortu-icon.png';
import logoide from './assets/Logo-IDE.png';
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
  const [summary, setSummary] = useState([]);
  const [pdSum, setPdSum] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isPrevious, setPrevious] = useState(false);
  const [isNext, setNext] = useState(true);
  const [page, setPage] = useState(0);
  const [regex, setRegex] = useState('');
  const [npsn, setNpsn] = useState('');
  const [kec, setKec] = useState('');
  const [kot, setKot] = useState('');
  const [prov, setProv] = useState('');
  const [tb, setTb] = useState('');
  const [stat, setStat] = useState('');
  const [mrd, setMrd] = useState(0);
  const [isSearch, setSearch] = useState(false);
  const [totalRow, setTotalRow] = useState(0);
  const [isFirstCur, setFirstCur] = useState(true);

  const [columnSorted, setColumnSorted] = useState('nama');
  const [sortDir, setSortDir] = useState(1);


  const tingkatName = ['KB', 'TK', 'SD', 'SMP', 'SMA', 'SPK SD', 'SPK SMP', 'SPK SMA', 'SLB', 'SMLB', 'SDLB', 'SMPLB', 'TPA', 'SPS', 'PKBM', 'SKB'];
  

  const search = (r, n, k, o, p, t, a, m, c, d) => {
    setRegex(r);
    setNpsn(n);
    setKec(k);
    setKot(o);
    setProv(p);
    setTb(t);
    setStat(a);
    setMrd(m);
    setPage(0);
    setColumnSorted(c);
    setSortDir(d);
    setSearch(true);
  }

  const pgNum = (p) => {
    setPage(p);
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
    let tingped = tb !== '' ? "^"+tb+"$" : '';
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
          bentuk_pendidikan: {
            '$regex': tingped,
            '$options': 'i',
          },
          status_sekolah: {
            '$regex': stat,
            '$options': 'i',
          },
          pd: {
            '$gte': mrd,
          },
        },
        orderKeyValues: {
          [columnSorted]: sortDir
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
    let tingped = tb !== '' ? "^"+tb+"$" : '';
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
        bentuk_pendidikan: {
          '$regex': tingped,
          '$options': 'i',
        },
        status_sekolah: {
          '$regex': stat,
          '$options': 'i',
        },
        pd: {
          '$gte': mrd,
        },
      },
      orderKeyValues: {
        [columnSorted]: sortDir
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

  const summaryRequest = async () => {
    let school = async (query) => axios({
      method: 'post',
      url: 'https://as01.prod.ruangortu.id:8080/api/cobrand/rekapDataSekolahSummary',
      data: query,
      headers: {
          'Content-Type': 'application/json',
      }
    });
    let tingped = tb !== '' ? "^"+tb+"$" : '';
    await school({
      limit: 1000,
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
        bentuk_pendidikan: {
          '$regex': tingped,
          '$options': 'i',
        },
        status_sekolah: {
          '$regex': stat,
          '$options': 'i',
        },
        pd: {
          '$gte': mrd,
        },
      }
    })
    .then(res => {
      console.log(res.data);
      let swastaSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
      let negeriSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

      for(var i=0; i<res.data.Data.length; i++) {
        let x = res.data.Data[i];
        console.log(x);
        if(x._id.status_sekolah === 'Swasta') swastaSum[tingkatName.indexOf(x._id.bentuk_pendidikan)] = x.Jumlah_siswa;
        else if(x._id.status_sekolah === 'Negeri') negeriSum[tingkatName.indexOf(x._id.bentuk_pendidikan)] = x.Jumlah_siswa;
      }
      console.log('NegeriSum',negeriSum);
      console.log('SwastaSum',swastaSum);
      setPdSum([negeriSum, swastaSum]);
      setSummary(res.data.summary);
    })
    .catch(err => {
      console.log('Error: ' + err);
    });
  }

  useEffect(() => {
    if(isFirstCur || isSearch) {
      setLoading(true);
      setFirstCur(false);
      const p = async() => {
        const u = await schoolRequestManual();
        console.log(u);
        setData(u);
        if(page > 0) setPrevious(true);
        else setPrevious(false);
        if(u.length < 100) setNext(false);
        else setNext(true);
        await summaryRequest();
      }

      p().then(() => {
        setSearch(false);
        setLoading(false);
      });
    }
  }, [page, isSearch]);

  const [ profile, setProfile ] = useState();
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

  // const SummaryElement = () => {
  //   let tingkatName = ['KB', 'TK', 'SD', 'SMP', 'SMA', 'SPK SD', 'SPK SMP', 'SPK SMA', 'SLB', 'SMLB', 'SDLB', 'SMPLB', 'TPA', 'SPS', 'PKBM', 'SKB'];
  //   let swastaSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  //   let negeriSum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  //   let summer = summary;
  //   console.log('pdSum', pdSum);
  //   for(var i=0; i<pdSum.length; i++) {
  //     let x = pdSum[i];
  //     if(x._id.status_sekolah === 'Swasta') swastaSum[tingkatName.indexOf(pdSum[i].bentuk_pendidikan)] = x.Jumlah_siswa;
  //     else if(x._id.status_sekolah === 'Negeri') negeriSum[tingkatName.indexOf(pdSum[i].bentuk_pendidikan)] = x.Jumlah_siswa;
  //   }
  //   return (
  //     <div className="Summary">
  //       <p>Jumlah Peserta Didik Negeri: <span>{negeriSum.reduce((partialSum, a) => partialSum + a, 0).toString()}</span></p>
  //       <p>Jumlah Peserta Didik Swasta: <span>{swastaSum.reduce((partialSum, a) => partialSum + a, 0).toString()}</span></p>
  //       <p>Jumlah Sekolah: <span>{summer.jumlahSekolah}</span></p>
  //       <p>Jumlah Provinsi: <span>{summer.jumlahPropinsi}</span></p>
  //       <p>Jumlah Kota/Kabupaten: <span>{summer.jumlahKabupaten}</span></p>
  //       <p>Jumlah Kecamatan: <span>{summer.jumlahKecamatan}</span></p>
  //     </div>
  //   )
  // }

  if(isLoading) return (
    <div className="App">
      <header className="App-header">
        <img src={logoide} alt="Logo IDE DEF GHI"/>
        <img src={logoro} alt="Logo Ruang Ortu"/>
        <h2>Data Sekolah Seluruh Indonesia</h2>
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
        <img src={logoide} alt="Logo IDE DEF GHI"/>
        <img src={logoro} alt="Logo Ruang Ortu"/>
        <h2>Data Sekolah Seluruh Indonesia</h2>
        {profile ? <GoogleLogout clientId={clientId} buttonText="Log out" onLogoutSuccess={logOut} /> : <div></div>}
      </header>
      <div className="App-body">
      {profile ?
        <>
        <div className="Summary">
          <div className="Summary-all">
            <p>Jumlah Peserta Didik Negeri: <span>{pdSum[0].reduce((partialSum, a) => partialSum + a, 0).toString()}</span></p>
            <p>Jumlah Peserta Didik Swasta: <span>{pdSum[1].reduce((partialSum, a) => partialSum + a, 0).toString()}</span></p>
            <p>Jumlah Sekolah: <span>{summary.jumlahSekolah}</span></p>
            <p>Jumlah Provinsi: <span>{summary.jumlahPropinsi}</span></p>
            <p>Jumlah Kota/Kabupaten: <span>{summary.jumlahKabupaten}</span></p>
            <p>Jumlah Kecamatan: <span>{summary.jumlahKecamatan}</span></p>
          </div>
          <div className="Summary-all">
            {/* <h4>NEGERI:</h4>
            {tingkatName.map((x, index) => {
              return <p>{x}: {pdSum[0][index]}</p>;
            })} */}
            <table>
              <tr>
                <th></th>
                {tingkatName.map(x => {
                  return <th>{x}</th>
                })}
              </tr>
              <tr>
                <th>NEGERI</th>
                {tingkatName.map((x, index) => {
                return(<td>{pdSum[0][index]}</td>)
              })}
              </tr>
              <tr>
                <th>SWASTA</th>
                {tingkatName.map((x, index) => {
                return(<td>{pdSum[1][index]}</td>)
              })}
              </tr>
            </table>
          </div>
          {/* <div className="Summary-all">
            <h4>SWASTA:</h4>
            {tingkatName.map((x, index) => {
              return <p>{x}: {pdSum[1][index]}</p>;
            })}
          </div> */}
        </div>
        <Table
          COLUMNS={columns(page*100)}
          DATA={data}
          pageNum={page}
          setPageNum={pgNum}
          isPrevious={isPrevious}
          isNext={isNext}
          schoolRequest={schoolRequest}
          search={search}
          keyword={[regex, npsn, kec, kot, prov, tb, stat, mrd, columnSorted, sortDir]}
          email={profile.email}
          totalRow={totalRow}
        ></Table>
        </>
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
