import React from "react";
import { parse } from "json2csv";
import "./App.css";

function App() {
  const [token, setToken] = React.useState("");
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchData = async index => {
    return fetch(
      `https://api.emmbot.trade/members/orders?limit=20&page=${index}&type=member`,
      {
        method: "get",
        headers: new Headers({
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded"
        })
      }
    )
      .then(x => x.json())
      .then(json => {
        // console.log(`json=${index + 1}=`, json.data.orders);
        return json.data.orders;
      });
  };

  function awaitAll(count, asyncFn) {
    const promises = [];

    for (let i = 0; i < count; ++i) {
      promises.push(asyncFn(i + 1));
    }

    Promise.all(promises).then(values => {
      let listData = [];
      values.forEach(element => {
        listData = listData.concat(element);
      });

      listData = listData.map(item => {
        return {
          bet_account_type: item.bet_account_type,
          bet_amount: item.bet_amount,
          created_at: item.created_at,
          master_username: item.master_username,
          bet_type: item.bet_type.replace(/<[^>]+>/g, ""),
          change: item.change,
          status: item.status,
          result: item.change > 0 ? "Thắng" : "Thua"
        };
      });

      let graphCSV = parse(listData, {
        fields: [
          { label: "Thời gian", value: "created_at" },
          { label: "Nguồn copy", value: "master_username" },
          { label: "Số tiền", value: "bet_amount" },
          { label: "Loại ví", value: "bet_account_type" },
          { label: "Lệnh vào", value: "bet_type" },
          { label: "Kết quả", value: "result" },
          { label: "Lợi nhuận", value: "change" },
          { label: "Trạng thái", value: "status" }
        ]
      });

      const a = document.createElement("a");
      a.style = "display: none";
      // Data URI
      const bom = decodeURIComponent("%EF%BB%BF"); // "\uFEFF\n";
      graphCSV = bom + graphCSV;
      const csvA = new Uint16Array(
        graphCSV.split("").map(function(k, v) {
          return k.charCodeAt(0);
        })
      );
      const blob = new Blob([csvA], { type: "text/csv;charset=UTF-16LE;" });
      const blobUrl = URL.createObjectURL(blob);
      a.href = blobUrl;
      a.download = "emmbot.csv";
      document.body.appendChild(a);
      a.click();

      setLoading(false);
    });
  }

  React.useEffect(() => {
    if (total > 0) {
      awaitAll(total, fetchData);
    }
  // eslint-disable-next-line
  }, [total]);

  const downloadData = () => {
    setLoading(true);
    fetch(
      "https://api.emmbot.trade/members/orders?limit=20&page=1&type=member",
      {
        method: "get",
        headers: new Headers({
          Authorization: token,
          "Content-Type": "application/x-www-form-urlencoded"
        })
      }
    )
      .then(x => x.json())
      .then(json => {
        if (json.data.total) {
          setTotal(json.data.total_page);
        }
      });
  };

  return (
    <>
      <div className="App">
        <header className="App-header">
          <h2>Nhập token</h2>
          <input
            type="text"
            onChange={e => setToken(e.target.value)}
            value={token}
            placeholder="Nhập token ở đây"
          ></input>
          <button type="button" onClick={downloadData}>
            Tải file excel
          </button>
          {loading && <div>Loading...</div>}
        </header>
      </div>
    </>
  );
}

export default App;
