import React, { useEffect, useState, useRef } from "react";
import {
  createStyles,
  lighten,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import configData from "../../config.json";
import {
  Grid,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  withStyles,
  Hidden,
} from "@material-ui/core";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  useFormContext,
} from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import { ptBR } from "date-fns/locale";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import moment from "moment";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Formik, Form, ErrorMessage, useFormikContext, useField } from "formik";
import NumberFormat from "react-number-format";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
//import Radio from "@material-ui/core/Radio";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    p: {
      marginTop: "0px",
      color: "#bf1650",
      marginBottom: "0px",
    },
    textField: {
      "& > *": {
        width: "100%",
        height: "38px",
        paddingTop: "0px",
        zIndex: "0",
        marginTop: "10px",
        paddingBottom: "5px",
        fontSize: "13px",
      },
    },
    textField2: {
      width: "100%",
      zIndex: 0,
      fontSize: "13px",
    },
    textField3: {
      "& > *": {
        width: "100%",
        paddingTop: "0px",
        zIndex: "0",
        marginTop: "8px",
        paddingBottom: "5px",
        fontSize: "13px",
      },
    },
    textFieldReadOnly: {
      "& > *": {
        width: "100%",
        zIndex: "-999",
        fontSize: "13px",
        height: "40px",
      },
    },
    reactSelect: {
      paddingTop: "10px",
      fontSize: "13px",
      width: "100%",
      //zIndex: "5",
    },
    multiLine: {
      "& > *": {
        width: "100%",
        paddingTop: "0px",
        zIndex: "0",
        marginTop: "0px",
        paddingBottom: "5px",
        fontSize: "13px",
      },
    },
    smallFontSize: {
      fontSize: "13px",
    },
    totalAmount: {
      marginTop: "0px",
      paddingTop: "0px",
      textAlign: "left",
    },
  })
);

const validationSchema = Yup.object().shape({
  vendor: Yup.object().nullable().required("Vendor required"),
  referenceNo: Yup.string().required("Reference No required"),
  //description: Yup.string().required("Description required"),
  //incomeAccount: Yup.object().nullable().required("Income Account required"),
  id: Yup.number(),
  modeOfPayment: Yup.string(),
  chartOfAccounts: Yup.object().when("modeOfPayment", {
    is: (modeOfPayment) => modeOfPayment === "PD",
    then: Yup.object().nullable().required("Enter cash or bank account"),
  }),

  items: Yup.array().of(
    Yup.object().shape({
      id: Yup.number(),
      //chartOfAccountItem: Yup.object()
      //  .nullable()
      //  .required("Sales Item is required"),
      //description: Yup.string().nullable().required("Description is required"),
      taxRateItem: Yup.object().nullable().required("Tax Rate is required"),
      //trackingItem: Yup.object().nullable().required("Tracking is required"),
      quantity: Yup.number()
        .nullable()
        .typeError("Quantity is required")
        .required("Quantity is required"),
      unitPrice: Yup.number()
        .nullable()
        .typeError("Unit Price is required")
        .required("Unit Price is required"),
      inventoryItem: Yup.object(),
      chartOfAccountItem: Yup.object().when("inventoryItem", {
        is: null || undefined,
        then: Yup.object().required("Expense required"),
      }),
    })
  ),
});

const validationSchemaTax = Yup.object().shape({
  description: Yup.string().required("Enter Description."),
});

let renderCount = 0;

interface Props {
  closeDialog: any;
  //updateList: any;
  rowData: any;
}

export default function Purchase(props: Props) {
  const [counterRender, setCounterRender] = useState(0);
  const [counterRender2, setCounterRender2] = useState(0);
  const [editMode, setEditMode] = useState(props.rowData != null ? true : false);



  useEffect(() => { setCounterRender2(counterRender2 + 1); console.log(counterRender)}, [counterRender]);
  const [purchase, getPurchase] = useState();

  useEffect(() => {
    if (props.rowData == null) return;
    fetch(configData.SERVER_URL + "purchase/getbyid?id=" + props.rowData.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        getPurchase(data);
        setPaymentMethod(data?.["modeOfPayment"])
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, []);

  const classes = useStyles();
  const {
    register,
    control,
    handleSubmit,
    errors,
    reset,
    watch,
    setValue,
    getValues,
    formState,
  } = useForm({
    //mode: "onChange",
    defaultValues: props.rowData === null ? {} : props.rowData,
    resolver: yupResolver(validationSchema),
  });

  const { isValid, isSubmitting, touched, submitCount } = formState;

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "items",
      keyName: "keyNameId",
    }
  );
  const [counterVendor, setCounterVendor] = useState(0);
  const [counterInventory, setCounterInventory] = useState(0);
  const [counterChartOfAccount, setCounterChartOfAccount] = useState(0);
  const [itemCount, setItemCount] = useState(-2);
  const [counterTax, setCounterTax] = useState(0);
  const [taxRates, getTaxRates] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [totalTaxes, setTotalTaxes] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [addMode, setAddMode] = useState(true);
  const purchaseId = useRef(-1);
  const initialValues = {
    id: 0,
    name: "",
    productServiceCode: "",
    description: "",
    incomeAccount: { value: null, label: null },
    expenseAccount: { value: null, label: null },
  };

  const onSubmit = (values: any, e: any) => {
    values.date = moment.parseZone(values.date.toString()).toDate();
    values.dueDate = moment.parseZone(values.dueDate.toString()).toDate();
    values.amount = totalAmount;
    values.totalTaxes = totalTaxes;

    var url: string;
    var method: string;

    if (props.rowData === null && addMode) {
      url = "purchase/add";
      method = "POST";
      setAddMode(false);
    } else {
      url =
        "purchase/update?Id=" +
        (purchaseId.current === -1 ? props.rowData.id : purchaseId.current);
      method = "PUT";
      values.id =
        purchaseId.current === -1 ? props.rowData.id : purchaseId.current;
    }

    fetch(configData.SERVER_URL + url, {
      method: method,
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        purchaseId.current = Number(data);
        //setAddMode(false)
        //reset(initialValues);
        //props.updateList();
        //props.closeDialog();
      })
      .catch(function (error) {
        console.log("network error");
      });
  };

  interface ICost {
    id: number;
    quantity: string;
    unitPrice: string;
    inventoryItem: any;
    taxRateItem: any;
  }

  const [vendors, getVendors] = useState([]);
  const [inventories, getInventories] = useState([]);
  const [chartOfAccounts, getChartOfAccounts] = useState([]);
  const [openTax, toggleOpenTax] = useState(false);
  const [costs, setCosts] = useState<ICost[]>([]);
  const handleSelectChange = (e: any, field: string) => {
    setValue(field, e, { shouldValidate: true });
  };

  useEffect(() => {
    if (props.rowData === null) return;
    setCosts(props.rowData.items);

    var subTotal: number = 0;
    var totalTaxes: number = 0;
    // eslint-disable-next-line array-callback-return
    props.rowData.items.map((item: any, index: number) => {
      if (!isNaN(Number(item.quantity)) && !isNaN(Number(item.unitPrice))) {
        const quantity: number = Number(item.quantity);
        const unitPrice: number = Number(item.unitPrice);
        var rate: number = 0;
        if (item.taxRateItem === null) rate = 0;
        else rate = Number(item.taxRateItem.rate);
        if (isNaN(rate)) rate = 0;
        subTotal = subTotal + quantity * unitPrice;
        totalTaxes = totalTaxes + quantity * unitPrice * (rate / 100); // 100;
        setValue(
          `items[${index}].amount`,
          Number(subTotal).toLocaleString("en", { minimumFractionDigits: 2 })
        );
      }
    });

    //setFieldCounter(fieldCounter + 1);
  }, []);

  const [dialogValueTax, setDialogValueTax] = useState({
    description: "",
    rate: 0,
    tax_type: "P",
  });

  const handleChange = (e: any, field: string) => {
    setValue(field, e, { shouldValidate: true });
    //handleCostsChange();
  };

  const initialTaxValues = {
    description: dialogValueTax.description,
    rate: 0,
    tax_type: "S",
  };

  const [selectDisable, setSelectDisable] = useState([]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "SubsidiaryLedger/Get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        getVendors(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterVendor]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "TaxRate/get?type=P", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        //console.log(data);
        getTaxRates(data);
        //tax.current = data;
        //setBusy2(false);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterTax]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "Inventory/GetSelectPerType?type='P'", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        getInventories(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterInventory]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "ChartOfAccount/GetSelect", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        getChartOfAccounts(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterChartOfAccount]);

  const handleCloseTax = () => {
    toggleOpenTax(false);
  };

  function handleNewTax(values: any) {
    fetch(configData.SERVER_URL + "TaxRate/addaccount", {
      method: "POST",
      body: JSON.stringify({
        description: values.description,
        rate: values.rate,
        taxType: "P",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        setCounterTax(counterTax + 1);
        handleCloseTax();
      });
  }

  const handleQtyUnitPrice = (e: any, index: number, fieldName: string) => {
    var rate: number = 0;
    if (e.target === undefined) {
      rate = e.rate / 100;
      setValue(fieldName, e);
    } else {
      const validNumber = new RegExp(/^\d*\.?\d*$/);
      const valid: boolean = validNumber.test(e.target.value);

      if (valid === false) {
        setValue(fieldName, "");
        return;
      } else {
        setValue(fieldName, e.target.value, { shouldValidate: true });
      }
    }

    /* setValue(
      fieldName,
      e.target.value === "" || isNaN(e.target.value) 
        ? ""
        : e.target.value,
      { shouldValidate: true } 
    ); */

    //const value: number = Number(e.target.value);
    //setValue(fieldName, value, { shouldValidate: true });
    const id: number = Number(getValues(`items[${index}].id`));
    const quantity: number = Number(getValues(`items[${index}].quantity`));
    const unitPrice: number = Number(getValues(`items[${index}].unitPrice`));
    const taxRateItem: any = getValues(`items[${index}].taxRateItem`);
    const subTotal: string = (Math.round(quantity * unitPrice * 100) / 100)
      .toFixed(2)
      .toString();
    setValue(
      `items[${index}].amount`,
      Number(subTotal).toLocaleString("en", { minimumFractionDigits: 2 })
    );

    const item: ICost = {
      id: id,
      quantity: quantity.toString(),
      unitPrice: unitPrice.toString(),
      taxRateItem: taxRateItem,
      inventoryItem: null,
    };

    //setCosts({ ...costs, id: id  });

    const newTodos = [...costs];
    newTodos[index] = item;
    setCosts(newTodos);

    console.log(costs);

    //const item: ICost[] = [{ id: id, quantity: quantity.toString(), unitPrice: unitPrice.toString() }]
    //const update: ICost[] = [...costs];
    // update[index]: ICost[] = item;
    // setTodos(newTodos);
    setFieldCounter(fieldCounter + 1);
    console.log("a");
  };

  const [fieldCounter, setFieldCounter] = useState(0);

  useEffect(() => {
    var subTotal: number = 0;
    var totalTaxes: number = 0;
    // eslint-disable-next-line array-callback-return
    costs.map((item, index) => {
      if (!isNaN(Number(item.quantity)) && !isNaN(Number(item.unitPrice))) {
        const quantity: number = Number(item.quantity);
        const unitPrice: number = Number(item.unitPrice);
        var rate: number = 0;
        if (item.taxRateItem === null || item.taxRateItem === undefined)
          rate = 0;
        else rate = Number(item.taxRateItem.rate);
        if (isNaN(rate)) rate = 0;
        subTotal = subTotal + quantity * unitPrice;
        totalTaxes = totalTaxes + quantity * unitPrice * (rate / 100); // 100;
      }
    });
    setSubTotal(Number(subTotal));
    setTotalTaxes(Number(totalTaxes));
    setTotalAmount(Number(subTotal) + totalTaxes);
  }, [costs, fieldCounter]);

  const [openDelete, setOpenDelete] = useState(false);
  const deleteItemId = useRef(0);

  const handleUpdateTotal = () => {
    var _tempCosts: ICost[] = costs;
    _tempCosts.splice(deleteItemId.current, 1);
    setCosts(_tempCosts);
    setFieldCounter(fieldCounter + 1);
  };

  const [paymentMethod, setPaymentMethod] = React.useState("PD");

  const handleChangePaymentMethod = (e: any, field: string) => {
    //setValue(field, e.target.value, { shouldValidate: true });
    setPaymentMethod(e.target.value);
  };

  
  const [addPurchaseItem, setAddPurchaseItem] = useState(false);

  

  interface ISelect {
    id: number;
    value: boolean;
  }

  const [reactSelect, setReactSelect] = useState<ISelect[]>([
    { id: 0, value: false },
    { id: 1, value: false },
    { id: 2, value: false },
  ]);

  const [enableSelectChartOfAccount, setEnableSelectChartOfAccount] = useState("");


const handleEnableChartOfAccount = (index: number) => {
  //alert(getValues(`items[${index}].inventoryItem`).value);

  //if (typeof getValues(`items[${index}].inventoryItem`) === "undefined") {
  //alert("undefined")
  //} else {
  //alert(getValues(`items[${index}].inventoryItem`).value);
  //}

  if (index <= fields.length - 1  && editMode) {
    const disable = fields[index].inventoryItem.value === null ? false : true;
    if (index === fields.length - 1) {
      setEditMode(false);
    }
    return disable;
  }

  const disable = typeof getValues(`items[${index}].inventoryItem`) === "undefined" ||
    getValues(`items[${index}].inventoryItem`).value === null ? false : true;
  
  return disable;
};


  const handleChangeInventoryItem = (
    e: any,
    field: string,
    field2: any,
    index: number
  ) => {
    if (e === null) {
     /* setValue(
        `items[${index}].inventoryItem`,
        { value: null },
        { shouldValidate: true }
      ); */

      alert(getValues(`items[${index}].inventoryItem`).value);

      //const temp = [...reactSelect];
      //temp[index].value = false;
      //setReactSelect(temp);
      //setCounterRender(counterRender + 1);
      return;
    }

    setValue(field, e, { shouldValidate: true });

    const w = chartOfAccounts.find((p) => p["value"] === e.assetAccountId);

    setValue(
      `items[${index}].chartOfAccountItem`,
      w,
      { shouldValidate: false }
    )
    const x = getValues(field2);
    setCounterRender(counterRender + 1);

    //const temp = [...reactSelect];
    //temp[index].value = false;
    //setReactSelect(temp);
    //setValue(field2, e, { shouldValidate: true });
    //setValue(field2, { value: e.assetAccountId, label: "" });
    //setDisableChartOfAccount(true);
    //document.getElementById(field2);
    //chartOfAccounts.find(x => x.Id === e.target.value)

    //const temp = [...reactSelect];
    //temp[index].value = true;
    //setReactSelect(temp);
  };

  renderCount++;

  var chartOfAccountDisable: boolean[] = [false, false, false];

  return vendors.length > 0 &&
    chartOfAccounts.length > 0 &&
    inventories.length > 0 &&
    taxRates.length > 0 ? (
    <form id="inventoryForm" onSubmit={handleSubmit(onSubmit)}>
      <span className="counter">Render Count: {renderCount}</span>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Button
            onClick={() => {
              const s = 0;
              alert(getValues(`items[0].inventoryItem`).value);
            }}
          >
            asdfsadf
          </Button>
          <TextField
            name="id"
            inputRef={register()}
            defaultValue={props.rowData === null ? 0 : props.rowData.id}
            className={classes.visuallyHidden}
          />
          <TextField
            name="amount"
            inputRef={register()}
            defaultValue={props.rowData === null ? 0 : props.rowData.id}
            className={classes.visuallyHidden}
          />
          <Controller
            control={control}
            name="vendor"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <CreatableSelect
                name="vendor"
                onBlur={onBlur}
                onChange={(e) => handleSelectChange(e, "vendor")}
                inputRef={register()}
                options={vendors}
                //className={classes.reactSelect}
                placeholder="Please select vendor"
                style={{ zindex: 999, paddingBottom: "100px" }}
                isClearable
                defaultValue={
                  props.rowData === null
                    ? null
                    : vendors.find(
                        (obj: any) =>
                          Number(obj["value"]) ===
                          Number(props.rowData.vendor.value)
                      )
                }
              />
            )}
          />
          <p className={classes.p}>{errors?.["vendor"]?.["message"]}</p>
        </Grid>
        <Grid item xs={12}>
          <div style={{ paddingBottom: "10px" }}></div>
        </Grid>
        <Grid item xs={2}>
          <Radio
            checked={paymentMethod === "PD"}
            onChange={(e) => handleChangePaymentMethod(e, "chartOfAccountId")}
            value="PD"
            name="modeOfPayment"
            inputRef={register()}
          />{" "}
          Paid
        </Grid>
        <Grid item xs={2}>
          <Radio
            checked={paymentMethod === "PY"}
            onChange={(e) => handleChangePaymentMethod(e, "chartOfAccountId")}
            value="PY"
            name="modeOfPayment"
            inputRef={register()}
          />{" "}
          Payable
        </Grid>
        <Grid item xs={8}>
          <Controller
            control={control}
            name="chartOfAccounts"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <CreatableSelect
                name="chartOfAccounts"
                onBlur={onBlur}
                onChange={(e) => handleChange(e, "chartOfAccounts")}
                inputRef={register()}
                options={chartOfAccounts}
                isDisabled={paymentMethod === "PY"}
                //className={classes.reactSelect}
                //style={{
                //  marginTop: "20px",
                //  fontSize: "13px",
                //  width: "100%",
                //  zIndex: "5",
                //}}
                placeholder="Please select cash or bank account"
                defaultValue=                
                {
                  props.rowData != null ?
                  chartOfAccounts.find(
                  (obj: any) =>
                    Number(obj["value"]) ===
                      Number(props.rowData.chartOfAccounts["value"])
                    
                ) : null }
              />
            )}
          />
          <p className={classes.p}>{errors.chartOfAccounts?.message}</p>
        </Grid>
        <Grid item xs={8}>
          <Controller
            control={control}
            name="referenceNo"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="referenceNo"
                inputRef={register()}
                label="Reference No."
                margin="normal"
                defaultValue=""
                size="small"
                style={{ width: "100%", marginTop: "3px" }}
                className={classes.smallFontSize}
                fullWidth
              />
            )}
          />
          <p className={classes.p}>{errors.referenceNo?.message}</p>
        </Grid>
        <Grid item xs={2}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Controller
              control={control}
              name="date"
              render={({ onChange, onBlur, value, name, ref }) => (
                <KeyboardDatePicker
                  name="date"
                  value={value}
                  format="MM/dd/yyyy"
                  inputRef={register()}
                  label="Date"
                  onBlur={onBlur}
                  onChange={onChange}
                  size="small"
                  //className={classes.textField3}
                  style={{ marginTop: "3px" }}
                  fullWidth
                />
              )}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={2} className={classes.textField}>
          <MuiPickersUtilsProvider locale={ptBR} utils={DateFnsUtils}>
            <Controller
              control={control}
              name="dueDate"
              render={({ onChange, onBlur, value, name, ref }) => (
                <KeyboardDatePicker
                  name="dueDate"
                  value={value}
                  format="MM/dd/yyyy"
                  inputRef={register()}
                  label="Due Date"
                  onBlur={onBlur}
                  onChange={onChange}
                  size="small"
                  //variant="filled"
                  //value={value}
                  style={{ marginTop: "3px" }}
                  //className={classes.textField}
                  fullWidth
                />
              )}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12}>
          <Controller
            control={control}
            name="description"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="description"
                inputRef={register()}
                label="Notes"
                margin="normal"
                variant="outlined"
                defaultValue=""
                size="small"
                className={classes.multiLine}
                style={{ marginTop: "0px" }}
                multiline
                rows={3}
                rowsMax={3}
                fullWidth
              />
            )}
          />
          <p className={classes.p}>{errors.description?.message}</p>
        </Grid>
        {console.log(fields)}
        {fields.map((item, index) => {
          //setReactSelect([...setReactSelect, { id: index, value:}])
          var fld = fields;
          // setReactSelect((prevArray) => [...prevArray, {id: index, value: false}]);
          console.log(fld);
          return (
            <div key={item.id} style={{ width: "100%" }}>
              <Grid container justify="space-around" direction="row">
                <Grid item xs={2}>
                  <Controller
                    control={control}
                    name={`items[${index}].id`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <TextField
                        name={`items[${index}].id`}
                        defaultValue={`${item.id}`}
                        variant="outlined"
                        placeholder="id"
                        label="Id"
                        className={classes.visuallyHidden}
                        size="small"
                        inputProps={{ "data-id": index }}
                        inputRef={register()}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`items[${index}].inventoryItem`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <CreatableSelect
                        name={`items[${index}].inventoryItem`}
                        //defaultValue= {inventories.find(object => Number(object.value) === costs[index].taxRateItem.value)};
                        onChange={(e: any) =>
                          handleChangeInventoryItem(
                            e,
                            `items[${index}].inventoryItem`,
                            `items[${index}].chartOfAccountItem`,
                            index
                          )
                        }
                        fullWidth
                        defaultValue={
                          addPurchaseItem === true
                            ? null
                            : inventories.find(
                                (obj: any) =>
                                  Number(obj["value"]) ===
                                  Number(
                                    props.rowData.items[index].inventoryItem
                                      .value
                                  )
                              )
                        }
                        inputRef={register()}
                        options={inventories}
                        placeholder="Please select inventory item"
                        isClearable
                        className={classes.reactSelect}
                      />
                    )}
                  />
                  <p className={classes.p}>
                    {errors?.["items"]?.[index]?.["inventoryItem"]?.["message"]}
                  </p>
                </Grid>

                <Grid item xs={2}>
                  <Controller
                    //isDisabled = {reactSelect[index].value} //{`selectDisable${index}`}
                    control={control}
                    id={`items[${index}].chartOfAccountItem`}
                    name={`items[${index}].chartOfAccountItem`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <CreatableSelect
                        id={`items[${index}].chartOfAccountItem`}
                        name={`items[${index}].chartOfAccountItem`}
                        onChange={(e: any) =>
                          handleSelectChange(
                            e,
                            `items[${index}].chartOfAccountItem`
                          )
                        }
                        defaultValue={
                          addPurchaseItem === true
                            ? null
                            : chartOfAccounts.find(
                                (obj: any) =>
                                  Number(obj["value"]) ===
                                  Number(
                                    props.rowData.items[index]
                                      .chartOfAccountItem.value
                                  )
                              )
                        }
                        inputRef={register()}
                        options={chartOfAccounts}
                        placeholder="Please select category"
                        className={classes.reactSelect}
                        isDisabled={handleEnableChartOfAccount(index)}
                        isClearable
                      />
                    )}
                  />

                  <p className={classes.p}>
                    {
                      errors?.["items"]?.[index]?.["chartOfAccountItem"]?.[
                        "message"
                      ]
                    }
                  </p>
                </Grid>

                <Grid item xs={2}>
                  <Controller
                    control={control}
                    name={`items[${index}].description`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <TextField
                        name={`items[${index}].description`}
                        defaultValue={`${item.description}`}
                        label="Description"
                        style={{ paddingTop: "0px", marginTop: "0px" }}
                        className={classes.textField}
                        margin="dense"
                        variant="outlined"
                        inputRef={register()}
                        fullWidth
                        multiline
                        rows={10}
                        rowsMax={2}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={1}>
                  <Controller
                    control={control}
                    name={`items[${index}].quantity`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <TextField
                        name={`items[${index}].quantity`}
                        onBlur={(e: any) =>
                          handleQtyUnitPrice(
                            e,
                            index,
                            `items[${index}].quantity`
                          )
                        }
                        defaultValue={`${item.quantity}`}
                        variant="outlined"
                        placeholder="Quantity"
                        label="Quantity"
                        className={classes.textField}
                        size="small"
                        inputProps={{ "data-id": index }}
                        inputRef={register()}
                      />
                    )}
                  />
                  <p className={classes.p}>
                    {errors?.["items"]?.[index]?.["quantity"]?.["message"]}
                  </p>
                </Grid>
                <Grid item xs={1}>
                  <Controller
                    control={control}
                    name={`items[${index}].unitPrice`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <TextField
                        name={`items[${index}].unitPrice`}
                        onBlur={(e: any) =>
                          handleQtyUnitPrice(
                            e,
                            index,
                            `items[${index}].unitPrice`
                          )
                        }
                        variant="outlined"
                        defaultValue={`${item.unitPrice}`}
                        placeholder="Unit Price"
                        className={classes.textField}
                        size="small"
                        label="Unit Price"
                        //pattern="/^\d+\.\d{0,2}$/" //"[+-]?\d+(?:[.,]\d+)?"
                        inputRef={register()}
                      />
                    )}
                  />
                  <p className={classes.p}>
                    {errors?.["items"]?.[index]?.["unitPrice"]?.["message"]}
                  </p>
                </Grid>
                <Grid item xs={2}>
                  <Controller
                    control={control}
                    name={`items[${index}].taxRateItem`}
                    render={(
                      { onChange, onBlur, value, name, ref },
                      { invalid, isTouched, isDirty }
                    ) => (
                      <CreatableSelect
                        name={`items[${index}].taxRateItem`}
                        //onBlur={(e: any) => {
                        //  handleChange(e, `items[${index}].taxRateItem`)
                        //  handleQtyUnitPrice(
                        //    e,
                        //    index,
                        //    `items[${index}].taxRateItem`
                        //  );
                        //}}
                        onChange={(e: any) => {
                          //handleSelectChange(e, `items[${index}].taxRateItem`);
                          handleQtyUnitPrice(
                            e,
                            index,
                            `items[${index}].taxRateItem`
                          );
                        }}
                        inputRef={register()}
                        options={taxRates}
                        placeholder="Please select tax"
                        className={classes.reactSelect}
                        defaultValue={
                          addPurchaseItem === true
                            ? null
                            : taxRates.find(
                                (obj: any) =>
                                  Number(obj["value"]) ===
                                  Number(
                                    props.rowData.items[index].taxRateItem.value
                                  )
                              )
                        }
                      />
                    )}
                  />

                  <p className={classes.p}>
                    {errors?.["items"]?.[index]?.["taxRateItem"]?.["message"]}
                  </p>
                </Grid>
                <Grid item xs={2}>
                  <table
                    //width="100%"
                    cellPadding="0px"
                    cellSpacing="0px"
                    //style={{tableLayout: "fixed"}}
                  >
                    <tbody>
                      <tr>
                        <td>
                          <Controller
                            control={control}
                            name={`items[${index}].amount`}
                            render={(
                              { onChange, onBlur, value, name, ref },
                              { invalid, isTouched, isDirty }
                            ) => (
                              <TextField
                                name={`items[${index}].amount`}
                                defaultValue={`${item.amount}`}
                                variant="outlined"
                                placeholder=""
                                label="Sub Total"
                                className={classes.textField}
                                size="small"
                                inputProps={{
                                  "data-id": index,
                                  readOnly: true,
                                }}
                                inputRef={register()}
                                InputLabelProps={{ shrink: true }}
                              />
                            )}
                          />
                          <p className={classes.p}>
                            {
                              errors?.["items"]?.[index]?.["amount"]?.[
                                "message"
                              ]
                            }
                          </p>
                        </td>
                        <td>
                          <DeleteForeverIcon
                            color="secondary"
                            style={{ marginLeft: "0px" }}
                            onClick={() => {
                              setOpenDelete(true);
                              deleteItemId.current = index;
                              //handleDeleteDisplayTotal(true, index)
                              //handleDeleteItem(
                              //  getValues(`items[${index}].keyNameId`)
                              //);
                              //console.log(fields);
                              //remove(index);
                              //if (fields.length >= index) {
                              //  fields.splice(index, 1);
                              //  setCosts(fields);
                              //  console.log(fields);
                              //}
                            }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Grid>
              </Grid>
            </div>
          );
        })}
        <Button
          type="button"
          color="primary"
          variant="contained"
          onClick={() => {
            setItemCount(itemCount - 1);
            setAddPurchaseItem(true);
            append(
              {
                id: itemCount,
                quantity: "",
                unitPrice: "",
                amount: "",
                description: "",
              },
              false
            );
            const item: ICost = {
              id: itemCount,
              quantity: "",
              unitPrice: "",
              taxRateItem: null,
              inventoryItem: null,
            };
            setCosts([...costs, item]); // adding new item in the array
          }}
        >
          Add Line
        </Button>
        <Dialog
          //fullScreen={fullScreen}
          open={openDelete}
          //onClose={handleClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            DELETE CONFIRMATION
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => setOpenDelete(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                remove(deleteItemId.current);
                handleUpdateTotal();
                setOpenDelete(false);
                setCounterRender(counterRender + 1);
              }}
              color="primary"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
      <Grid container justify="space-around" direction="row">
        <Grid item xs={9}></Grid>
        <Grid item xs={1}>
          <h1 className={classes.totalAmount}>Sub Total:</h1>
        </Grid>
        <Grid item xs={2}>
          <h1 className={classes.totalAmount}>
            <NumberFormat
              value={subTotal}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
            />
          </h1>
        </Grid>
        <Grid item xs={9}></Grid>
        <Grid item xs={1}>
          <h1 className={classes.totalAmount}>Sales Tax:</h1>
        </Grid>
        <Grid item xs={2}>
          <h1 className={classes.totalAmount}>
            <NumberFormat
              value={totalTaxes}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
            />
          </h1>
        </Grid>
        <Grid item xs={9}></Grid>
        <Grid item xs={1}>
          <h1 className={classes.totalAmount}>TOTAL :</h1>
        </Grid>
        <Grid item xs={2}>
          <h1 className={classes.totalAmount}>
            <NumberFormat
              value={totalAmount}
              displayType={"text"}
              thousandSeparator={true}
              decimalScale={2}
              fixedDecimalScale={true}
            />
          </h1>
        </Grid>
      </Grid>
      <Dialog
        open={openTax}
        onClose={handleCloseTax}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add new Tax Rate</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tax rate does not exists. Please, add it!
          </DialogContentText>
          <Formik
            initialValues={initialTaxValues}
            onSubmit={(values, { resetForm }) => {
              handleNewTax(values);
            }}
            validationSchema={validationSchemaTax}
          >
            {(props) => {
              const {
                values,
                touched,
                errors,
                dirty,
                isSubmitting,
                handleChange,
                handleBlur,
                handleSubmit,
                handleReset,
              } = props;
              return (
                <Form onSubmit={handleSubmit}>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="description"
                    name="description"
                    fullWidth
                    value={values.description}
                    onChange={handleChange}
                    label="name"
                    type="text"
                    helperText={
                      errors.description &&
                      touched.description &&
                      errors.description
                    }
                    error={
                      errors.description === "" && touched.description === true
                    }
                  />
                  <TextField
                    id="rate"
                    label="Tax Rate"
                    name="rate"
                    type="number"
                    value={values.rate}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField
                    id="tax_type"
                    label="Tax Type"
                    name="tax_type"
                    value="P"
                    //className={classes.hide}
                  />
                  <Button type="submit" color="primary">
                    Add
                  </Button>
                  <Button onClick={handleCloseTax} color="primary">
                    Cancel
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>

      <Button
        id="submitButton"
        type="submit"
        variant="contained"
        color="primary"
        //disabled={isSubmitting}
        style={{ marginTop: "200px" }}
        disabled={formState.isSubmitting}
        //disabled="true"
      >
        {console.log(formState.isSubmitting)}
        Save
      </Button>
      <Button
        type="button"
        variant="contained"
        autoFocus
        onClick={() => {
          props.closeDialog();
        }}
        color="primary"
        //  style={{ marginLeft: "15px" }}
        style={{ marginTop: "200px", marginLeft: "15px" }}
      >
        Close
      </Button>
    </form>
  ) : (
    <>loading....</>
  );
}
