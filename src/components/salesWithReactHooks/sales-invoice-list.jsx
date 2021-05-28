import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { lighten, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import PhonelinkEraseIcon from "@material-ui/icons/PhonelinkErase";
import EditIcon from "@material-ui/icons/Edit";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import {
  Grid,
  TextField,
  Button,
  createStyles,
  useMediaQuery,
  useTheme,
  withStyles,
} from "@material-ui/core";

import { format } from "date-fns";

import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControl from "@material-ui/core/FormControl";

import SalesInvoiceApp from "./sales-invoice-app";
import SalesInvoice from "./sales-invoice";
import SalesInvoiceDetailPayment from "./sales-invoice-detail-payment";
import configData from "../../config.json";
import PaymentIcon from "@material-ui/icons/Payment";
import SalesInvoicePayment from "../../components/sales/sales-invoice-payment";
import NumberFormat from "react-number-format";
import commaNumber from "comma-number";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "customer",
    label: "Customer",
    numeric: false,
    disablePadding: true,
  },
  {
    id: "invoiceNo",
    numeric: true,
    disablePadding: false,
    label: "Invoice No",
  },
  {
    id: "invoiceAmount",
    numeric: true,
    disablePadding: false,
    label: "Amount",
  },
  {
    id: "unPaidBalance",
    numeric: true,
    disablePadding: false,
    label: "Unpaid Balance",
  },
  {
    id: "invoiceDate",
    numeric: true,
    disablePadding: false,
    label: "Invoice Date",
  },
  {
    id: "void",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "edit",
    numeric: true,
    disablePadding: false,
    label: "",
  },
  {
    id: "delete",
    numeric: true,
    disablePadding: false,
    label: "",
  },
  {
    id: "voidIcon",
    numeric: true,
    disablePadding: false,
    label: "",
  },
  {
    id: "paymentIcon",
    numeric: true,
    disablePadding: false,
    label: "",
  },
  {
    id: "cancelPaymentIcon",
    numeric: true,
    disablePadding: false,
    label: "",
  },
];

function EnhancedTableHead(props) {
  const {
    classes,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead style={{ background: "#DFE7F6", color: "#189AB4" }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "default"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === "light"
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: "1 1 100%",
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected } = props;

  return null;
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    padding: theme.spacing(0),
    textAlign: "left",
    color: theme.palette.text.secondary,
    width: "100%",
    margin: "auto",
  },
  paper2: {
    padding: theme.spacing(0),
    textAlign: "left",
    color: theme.palette.text.secondary,
    width: "38%",
    marginRight: "371px",
    padding: "0px 0px 0px 0px",
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
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("customer");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [rows, setRows] = useState([]);
  const [listCounter, setListCounter] = useState(0);
  const [customerListCounter, setCustomerListCounter] = useState(0);
  const [invoiceListCounter, setInvoiceListCounter] = useState(0);
  const invoiceId = useRef(0);
  const customerName = useRef("");
  const customerId = useRef();
  const ledgerMasterId = useRef();

  const [openAdd, setAdd] = useState(false);
  const [openEdit, setEdit] = useState(false);

  const setOpenEdit = (isEdit) => {
    setEdit(isEdit);
    setListCounter(listCounter + 1);
  };

  const handleAddClose = () => {
    setListCounter(listCounter + 1);
    setAdd(false);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const handleEdit = (id) => {
    invoiceId.current = id;
    setOpenEdit(true);
  };

  const [searchValue, setSearchValue] = React.useState("customer");
  const [searchText, setSearchText] = React.useState("");

  const handleChangeSearchValue = (event) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = () => {
    setSearchText(document.getElementById("searchBox").value);
    if (selectedValue === "customer") {
      setCustomerListCounter(customerListCounter + 1);
    } else {
      setInvoiceListCounter(invoiceListCounter + 1);
    }
  };

  const handleDelete = (id) => {
    invoiceId.current = id;
    setOpenDelete(true);
  };

  const [openDelete, setOpenDelete] = useState(false);

  const handleDeleteInvoice = () => {
    fetch(
      configData.SERVER_URL +
        "sales/DeleteSalesInvoice?id=" +
        invoiceId.current,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        setListCounter(listCounter + 1);
      })
      .catch(function (error) {
        console.log("network error");
      });
  };

  const handleVoid = (id) => {
    invoiceId.current = id;
    setOpenVoid(true);
  };

  const handleInvoicePayment = (custId, customer, id) => {
    customerId.current = custId;
    customerName.current = customer;
    ledgerMasterId.current = id;
    setOpenInvoicePayment(true);
  };

  const handleInvoicePaymentDetail = (custId, customer, id) => {
    customerId.current = custId;
    customerName.current = customer;
    ledgerMasterId.current = id;
    setOpenInvoicePaymentDetail(true);
  };

  const [openVoid, setOpenVoid] = useState(false);
  const [openInvoicePayment, setOpenInvoicePayment] = useState(false);
  const [openInvoicePaymentDetail, setOpenInvoicePaymentDetail] = useState(false);

  const [selectedValue, setSelectedValue] = React.useState("customer");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleVoidInvoice = () => {
    fetch(
      configData.SERVER_URL + "sales/VoidSalesInvoice?id=" + invoiceId.current,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        setListCounter(listCounter + 1);
      })
      .catch(function (error) {
        console.log("network error");
      });
  };

  useEffect(() => {
    fetch(configData.SERVER_URL + "sales/GetAllAccounts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((results) => results.json())
      .then((data) => {
        console.log(data);
        setRows(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [listCounter]);

  useEffect(() => {
    if (selectedValue !== "customer" || searchText === "") return setRows([]);
    fetch(
      configData.SERVER_URL +
        "sales/GetAllAccountsByCustomerName?customerName=" +
        searchText,
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
        setRows(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [customerListCounter, searchText, searchValue, selectedValue]);

  useEffect(() => {
    if (selectedValue !== "invoiceNo" || searchText === "") return setRows([]);
    fetch(
      configData.SERVER_URL +
        "sales/GetAllAccountsByInvoiceNo?invoiceNo=" +
        searchText,
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
        setRows(data);
      })
      .catch(function (error) {
        console.log("network error");
      });
  }, [invoiceListCounter, searchText, selectedValue]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const [selectedRadioValue, setSelectedRadioValue] = React.useState(
    "customer"
  );

  const handleRadioChange = (event) => {
    setSelectedRadioValue(event.target.value);
  };

  return (
    <Grid
      container
      //direction="row"
      //justify="flex-end"
      //alignItems="center"
      //alignContent="flex-end"
      spacing={0}
      style={{ width: "60%" }}
    >
      <Grid item xs={12} sm={12} md={2} align="center">
        <Button
          variant="contained"
          color="primary"
          style={{ height: "39px" }}
          onClick={() => {
            setAdd(true);
          }}
          fullWidth
        >
          New Invoice
        </Button>
      </Grid>
      <Grid item xs={12} sm={2} md={2} align="center">
        <Radio
          checked={selectedValue === "customer"}
          onChange={handleChange}
          value="customer"
          name="radio-button-demo"
          inputProps={{ "aria-label": "customer" }}
        />{" "}
        Customer
      </Grid>
      <Grid item xs={12} sm={2} md={2} align="center">
        <Radio
          checked={selectedValue === "invoiceNo"}
          onChange={handleChange}
          value="invoiceNo"
          name="radio-button-demo"
          inputProps={{ "aria-label": "invoiceNo" }}
        />{" "}
        Invoice No.
      </Grid>
      <Grid item xs={12} sm={4} md={2} align="center">
        <TextField
          label="Search"
          id="searchBox"
          name="searchBox"
          defaultValue=""
          variant="outlined"
          size="small"
          //style={{ width: "100%", marginLeft: "90px" }}
          //onBlur={handleSearch}
        />
      </Grid>
      <Grid item xs={12} sm={2} md={2} align="center">
        <Button
          variant="contained"
          color="primary"
          style={{ height: "39px" }}
          onClick={() => handleSearch()}
          fullWidth
        >
          Go
        </Button>
      </Grid>
      <Grid item xs={12} sm={2} md={2} align="center">
        <Button
          variant="contained"
          color="primary"
          style={{ height: "39px" }}
          onClick={() => setListCounter(listCounter + 1)}
          fullWidth
        >
          Reset
        </Button>
      </Grid>
      <Paper className={classes.paper} style={{paddingTop: "10px"}}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <StyledTableRow key={row.id}>
                      <StyledTableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                        style={{ wordBreak: "break-word" }}
                      >
                        {" "}
                        {row.customer}
                      </StyledTableCell>
                      <StyledTableCell align="right">{row.invoiceNo}</StyledTableCell>
                      <StyledTableCell align="right">
                        {commaNumber(row.invoiceAmount).toString()}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {commaNumber(row.unPaidBalance).toString()}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {format(new Date(row.invoiceDate), "MM/dd/yyyy")}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {row.void === true ? "Void" : ""}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        {" "}
                        <EditIcon
                          color="primary"
                          onClick={() => handleEdit(row.id)}
                        />{" "}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <DeleteForeverIcon
                          color="secondary"
                          onClick={() => handleDelete(row.id)}
                        />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <PhonelinkEraseIcon
                          color="secondary"
                          onClick={() => handleVoid(row.id)}
                        />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <PaymentIcon
                          color="primary"
                          onClick={() =>
                            handleInvoicePayment(
                              row.customerId,
                              row.customer,
                              row.id
                            )
                          }
                        />
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <DeleteSweepIcon
                          color="primary"
                          onClick={() =>
                            handleInvoicePaymentDetail(
                              row.customerId,
                              row.customer,
                              row.id
                            )
                          }
                        />
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>

      <div>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth={"xl"}
          open={openEdit}
          onClose={handleEditClose}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Edit Sales Invoice</DialogTitle>
          <DialogContent>
            <div
              style={{
                overflowX: "hidden",
                overflowY: "hidden",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                style={{
                  paddingRight: "17px",
                  height: "100%",
                  width: "100%",
                  boxSizing: "content-box",
                  //overflow: "scroll",
                }}
              >
                <DialogContentText></DialogContentText>
                <SalesInvoiceApp id={invoiceId} setOpenEdit={setOpenEdit} />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              type="button"
              variant="contained"
              autoFocus
              onClick={() => {
                setListCounter(listCounter + 1);
                setOpenEdit(false);
              }}
              color="primary"
            >
              Close123
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          //fullScreen={fullScreen}
          //fullScreen
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth={"xl"}
          open={openAdd}
          onClose={() => handleAddClose()}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Create Invoice</DialogTitle>
          <DialogContent>
            <div
              style={{
                overflowX: "hidden",
                overflowY: "hidden",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                style={{
                  paddingRight: "17px",
                  height: "100%",
                  width: "100%",
                  boxSizing: "content-box",
                  //overflow: "scroll",
                }}
              >
                <DialogContentText></DialogContentText>
                <SalesInvoice preloadedValues={null} />
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              type="button"
              variant="contained"
              autoFocus
              onClick={() => handleAddClose()}
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openDelete}
          onClose={() => setOpenDelete(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            DELETE CONFIRMATION
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this permanently?
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
                handleDeleteInvoice();
                setOpenDelete(false);
              }}
              color="primary"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openVoid}
          onClose={() => setOpenVoid(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            VOID CONFIRMATION
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to void this invoice?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              autoFocus
              onClick={() => setOpenVoid(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleVoidInvoice();
                setOpenVoid(false);
              }}
              color="primary"
              autoFocus
            >
              Void
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          //fullScreen
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth={"md"}
          fullWidth
          open={openInvoicePayment}
          onClose={() => setOpenInvoicePayment(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">
            Invoice Payment
          </DialogTitle>
          <DialogContent>
            <div
              style={{
                overflowX: "hidden",
                overflowY: "hidden",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                style={{
                  paddingRight: "17px",
                  height: "100%",
                  width: "100%",
                  boxSizing: "content-box",
                  //overflow: "scroll",
                  overflow: "visible",
                }}
              >
                <DialogContentText></DialogContentText>
                <SalesInvoicePayment
                  customerName={customerName.current}
                  customerId={customerId.current}
                  ledgerMasterId={ledgerMasterId.current}
                  parentMethod={() => {
                    setListCounter(listCounter + 1);
                    setOpenInvoicePayment(false);
                  }}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>

        <Dialog
          //fullScreen
          disableBackdropClick
          disableEscapeKeyDown
          style={{width: "100%"}}
          maxWidth={"md"}
          //fullWidth
          open={openInvoicePaymentDetail}
          onClose={() => setOpenInvoicePaymentDetail(false)}
          aria-labelledby="responsive-dialog-title"
        >
          <DialogTitle id="responsive-dialog-title">Cancel Payment</DialogTitle>
          <DialogContent>
            <div
              style={{
                overflowX: "hidden",
                overflowY: "hidden",
                height: "100%",
                width: "100%",
              }}
            >
              <div
                style={{
                  paddingRight: "17px",
                  height: "100%",
                  width: "100%",
                  boxSizing: "content-box",
                  //overflow: "scroll",
                  overflow: "visible",
                }}
              >
                <DialogContentText></DialogContentText>
                <SalesInvoiceDetailPayment
                  customerName={customerName.current}
                  customerId={customerId.current}
                  ledgerMasterId={ledgerMasterId.current}
                  parentMethod={() => {
                    setListCounter(listCounter + 1);
                    setOpenInvoicePaymentDetail(false);
                  }}
                />
              </div>
            </div>
          </DialogContent>
          <DialogActions></DialogActions>
        </Dialog>
      </div>
    </Grid>
  );
}
