import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  makeStyles,
  createStyles,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
//import { Formik, Form, ErrorMessage, FieldArray, Field } from "formik";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
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
import { datePickerDefaultProps } from "@material-ui/pickers/constants/prop-types";

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
      },
    },
    textField2: {
      width: "100%",
      zIndex: "0",
    },
    textFieldReadOnly: {
      "& > *": {
        width: "100%",
        zIndex: "-999",
      },
    },
    reactSelect: {
      paddingTop: "8px",
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
    },
  })
);

const validationSchema = Yup.object().shape({
  //billingAddress: Yup.string().required("Enter Billing Address."),
  //invoiceNo: Yup.string().required("Enter Invoice No."),
  //customer: Yup.object().nullable().required("Enter Customer"),
  items: Yup.array().of(
    Yup.object().shape({
      salesItem: Yup.object().nullable().required("Sales Item is required"),
      description: Yup.string().required("Enter Description"),
      taxRateItem: Yup.object().nullable().required("Tax Rate is required"),
      trackingItem: Yup.object().nullable().required("Tracking is required"),
      qty: Yup.string().nullable().required("Quantity is required"),
      unitPrice: Yup.string().nullable().required("Unit Price is required"),
    })
  ),
});

const initialValues = {
  items: [
    {
      id: -1,
      salesItem: null,
      description: null,
      qty: null,
      unitPrice: null,
      taxRateItem: null,
      trackingItem: null,
    },
  ],
};

export const SalesInvoiceItem = () => {
  const classes = useStyles();

  const {
    register,
    handleSubmit,
    errors,
    control,
    touched,
    setValue,
    watch,
  } = useForm({
    //mode: "onChange",
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

const [salesItems, getSalesItems] = useState([
  {
    Id: 0,
    name: "",
  },
]);

const [taxRates, getTaxRates] = useState([
  {
    Id: 0,
    name: "",
    rate: 0,
  },
]);

var [totalTaxes, setTotalTaxes] = useState();

const [trackings, getTrackings] = useState([
  {
    Id: 0,
    name: "",
  },
]);

  //const { register } = useFormContext();

  //const l = useWatch({ control: control, name: `items[${index}].qty` });

  const [openDelete, setOpenDelete] = useState(false);

  const [deleteItem, setDeleteItem] = useState({ id: 0 });

  var [subTotal, setSubTotal] = useState(0);
  var [totalTaxes, setTotalTaxes] = useState();
  var [totalAmount, setTotalAmount] = useState(0);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 40,
      minHeight: 40,
    }),
  };

  //console.log(`render ${item.name}`);
  const handleChangeAmount = (values, value, name) => {
    return;
    var subTotal = 0;
    var totalTaxes = 0;
    var totalAmount = 0;
    var rate = 0;
    // eslint-disable-next-line array-callback-return
    fields.map((item, index) => {
      if (name !== undefined) {
        if (name.indexOf(index) !== -1) {
          item.taxRateItem = value;
        }
      }
      rate =
        item.taxRateItem !== null
          ? taxRates.find((x) => x.value === item.taxRateItem.value)
          : null;
      var taxRate = item.taxRateItem === null ? 0 : rate.rate / 100;
      subTotal = subTotal + item.qty * item.unitPrice;
      totalTaxes = totalTaxes + subTotal * taxRate;
      totalAmount = totalAmount + subTotal + totalTaxes;
    });
    setSubTotal(Number(subTotal));
    setTotalTaxes(totalTaxes);
    setTotalAmount(Number(subTotal) + totalTaxes);
  };
  const handleChange = (e, field) => {
    setValue(field, e, { shouldValidate: true }, { shouldDirty: true });
  };

   

  //const o = watch("items");

  const handleChangeSubTotal = (e, field) => {
    //watch("fieldArray" , fields);
    //watch("items");
    setValue(field, e, { shouldValidate: true }, { shouldDirty: true });
    handleChangeAmount(fields);
    //append({});
  };

  const { fields, append, prepend, remove, swap, move, insert } = useFieldArray(
    {
      control,
      name: "items",
    }
  );

  const [counterSales, setCounterSales] = useState(0);
  const [counterTax, setCounterTax] = useState(0);
  const [counterTracking, setCounterTracking] = useState(0);

  const addRow = () => {
    //setIndexes((prevIndexes) => [...prevIndexes, counterArray]);
    //setCounter((prevCounter) => prevCounter + 1);
    //setItemCount(itemCount - 1);
    append({});
  };

return (
  fields.map((r, index) => {
    return (
      <>
        <div key={index}>
          <Grid container justify="space-around" direction="row">
            <Grid item xs={2}>
              <Controller
                control={control}
                name={`items[${index}].salesItem`}
                render={(
                  { onChange, onBlur, value, name, ref },
                  { invalid, isTouched, isDirty }
                ) => (
                  <CreatableSelect
                    onBlur={onBlur}
                    onChange={(e) =>
                      handleChange(e, `items[${index}].salesItem`)
                    }
                    inputRef={ref}
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
                as={TextField}
                name={`items[${index}].description`}
                control={control}
                label="Description"
                className={classes.textField2}
                margin="dense"
                defaultValue=""
                variant="outlined"
                size="small"
                //required={true}
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
                    onBlur={onBlur}
                    variant="outlined"
                    onChange={(e) =>
                      handleChangeSubTotal(
                        e.target.value,
                        `items[${index}].qty`,
                        index
                      )
                    }
                    //ref={register({})}
                    placeholder="Quantity"
                    className={classes.textField}
                    styles={customStyles}
                    type="Number"
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
                    onBlur={onBlur}
                    variant="outlined"
                    onChange={(e) =>
                      handleChangeSubTotal(
                        e.target.value,
                        `items[${index}].unitPrice`,
                        index
                      )
                    }
                    placeholder="Unit Price"
                    className={classes.textField}
                    //styles={customStyles}
                    type="Number"
                    //ref={register({})}
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
                    onBlur={onBlur}
                    onChange={(e) =>
                      handleChangeSubTotal(
                        e,
                        `items[${index}].taxRateItem`,
                        index
                      )
                    }
                    inputRef={ref}
                    options={taxRates}
                    className={classes.reactSelect}
                    placeholder="Please select Tax Rates"
                    styles={customStyles}
                    //ref={register({})}
                  />
                )}
              />
              <p className={classes.p}>
                {errors?.["items"]?.[index]?.["taxRateItem"]?.["message"]}
              </p>
            </Grid>
            <Grid item xs={1}>
              <Controller
                as={TextField}
                name={`items[${index}].amount`}
                control={control}
                //defaultValue="5"
                className={classes.textFieldReadOnly}
                InputProps={{
                  readOnly: true,
                }}
                margin="dense"
                label="Sub Total"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={1}>
              <Controller
                control={control}
                name={`items[${index}].trackingItem`}
                render={(
                  { onChange, onBlur, value, name, ref },
                  { invalid, isTouched, isDirty }
                ) => (
                  <CreatableSelect
                    onBlur={onBlur}
                    onChange={(e) =>
                      handleChange(e, `items[${index}].trackingItem`)
                    }
                    inputRef={ref}
                    options={trackings}
                    className={classes.reactSelect}
                    placeholder="Please select Tracking"
                    styles={customStyles}
                  />
                )}
              />
              <p className={classes.p}>
                {errors?.["items"]?.[index]?.["trackingItem"]?.["message"]}
              </p>
            </Grid>
            <Grid item xs={1}>
              <Button
                variant="contained"
                color="secondary"
                className={classes.deleteButton}
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setOpenDelete(true);
                  //setDeleteItemId(index);
                }}
              >
                Delete
              </Button>
            </Grid>
          </Grid>

          <Grid container justify="space-around" direction="row">
            <Grid item xs={9}>
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={() => addRow()}
              >
                Add New Row
              </Button>
            </Grid>
            
          </Grid>
        </div>
      </>
    )})


)};

export default SalesInvoiceItem;
