import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  TextField,
  Button,
  makeStyles,
  createStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import {
  useForm,
  useFieldArray,
  Controller,
  useWatch,
  useFormContext
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import ReactSelect from "../controls/reactSelect";
import UploadFile from "../controls/uploadFile";
import $ from "jquery";
import DeleteIcon from "@material-ui/icons/Delete";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import NumberFormat from "react-number-format";
import "react-dropzone-uploader/dist/styles.css";
import { useDropzone } from "react-dropzone";
import { compareSync } from "bcryptjs";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import commaNumber from "comma-number";
import CreatableSelect from "react-select/creatable";
import { Formik, Form, ErrorMessage, useFormikContext, useField } from "formik";
import Select from "react-select";
import ReactDatePicker from "react-datepicker";
import { value } from "numeral";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { ptBR } from "date-fns/locale";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import configData from "../../config.json";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import { useReactToPrint } from "react-to-print";

import { ComponentToPrint } from "./sales-invoice-print";
import { set } from "date-fns";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      maxWidth: "100%",
      display: "block",
      margin: "0 auto",
    },
    textField: {
      "& > *": {
        width: "100%",
        paddingTop: "0px",
        zIndex: "0",
        marginTop: "0px",
        paddingBottom: "5px",
        fontSize: "13px",
      },
    },
    textField2: {
      width: "100%",
      zIndex: "0",
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
        zIndex: "0",
        fontSize: "13px",
        height: "40px",
      },
    },
    reactSelect: {
      paddingTop: "8px",
      fontSize: "13px",
      width: "100%",
      //zIndex: "5",
    },
    reactSelect2: {
      paddingTop: "8px",
      fontSize: "13px",
      width: "40%",
      //zIndex: "5",
    },
    rowLines: {
      maxWidth: "100%",
    },
    myTable: {
      width: "500px",
    },
    totalAmount: {
      marginTop: "0px",
      paddingTop: "0px",
      textAlign: "left",
    },
    submitButton: {
      marginTop: "24px",
    },
    hide: {
      display: "none",
    },
    deleteButton: {
      marginTop: "9.5px",
      marginLeft: "15px",
    },
    deleteAttachmentButton: {
      marginBottom: "0px",
    },
    title: { textAlign: "center" },
    successMessage: { color: "green" },
    errorMessage: { color: "red" },
    p: {
      marginTop: "0px",
      color: "#bf1650",
      marginBottom: "0px",
    },
    controller: {
      marginTop: "0px",
    },
    billingAddress: {
      marginTop: "15px",
      paddingBottom: "0px",
    },
  })
);

const validationSchema = Yup.object().shape({
  billingAddress: Yup.string().required("Enter Billing Address."),
  invoiceNo: Yup.string().required("Enter Invoice No."),
  customer: Yup.object().nullable().required("Enter Customer"),
  id: Yup.number(),
  terms: Yup.number(),
  items: Yup.array().of(
    Yup.object().shape({
      id: Yup.number(),
      salesItem: Yup.object().nullable().required("Sales Item is required"),
      description: Yup.string().nullable().required("Enter Description"),
      taxRateItem: Yup.object().nullable().required("Tax Rate is required"),
      trackingItem: Yup.object().nullable().required("Tracking is required"),
      qty: Yup.number()
        .nullable()
        .typeError("Quantity is required")
        .required("Quantity is required"),
      unitPrice: Yup.number()
        .nullable()
        .typeError("Unit Price is required")
        .required("Unit Price is required"),
      //Yup.string()
      //.nullable()
      //.typeError("Unit Price is required")
      //.required("Unit Price is required")
      //.test("is-decimal", "invalid decimal", (value) =>
      //  (value + "").match(/^\d+(\.\d{1,2})?$/)
      //),
    })
  ),
});

let renderCount = 0;

const initialValues = {
  id: -1,
  customer: { value: null, label: null },
  billingAddress: "",
  invoiceNo: "",
  date: new Date(),
  dueDate: new Date(),
  terms: "",
  reference: "",
  /* items: [
    {
      id: -1234567,
      salesItem: null,
      description: "",
      qty: null,
      unitPrice: null,
      taxRateItem: null,
      trackingItem: null,
    },
  ], */
};

const SalesInvoice = ({ preloadedValues, editMode, setOpenEdit }) => {
  const [costs, setCosts] = useState([]);
  const [files, setFiles] = useState([]);
  const loadPreLoadedValues = useRef(true);
  const [loadInvoice, setLoadInvoice] = useState(preloadedValues);
  useEffect(() => {
    if (loadInvoice !== null) {
      setCosts(loadInvoice.items);
      loadInvoice.date = moment(loadInvoice.date).format("MM/DD/YYYY");
      loadInvoice.dueDate = moment(loadInvoice.dueDate).format("MM/DD/YYYY");
      setFiles(loadInvoice.loadFiles);
    }
  }, []);
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
    defaultValues: loadInvoice === null ? {} : loadInvoice,

    resolver: yupResolver(validationSchema),
  });

  // Read the formState before render to subscribe the form state through Proxy
  const { dirty, isSubmitting, touched, submitCount } = formState;

  const invoice = useRef();
  const tax = useRef();

  const [inv, setInv] = useState();

  //invoice.current = {
  //  billingAddress: "abc",
  //  items: [{ description: "kat1" }, { description: "kat2" }],
  //};

  invoice.current = {
    billingAddress: "abc",
    items: [{ description: "kat1" }, { description: "kat2" }],
  };

  // eslint-disable-next-line no-lone-blocks
  {
    /* useEffect(() => {
    fetch("configData.SERVER_URLsales/GetAccount?id=9092", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        invoice.current = data;
        setInv(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, []); */
  }

  useEffect(() => {});

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "items",
      keyName: "keyNameId",
    }
  );

  const classes = useStyles();

  const [subsidiaryLedgerAccounts, getSubsidiaryLedgerAccounts] = useState([]);

  const [salesItems, getSalesItems] = useState([]);

  const [taxRates, getTaxRates] = useState([]);

  const [trackings, getTrackings] = useState([]);

  const [itemCount, setItemCount] = useState(-2);
  const [count, setCount] = useState(0);
  const [counter, setCounter] = useState(0);
  const [counterSales, setCounterSales] = useState(0);
  const [counterTax, setCounterTax] = useState(0);
  const [counterTracking, setCounterTracking] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [totalTaxes, setTotalTaxes] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [invoiceData, setInvoiceData] = useState();
  const [taxRateDefaultValue, setTaxRateDefaultValue] = useState([]);
  var [invoiceCounter, setInvoiceCounter] = useState(0);

  var tv = [];
  const [isBusy, setBusy] = useState(true);
  const [isBusy2, setBusy2] = useState(true);
  //const onLoadInvoiceItems = useRef(true);
  const [addInvoiceItems, setAddInvoiceItems] = useState(false);
  const x = configData.SERVER_URL;
  //useEffect(() => {
  //  if (!addInvoiceItems) {
  //    onLoadInvoiceItems.current = true;
  //  } else
  //    onLoadInvoiceItems.current = false;
  //}, [addInvoiceItems]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "SubsidiaryLedger/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        //console.log(data)
        getSubsidiaryLedgerAccounts(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counter]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "Inventory/GetSelect", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        getSalesItems(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterSales]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "TaxRate/get?type=S", {
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
        setBusy2(false);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterTax]);

  useEffect(() => {
    fetch(configData.SERVER_URL + "Tracking/get", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        getTrackings(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [counterTracking]);

  /* useEffect(() => {
    //setOpenEdit(true)
    fetch(
      configData.SERVER_URL + "Sales/PrintInvoice?id=" + loadInvoice.id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        setInvoiceData(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [invoiceCounter, loadInvoice.id]); */
  const [origId, setOrigId] = useState(
    loadInvoice !== null ? loadInvoice.id : 0
  );
  const [preId, setPreId] = useState(loadInvoice !== null ? loadInvoice.id : 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loadInvoice === null) {
      return;
    }
    const fetchData = () => {
      setIsLoading(true);
      setPreId(origId);
      fetch(configData.SERVER_URL + "Sales/PrintInvoice?id=" + loadInvoice.id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((results) => results.json())
        .then((data) => {
          console.log(data);
          setInvoiceData(data);
        })
        .catch(function (error) {
          console.log("network error");
        });

      //setInvoiceData(data);
      setIsLoading(false);
    };

    fetchData();
  }, [preId, origId, loadInvoice]);

  const tv2 = [2011, 2];

  const [taxRateValue, setSelectedTaxRateValue] = useState([]);
  //setCounterTax(counterTax + 1)

  useEffect(() => {
    handleDeleteDisplayTotal(false);
    //setValue(`items[0].taxRateItem`, taxRateDefaultValue[0])
  }, []);

  function handleNewSales(values) {
    fetch(configData.SERVER_URL + "IncomeItem/addaccount", {
      method: "POST",
      body: JSON.stringify({
        id: 0,
        name: values.name,
        sku: values.sku,
        description: values.description,
        incomeAccountId: values.incomeAccountId.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        setCounterSales(counterSales + 1);
        handleCloseSales();
      });
  }

  function handleNewTax(values) {
    fetch(configData.SERVER_URL + "TaxRate/addaccount", {
      method: "POST",
      body: JSON.stringify({
        description: values.description,
        rate: values.rate,
        taxType: values.tax_type
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

  function removeFileAttachment(file) {
    fetch(
      configData.SERVER_URL + "FileAttachment/DeleteFile?fileName=" + file,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((results) => results.json())
      .then((data) => {});
  }

  function handleNewTracking(values) {
    fetch(configData.SERVER_URL + "Tracking/addaccount", {
      method: "POST",
      body: JSON.stringify({
        description: values.description,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        setCounterTracking(counterTracking + 1);
        handleCloseTracking();
      });
  }

  function loadInvoiceData() {
    setInvoiceData({});
    fetch(configData.SERVER_URL + "Sales/PrintInvoice?id=" + loadInvoice.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        setInvoiceData(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }

  const loadInvoiceData1 = () => {
    fetch(configData.SERVER_URL + "Sales/PrintInvoice?id=" + loadInvoice.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        setInvoiceData(data);
      });
    //const body = await res.json();
    //console.log("coursesbody is:", body);
    //return body;
  };

  // here is how you call this function
  //const invData = fetchCourses();

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 40,
      minHeight: 40,
    }),
  };

  function changePreId() {
    //loadInvoice.id = Number(loadInvoice.id) + 1;
    setPreId(preId + 1);
    setPreId(Number(loadInvoice.id));
    handlePrint();
  }

  const loadBillingAddress = (id) => {
    const sL = subsidiaryLedgerAccounts.find((x) => x.value === id);
    //setValue("billingAddress", sL.address, {
    //  shouldValidate: true,
    //  shouldDirty: true,
    //});
    setValue("billingAddress", sL.address === null ? "" : sL.address, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  const handleChangeCustomer = (e, field) => {
    setValue(field, e, { shouldValidate: true }, { shouldDirty: true });
    loadBillingAddress(e.value);
  };

  const handleChange = (e, field) => {
    setValue(field, e, { shouldValidate: true }, { shouldDirty: true });
    //handleCostsChange();
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const [openDelete, setOpenDelete] = useState(false);

  //const [deleteItemId, setDeleteItemId] = useState(null);

  const deleteItemId = useRef(0);

  const [open, toggleOpen] = useState(false);
  const [indexes, setIndexes] = useState([]);
  const [counterArray, setCounterArray] = useState(0);
  const [openSales, toggleOpenSales] = useState(false);
  const [openTax, toggleOpenTax] = useState(false);
  const [openTracking, toggleOpenTracking] = useState(false);
  const [chartOfAccounts, getChartOfAccounts] = useState([]);
  const [counterChartOfAccount, setCounterCharOfAccount] = useState(0);

  const handleClose = () => {
    setBillingAddress({ address: "" });
    toggleOpen(false);
  };

  const handleCloseSales = () => {
    setOptionSales((optionSales = null));
    toggleOpenSales(false);
  };

  const handleCloseTax = () => {
    toggleOpenTax(false);
  };

  const handleCloseTracking = () => {
    toggleOpenTracking(false);
  };

  const [dialogValue, setDialogValue] = useState({
    name: "",
    billingAddress: "",
  });

  const [dialogValueSales, setDialogValueSales] = useState({
    description: "",
    rate: 0,
  });

  const [dialogValueTax, setDialogValueTax] = useState({
    description: "",
    rate: 0,
    tax_type: "S"
  });

  const [dialogValueTracking, setDialogValueTracking] = useState({
    description: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    address: "",
  });

  const handleCostsChange = (event, index, field, fieldName) => {
    console.log(costs);
    const _tempCosts = [...costs];
    console.log(fields);
    var rate = 0;
    //const index = event.target.dataset.id;
    if (_tempCosts.length > 0) {
      if (event.target === undefined) {
        _tempCosts[index][field] = event;
        setValue(
          fieldName,
          event,
          { shouldValidate: true },
          { shouldDirty: true }
        );
        rate = _tempCosts[index][field].rate / 100;
      } else {
        _tempCosts[index][field] = Number(event.target.value);
        setValue(
          fieldName,
          event.target.value === "" || isNaN(event.target.value)
            ? ""
            : event.target.value,
          { shouldValidate: true },
          { shouldDirty: true }
        );
        if (_tempCosts[index].hasOwnProperty("taxRateItem")) {
          rate = _tempCosts[index]["taxRateItem"]["rate"];
          if (rate === undefined) rate = 0;
          if (typeof rate === "object") rate = rate.rate / 100;
        }
      }
    }

    _tempCosts[index]["id"] = index;

    setCosts(_tempCosts);
    console.log(costs);
    const q = Number(_tempCosts[index]["qty"]);
    const y = Number(_tempCosts[index]["unitPrice"]);
    // console.log(q * y)
    // const z = `items[${index}].amount`;
    setValue(
      `items[${index}].amount`,
      isNaN(Math.round(q * y * 100) / 100)
        ? ""
        : commaNumber(Math.round(q * y * 100) / 100).toString()
    );
    handleDeleteDisplayTotal(false);
  };

  const handleDeleteDisplayTotal = (handleDelete) => {
    var _tempCosts =
      loadInvoice != null && loadPreLoadedValues.current === true
        ? loadInvoice.items
        : costs;

    loadPreLoadedValues.current = false;
    var newCosts = [];
    if (handleDelete) {
      //const { costs1 } = _tempCosts;

      // create a copy
      newCosts = [..._tempCosts];

      // remove by index
      newCosts.splice(deleteItemId.current, 1);

      // update values
      setCosts(newCosts);
    } // create a copy
    else {
      newCosts = [..._tempCosts];
      // update values
      setCosts(newCosts);
    }

    //if (handleDelete) {
    //  remove(deleteItemId);
    //}
    //setOpenDelete(false);
    //return;
    //setCosts(_tempCosts);
    setSubTotal(0);
    setTotalTaxes(0);
    setTotalAmount(0);
    var subTotal = 0;
    var totalTaxes = 0;
    var totalAmount = 0;
    console.log(fields);
    console.log(costs);
    var idDeleted = 0;

    // eslint-disable-next-line array-callback-return
    newCosts.map((item, index) => {
      var hitBreak = false;
      var itemId;
      for (itemId = 0; itemId <= newCosts.length + 100; itemId++) {
        if (!isNaN(Number(item["id"]))) {
          hitBreak = true;
          break;
        }
      }
      if (
        (handleDelete && index !== deleteItemId && hitBreak) ||
        (!handleDelete && hitBreak)
      ) {
        //_tempCosts.splice(index, 1);
        //idDeleted = index;
        //break;

        const qty = Number(item["qty"]);
        const unitPrice = Number(item["unitPrice"]);
        //var x = "items[" + item.id + "].taxRateItem";
        //const qty = Number(item.qty);
        //const unitPrice = Number(item.unitPrice);
        var rate = 0;
        var taxRateItem = item["taxRateItem"];
        if (taxRateItem !== undefined && taxRateItem.hasOwnProperty("value")) {
          rate = taxRateItem.rate / 100;
          //if (rate === undefined) rate = 0;
          //if (typeof rate === "object") rate = rate.rate / 100;
        } else rate = 0;
        if (!isNaN(qty) && !isNaN(unitPrice)) {
          subTotal = subTotal + qty * unitPrice;
          totalTaxes = totalTaxes + qty * unitPrice * rate;
          totalAmount = totalAmount + subTotal + totalTaxes;
        }
      } else if (handleDelete && hitBreak) {
        idDeleted = deleteItemId;
      }
    });
    setOpenDelete(false);
    setSubTotal(Number(subTotal));
    setTotalTaxes(totalTaxes);
    setTotalAmount(Number(subTotal) + totalTaxes);
    if (handleDelete) {
      remove(deleteItemId.current);
      //_tempCosts.splice(idDeleted, 1);
      //setCosts(_tempCosts);
    }
  };

  function handleOptionChangeSelect(selection) {
    setOptionSales(selection);
    //setFieldValue(props.name, selection);
  }

  const handleChangeSubTotal = (e, field, index) => {
    setValue(field, e, { shouldValidate: true }, { shouldDirty: true });
    //handleChangeAmount(fields);
  };
  const removeRow = (index) => () => {
    setIndexes((prevIndexes) => [
      ...prevIndexes.filter((item) => item !== index),
    ]);
    setCounterArray((prevCounter) => prevCounter - 1);
  };

  const validationSchemaCustomer = Yup.object().shape({
    name: Yup.string().required("Enter Customer Name."),
  });

  const validationSchemaSales = Yup.object().shape({
    name: Yup.string().required("Enter Sales Item Name."),
  });

  const validationSchemaTax = Yup.object().shape({
    description: Yup.string().required("Enter Description."),
  });

  const initialCustomerValues = {
    name: dialogValue.name,
    billingAddress: "",
  };

  const initialSaleValues = {
    name: dialogValueSales.name,
    sku: "",
    description: "",
    incomeAccountId: {},
  };

  const initialTaxValues = {
    description: dialogValueTax.description,
    rate: 0,
    tax_type: "S"
  };

  const initialTrackingValues = {
    description: dialogValueTracking.description,
  };

  const onDrop = React.useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  var [optionSales, setOptionSales] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const removeAttachment = (file, files) => {
    const result = $.grep(
      files,
      function (n, i) {
        if (n.path === file.path) {
          removeFileAttachment(file.path);
        }
        return n.path !== file.path;
      },
      false
    );
    setFiles(result);
  };

  const onSubmit = (values, { resetForm }) => {
    //document.getElementById("submitButton").disabled = true;

    const x = JSON.stringify(values);
    console.log("data", values);
    //values.files = files;
    //values.items = costs;
    //console.log(values.id);
    //values.items = null;
    //values.files = null;
    //if (values.date === undefined) new Date();
    //if (values.dueDate === undefined) new Date();

    //values.date = new Date(values.date);
    //values.dueDate = new Date(values.dueDate);

    //values.date = new Date(moment(values.date).format("MM/DD/YYYY"));
    //values.dueDate = new Date(moment(values.dueDate).format("MM/DD/YYYY"));

    //values.date = new Date(values.date.ge, 10, 9);
    //values.dueDate = new Date(values.dueDate.year, 7, 8);

    //values.qty = Number(values.qty)
    //values.unitPrice = Number(values.unitPrice)
    //values.terms = Number(values.terms);

    //values.date = new Date(values.date.replace(/-/g, '/').replace(/T.+/, ''));
    //values.dueDate = new Date(values.date.replace(/-/g, "/").replace(/T.+/, ""));
    //values.dueDate = moment(values.dueDate.toString()).toDate();
    //values.date = moment.tz(values.date, "Asia/Taipei");
    //values.date = moment.tz(values.dueDate, "Asia/Taipei");

    values.date = moment.parseZone(values.date.toString()).toDate();
    values.dueDate = moment.parseZone(values.dueDate.toString()).toDate();
    values.amount = subTotal + totalTaxes;
    values.totalTaxes = totalTaxes;

    if (loadInvoice !== null) values.id = origId;

    var url =
      loadInvoice === null
        ? configData.SERVER_URL + "sales/addaccount"
        : configData.SERVER_URL + "sales/editaccount";

    var urlMethod = loadInvoice === null ? "POST" : "PUT";
    if (urlMethod === "PUT") {
      values.id = loadInvoice.id;
    }

    fetch(url, {
      method: urlMethod,
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        setLoadInvoice(data);
        setPreId(data.id);
        var formData = new FormData();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const x = file.hasOwnProperty("isAttached");
          if (!file.hasOwnProperty("isAttached")) {
            formData.append("Files", files[i]);
          }
        }
        formData.append("id", Number(data.id));
        fetch(configData.SERVER_URL + "sales/AddUploadedFiles", {
          method: "POST",
          body: formData,
        })
          .then((results) => results.json())
          .then((data) => {
            //loadInvoice = data;
            if (loadInvoice === null) {
              //resetForm(initialValues);
              //reset(initialValues);
              //fileList = [null];
              //setFiles([]);
              //subTotal = 0;
              //totalTaxes = 0;
              //totalAmount = 0;
              //setSubTotal(0);
              //setTotalTaxes(0);
              //setTotalAmount(0);
              //setValue("terms", null);
              //setValue("customer", null);
              //setOpenEdit(false);
              console.log("successful");
            }
          })
          .catch(function (error) {
            console.log("network error");
          });
      })
      .catch(function (error) {
        console.log("network error");
      })
      .finally(() => setPreId(preId + 1));
  };

  function handleNewCustomer(name, address) {
    fetch(configData.SERVER_URL + "subsidiaryledger/addaccount", {
      method: "POST",
      body: JSON.stringify({
        id: 0,
        name: name,
        address: address,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        setCounter(counter + 1);
        handleClose();
      });
  }

  //const { register, handleSubmit } = useForm();

  const onSubmitNewCustomer = (data) => alert(JSON.stringify(data));

  //const [selectedDate, setSelectedDate] = React.useState(new Date());

  //const handleDateChange = (date) => {
  //  setSelectedDate(date);
  //};

  const [selectedDate1, setSelectedDate] = useState(
    new Date("2020-09-11T12:00:00")
  );

  //const [selectedDate, handleDateChange] = useState(new Date().toISOString());
  const [selectedDate, handleDateChange] = useState(new Date());
  const [selectedDueDate, handleDueDateChange] = useState(new Date());

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  renderCount++;

  return salesItems.length > 0 &&
    taxRates.length > 0 &&
    trackings.length > 0 &&
    subsidiaryLedgerAccounts.length > 0 ? (
    <form id="salesInvoiceForm" onSubmit={handleSubmit(onSubmit)}>
      <span className="counter">Render Count: {renderCount}</span>
      <Grid container justify="space-around" direction="row">
        <Grid item xs={12}>
          <Controller
            control={control}
            name="id"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="id"
                defaultValue={-1}
                className={classes.hide}
                margin="dense"
                variant="outlined"
                inputRef={register()}
              />
            )}
          />
          <Controller
            control={control}
            //id="customer"
            name="customer"
            //defaultValue={null}
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <CreatableSelect
                //id="customer"
                //name="customer"
                onBlur={onBlur}
                onChange={(e) => handleChangeCustomer(e, "customer")}
                inputRef={register()}
                isClearable
                options={subsidiaryLedgerAccounts}
                defaultValue={
                  loadInvoice !== null
                    ? subsidiaryLedgerAccounts.find(
                        (obj) =>
                          Number(obj.value) === loadInvoice.customer.value
                      )
                    : null
                }
                className={classes.reactSelect}
                onCreateOption={(inputValue) => {
                  setDialogValue({ name: inputValue });
                  toggleOpen(true);
                }}
              />
            )}
          />
          <p className={classes.p}>{errors.customer?.message}</p>
        </Grid>
        <Grid
          item
          lg={12}
          md={12}
          sm={12}
          xs={12}
          className={classes.textField}
        >
          <Controller
            control={control}
            name="billingAddress"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="billingAddress"
                inputRef={register()}
                label="Billing Address"
                margin="normal"
                multiline
                rows={4}
                rowsMax={4}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                className={classes.billingAddress}
              />
            )}
          />
          <p className={classes.p}>{errors.billingAddress?.message}</p>
        </Grid>
        <Grid item xs={2}>
          <Controller
            control={control}
            name="invoiceNo"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="invoiceNo"
                inputRef={register()}
                label="Invoice No"
                defaultValue=""
                fullWidth
                //className={classes.textField2}
              />
            )}
          />
          <p className={classes.p}>{errors.invoiceNo?.message}</p>
        </Grid>
        <Grid item xs={2} className={classes.textField}>
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
                  label="Invoice Date"
                  onBlur={onBlur}
                  onChange={onChange}
                  size="small"
                  variant="filled"
                  //value={value}
                  style={{ marginTop: "3px" }}
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
                  label="Invoice Date"
                  onBlur={onBlur}
                  onChange={onChange}
                  size="small"
                  variant="filled"
                  //value={value}
                  style={{ marginTop: "3px" }}
                />
              )}
            />
          </MuiPickersUtilsProvider>
        </Grid>

        {/*    <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid item xs={2} className={classes.textField}>
            <Controller
              control={control}
              name="date"
              render={({ onChange, onBlur,  name, ref }) => (
                <KeyboardDatePicker
                  name="date"
                  defaultValue={new Date()}
                  format="MM/dd/yyyy"
                  inputRef={register}
                  label="Invoice Date"
                  onBlur={onBlur}
                  onChange={onChange}
                  size="small"
                  variant="filled"
                  //value={value}
                  style={{ marginTop: "3px" }}
                />
              )}
            />
          </Grid>
          <Grid item xs={2} className={classes.textField}>
            <Controller
              control={control}
              name="dueDate"
              render={({ onChange, onBlur, name, ref }) => (
                <KeyboardDatePicker
                  defaultValue={new Date()}
                  format="MM/dd/yyyy"
                  inputRef={register}
                  label="Due Date"
                  name="dueDate"
                  onBlur={onBlur}
                  onChange={onChange}
                  size="small"
                  variant="filled"
                  //value={value}
                  style={{ marginTop: "3px" }}
                />
              )}
            />
          </Grid>
        </MuiPickersUtilsProvider> */}
        <Grid item xs={1} className={classes.textField}>
          <Controller
            control={control}
            name="terms"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="terms"
                defaultValue={0}
                inputRef={register()}
                type="number"
                label="Terms"
              />
            )}
          />
        </Grid>
        <Grid item xs={5} className={classes.textField}>
          <Controller
            control={control}
            name="reference"
            render={(
              { onChange, onBlur, value, name, ref },
              { invalid, isTouched, isDirty }
            ) => (
              <TextField
                name="reference"
                inputRef={register()}
                label="Reference"
                defaultValue=""
              />
            )}
          />

          <p className={classes.p}>{errors.reference?.message}</p>
        </Grid>
      </Grid>

      {fields.map((item, index) => {
        return (
          <div key={item.id}>
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
                      className={classes.hide}
                      margin="dense"
                      variant="outlined"
                      inputRef={register()}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`items[${index}].salesItem`}
                  render={(
                    { onChange, onBlur, value, name, ref },
                    { invalid, isTouched, isDirty }
                  ) => (
                    <CreatableSelect
                      name={`items[${index}].salesItem`}
                      onBlur={onBlur}
                      onChange={(e) =>
                        handleChange(e, `items[${index}].salesItem`)
                      }
                      defaultValue={
                        loadInvoice !== null &&
                        index < loadInvoice.items.length &&
                        !addInvoiceItems
                          ? salesItems.find(
                              (obj) =>
                                Number(obj.value) ===
                                Number(costs[index].salesItem.value)
                            )
                          : ""
                      }
                      inputRef={register()}
                      options={salesItems}
                      className={classes.reactSelect}
                      placeholder="Please select Sales Items"
                      styles={customStyles}
                    />
                  )}
                />
                <p className={classes.p}>
                  {errors?.["items"]?.[index]?.["salesItem"]?.["message"]}
                </p>
              </Grid>

              <Grid item xs={3}>
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
                      className={classes.textField}
                      margin="dense"
                      variant="outlined"
                      inputRef={register()}
                      fullWidth
                    />
                  )}
                />
                <p className={classes.p}>
                  {errors?.["items"]?.[index]?.["description"]?.["message"]}
                </p>
              </Grid>

              <Grid item xs={1}>
                <Controller
                  control={control}
                  name={`items[${index}].qty`}
                  render={(
                    { onChange, onBlur, value, name, ref },
                    { invalid, isTouched, isDirty }
                  ) => (
                    <TextField
                      name={`items[${index}].qty`}
                      defaultValue={`${item.qty}`}
                      variant="outlined"
                      onChange={(e) =>
                        handleCostsChange(
                          e,
                          index,
                          `qty`,
                          `items[${index}].qty`
                        )
                      }
                      placeholder="Quantity"
                      label="Quantity"
                      className={classes.textField3}
                      size="small"
                      inputProps={{ "data-id": index }}
                      inputRef={register()}
                    />
                  )}
                />
                <p className={classes.p}>
                  {errors?.["items"]?.[index]?.["qty"]?.["message"]}
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
                      variant="outlined"
                      onChange={(e) =>
                        handleCostsChange(
                          e,
                          index,
                          `unitPrice`,
                          `items[${index}].unitPrice`
                        )
                      }
                      defaultValue={`${item.unitPrice}`}
                      placeholder="Unit Price"
                      className={classes.textField3}
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
                      onChange={(e) =>
                        handleCostsChange(
                          e,
                          index,
                          `taxRateItem`,
                          `items[${index}].taxRateItem`
                        )
                      }
                      defaultValue={
                        loadInvoice !== null &&
                        index < loadInvoice.items.length &&
                        !addInvoiceItems
                          ? taxRates.find(
                              (obj) =>
                                Number(obj.value) ===
                                Number(costs[index].taxRateItem.value)
                            )
                          : ""
                      }
                      inputRef={register()}
                      options={taxRates}
                      className={classes.reactSelect}
                      placeholder="Please select Tax Rates"
                      styles={customStyles}
                      onCreateOption={(inputValue) => {
                        setDialogValueTax({ name: inputValue });
                        toggleOpenTax(true);
                      }}
                    />
                  )}
                />
                <p className={classes.p}>
                  {errors?.["items"]?.[index]?.["taxRateItem"]?.["message"]}
                </p>
              </Grid>
              <Grid item xs={1}>
                <Controller
                  control={control}
                  name={`items[${index}].amount`}
                  render={(
                    { onChange, onBlur, value, name, ref },
                    { invalid, isTouched, isDirty }
                  ) => (
                    <TextField
                      name={`items[${index}].amount`}
                      defaultValue={addInvoiceItems ? 0 : `${item.amount}`}
                      label="Sub Total"
                      className={classes.textFieldReadOnly}
                      inputProps={{readOnly: true }}
                      margin="dense"
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputRef={register()}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <table
                  width="125%"
                  border="0"
                  cellPadding="0px"
                  cellSpacing="0px"
                  //style={{tableLayout: "fixed"}}
                >
                  <tbody>
                    <tr>
                      <td>
                        <Controller
                          control={control}
                          name={`items[${index}].trackingItem`}
                          render={(
                            { onChange, onBlur, value, name, ref },
                            { invalid, isTouched, isDirty }
                          ) => (
                            <>
                              <CreatableSelect
                                onChange={(e) =>
                                  handleChange(
                                    e,
                                    `items[${index}].trackingItem`
                                  )
                                }
                                defaultValue={
                                  loadInvoice !== null &&
                                  index < loadInvoice.items.length &&
                                  !addInvoiceItems
                                    ? trackings.find(
                                        (obj) =>
                                          Number(obj.value) ===
                                          Number(
                                            costs[index].trackingItem.value
                                          )
                                      )
                                    : ""
                                }
                                onCreateOption={(inputValue) => {
                                  setDialogValueTracking({ name: inputValue });
                                  toggleOpenTracking(true);
                                }}
                                //style={{ width: "5px" }}
                                inputRef={register()}
                                options={trackings}
                                className={classes.reactSelect}
                                placeholder="Tracking"
                                styles={customStyles}
                                fullWidth
                              />
                            </>
                          )}
                        />
                        <p className={classes.p}>
                          {
                            errors?.["items"]?.[index]?.["trackingItem"]?.[
                              "message"
                            ]
                          }
                        </p>
                      </td>
                      <td>
                        <DeleteForeverIcon
                          style={{ paddingTop: "10px" }}
                          onClick={() => {
                            setOpenDelete(true);
                            deleteItemId.current = index;
                            //handleDeleteDisplayTotal(true, index)
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
          setAddInvoiceItems(true);
          append(
            {
              id: itemCount,
              salesItem: [{}],
              description: "",
              qty: "",
              unitPrice: "",
              //taxRateItem: { value: null, label: "" },
              //trackingItem: { value: null, label: "" },
              amount: "",
            },
            false
          );

          setCosts((prevCosts) => [
            ...prevCosts,
            {
              id: itemCount,
              qty: "",
              unitPrice: "",
              //salesItem: { value: null, label: "" },
              //taxRateItem: { value: null, label: "" },
              description: "",
              //trackingItem: { value: null, label: "" },
            },
          ]);
          //setCosts([{id: itemCount}]);
          console.log(costs);
        }}
      >
        Add Line
      </Button>

      <>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add a new Customer</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Customer does not exists. Please, add it!
            </DialogContentText>
            <Formik
              initialValues={initialCustomerValues}
              onSubmit={(values, { resetForm }) => {
                handleNewCustomer(values.name, values.billingAddress);
              }}
              validationSchema={validationSchemaCustomer}
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
                      id="name"
                      name="name"
                      fullWidth
                      value={values.name}
                      onChange={handleChange}
                      //onChange={(event) =>
                      //  setDialogValue({
                      //    ...dialogValue,
                      //    name: event.target.value,
                      //  })
                      //}
                      label="name"
                      type="text"
                      helperText={errors.name && touched.name && errors.name}
                      error={errors.name && touched.name}
                    />
                    <TextField
                      id="billingAddress"
                      label="Billing Address"
                      name="billingAddress"
                      value={values.address}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      rows={4}
                      rowsMax={4}
                      variant="outlined"
                    />
                    <Button type="submit" color="primary">
                      Add
                    </Button>
                    <Button onClick={handleClose} color="primary">
                      Cancel
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>

        <Dialog
          open={openSales}
          onClose={handleCloseSales}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add new Sales Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Sales Item does not exists. Please, add it!
            </DialogContentText>
            <Formik
              initialValues={initialSaleValues}
              onSubmit={(values, { resetForm }) => {
                values.incomeAccountId = optionSales;
                handleNewSales(values);
                resetForm(initialSaleValues);
              }}
              //validationSchema={validationSchemaSales}
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
                      id="name"
                      name="name"
                      fullWidth
                      value={values.name}
                      onChange={handleChange}
                      label="name"
                      type="text"
                      helperText={errors.name && touched.name && errors.name}
                      error={errors.name && touched.name}
                    />
                    <br></br>
                    <br></br>
                    <br></br>
                    <Select
                      id="incomeAccountId"
                      name="incomeAccountId"
                      placeholder="Select Income Account"
                      //styles={customStyles}
                      //{...field}
                      {...props}
                      //onBlur={updateBlur}
                      onChange={handleOptionChangeSelect}
                      value={optionSales}
                      //value={chartOfAccounts.find((obj) => obj.value === 6054)}
                      //value={{ value: 6054, label: "31231" }}
                      options={chartOfAccounts}
                      //className={customStyles.reactSelect}
                      isClearable
                    />
                    {console.log(
                      chartOfAccounts.find((obj) => obj.value === 6054)
                    )}

                    <TextField
                      id="sku"
                      label="SKU"
                      name="sku"
                      value={values.sku}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      //rows={4}
                      //rowsMax={4}
                      //variant="outlined"
                      className={customStyles.textFieldReadOnly}
                    />
                    <TextField
                      id="description"
                      label="Description"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      multiline
                      //rows={2}
                      //rowsMax={4}
                      //variant="outlined"
                    />

                    <Button type="submit" color="primary">
                      Add
                    </Button>
                    <Button onClick={handleCloseSales} color="primary">
                      Cancel
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>

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
                      error={errors.description && touched.description}
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
                      value="S"
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

        <Dialog
          open={openTracking}
          onClose={handleCloseTracking}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Add new Tracking</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tracking does not exists. Please, add it!
            </DialogContentText>
            <Formik
              initialValues={initialTrackingValues}
              onSubmit={(values, { resetForm }) => {
                handleNewTracking(values);
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
                      error={errors.description && touched.description}
                    />
                    <Button type="submit" color="primary">
                      Add
                    </Button>
                    <Button onClick={handleCloseTracking} color="primary">
                      Cancel
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>
        <Dialog
          //fullScreen={fullScreen}
          open={openDelete}
          onClose={handleClose}
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
              onClick={() => handleCloseDelete()}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDeleteDisplayTotal(true);
              }}
              color="primary"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>

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
        <Grid item lg={12} md={12} sm={12} xs={12}>
          <section className="container">
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <aside>
              <Table
                style={{ width: "400px" }}
                className={classes.table}
                size="small"
                aria-label="a dense table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>File(s) Attachment</TableCell>
                    <TableCell align="right">Delete Item</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((row) => (
                    <TableRow key={row.path}>
                      <TableCell component="th" scope="row">
                        <a
                          href={configData.FILES_URL + row.path}
                          target="_blank"
                          rel="noreferrer"
                          download={row.path}
                        >
                          {row.path}
                        </a>
                      </TableCell>
                      <TableCell align="right">
                        <DeleteForeverIcon
                          style={{ paddingTop: "0px" }}
                          onClick={() => removeAttachment(row, files)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </aside>
          </section>
        </Grid>
      </Grid>

      <Button
        id="submitButton"
        type="submit"
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        style={{ marginTop: "50px" }}
        //disabled="true"
      >
        Save
      </Button>
      {/* <Button
        type="button"
        color="primary"
        variant="contained"
        style={{ marginTop: "50px", marginLeft: "100px" }}
        onClick={
          () => changePreId
          //setOpenEdit(true);
          //setInvoiceCounter(invoiceCounter + 1);
          //const id = loadInvoice.id;
          //loadInvoice.id = loadInvoice.id + 1;

          //loadInvoice.id = id;
          //handlePrint();
        }
      >
        Print Invoice
      </Button> */}

      <Button
        type="button"
        color="primary"
        variant="contained"
        style={{ marginTop: "50px", marginLeft: "100px" }}
        onClick={() => changePreId()}
      >
        Print Invoice
      </Button>

      <div style={{ display: "none" }}>
        <ComponentToPrint
          ref={componentRef}
          id={loadInvoice !== null ? loadInvoice.id : 0}
          loadInfo={invoiceData}
          isLoading={isLoading}
        />
      </div>
    </form>
  ) : (
    "loading...."
  );
};
export default SalesInvoice;
