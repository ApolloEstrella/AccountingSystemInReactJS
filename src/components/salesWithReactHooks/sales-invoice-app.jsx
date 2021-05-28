import React, { useEffect, useState } from "react";
//import "./App.css";
//import { getUserData } from "./api";
import SalesInvoice from "./sales-invoice";
import configData from "../../config.json";

function SalesInvoiceApp(invoiceParam) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(
      configData.SERVER_URL + "sales/GetAccount?id=" +
        invoiceParam.id.current,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((results) => results.json())
      .then((data) => {
        setData(data);
      })
      .catch(function (error) {
        console.log("network error"); 
      });
  }, []);

  return data ? (
    <SalesInvoice
      preloadedValues={data}
      editMode={true}
      setOpenEdit={invoiceParam.setOpenEdit}
    />
  ) : (
    <div>Loading...</div>
  );
}

export default SalesInvoiceApp;
