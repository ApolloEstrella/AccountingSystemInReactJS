import React, { useEffect, useState } from "react";
import Purchase from "../purchases/purchase";
import configData from "../../config.json";

function PurchaseApp(props: any) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(
      configData.SERVER_URL + "purchase/GetById?id=" + props.id,
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
  }, [props.id]);

  return data ? (
    <Purchase
      rowData={data}
      closeDialog={props.closeDialog}
      // setOpenEdit={invoiceParam.setOpenEdit}
    />
  ) : (
    <div>Loading...</div>
  );
}

export default PurchaseApp;
