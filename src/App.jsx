
import React from "react";
import { makeStyles, createStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import { Menu, MenuItem, useMediaQuery } from "@material-ui/core";
import { withRouter } from "react-router-dom";
import Login from "../src/components/authentications/login";
import Register from "../src/components/authentications/register";
import ForgotPassword from "./components/authentications/forgot-password";
import { Route, Switch } from "react-router-dom";
import StorageService from "../src/services/storage.service";
import store from "./store";
import Logout from "./components/authentications/logout";
import ChartOfAccounts from "./components/libraries/chart-of-account";
import SubsidiaryLedgerAccounts from "./components/libraries/subsidiary-ledger-account";
//import SalesInvoice from "./components/sales/sales-invoice.jsx";
//import MaterialUIPickers from "./components/sales/test.jsx.bak"
import SalesInvoiceList from "./components/sales/sales-invoice-list";
//import SalesInvoiceApp from "./components/sales/sales-invoice-app";
import FunctionalComponentWithHook from "./components/sales/test.tsx";
import PurchaseList from "./components/purchases/purchase-list";
import InventoryList from "./components/libraries/inventory-list";

  
const storageService = new StorageService();

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      paddingBottom: "10px",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  })
);

const App = (props) => {
  const { history } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClick = (pageURL) => {
    history.push(pageURL);
    setAnchorEl(null);
  };

  const handleButtonClick = (pageURL) => {
    history.push(pageURL);
  };

  var menuItems = [
    {
      key: 0,
      menuTitle: "Chart of Accounts",
      pageURL: "/chart-of-accounts",
    },
    {
      key: 1,
      menuTitle: "Subsidiary Ledger Account Names",
      pageURL: "/subsidiary-ledger-accounts",
    },
    {
      key: 2,
      menuTitle: "Inventory",
      pageURL: "/inventory-list",
    },
    {
      key: 3,
      menuTitle: "Sales Invoices",
      pageURL: "/sales-invoice",
    },
    {
      key: 4,
      menuTitle: "Purchases",
      pageURL: "/purchase-list",
    },
    {
      key: 5,
      menuTitle: "Test",
      pageURL: "/test",
    },
    {
      key: 6,
      menuTitle: "Logout",
      pageURL: "/logout",
    },
  ];

  const menuItemsLogin = [
    {
      key: 0,
      menuTitle: "Login",
      pageURL: "/login",
    },
    {
      key: 1,
      menuTitle: "Register",
      pageURL: "/register",
    },
  ];

  return (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <div className={classes.root}>
            <AppBar
              position="static"
              style={{ background: "#F0544F", color: "white" }}
            >
              <Toolbar>
                {isMobile ? (
                  <>
                    <IconButton
                      edge="start"
                      className={classes.menuButton}
                      color="inherit"
                      aria-label="menu"
                      onClick={handleMenu}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                      THE DAILY PLANET
                    </Typography>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      open={open}
                      onClose={() => setAnchorEl(null)}
                    >
                      {storageService.secureStorage.getItem("isLogin") ===
                        true ||
                      store.getState().accountReducer.isLogin === true ? (
                        <>
                          {menuItems.map((menuItem, index) => {
                            const { menuTitle, pageURL } = menuItem;
                            return (
                              <MenuItem
                                key={index}
                                onClick={() => handleMenuClick(pageURL)}
                              >
                                {menuTitle}
                              </MenuItem>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          {menuItemsLogin.map((menuItem, index) => {
                            const { menuTitle, pageURL } = menuItem;
                            return (
                              <MenuItem
                                key={index}
                                onClick={() => handleMenuClick(pageURL)}
                              >
                                {menuTitle}
                              </MenuItem>
                            );
                          })}
                        </>
                      )}
                    </Menu>
                  </>
                ) : (
                  <>
                    {console.log(
                      storageService.secureStorage.getItem("isLogin")
                    )}
                    {storageService.secureStorage.getItem("isLogin") === true ||
                    store.getState().accountReducer.isLogin === true ? (
                      <>
                        <Typography variant="h6" className={classes.title}>
                          THE DAILY PLANET
                        </Typography>
                        <Button
                          color="inherit"
                          onClick={() =>
                            handleButtonClick("/chart-of-accounts")
                          }
                        >
                          Chart of Accounts
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() =>
                            handleButtonClick("/subsidiary-ledger-accounts")
                          }
                        >
                          Subsidiary Ledger Account Names
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/inventory-list")}
                        >
                          Inventory
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/sales-invoice")}
                        >
                          Sales Invoice
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/purchase-list")}
                        >
                          Purchases
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/logout")}
                        >
                          Logout
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/test")}
                        >
                          Test
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/login")}
                        >
                          Login
                        </Button>
                        <Button
                          color="inherit"
                          onClick={() => handleButtonClick("/register")}
                        >
                          Register
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Toolbar>
            </AppBar>
          </div>
        </Grid>
      </Grid>
      <Switch>
        <Route exact from="/login" render={(props) => <Login {...props} />} />
        <Route
          exact
          path="/register"
          render={(props) => <Register {...props} />}
        />
        <Route
          exact
          path="/forgot-password"
          render={(props) => <ForgotPassword {...props} />}
        />
        <Route exact path="/logout" render={(props) => <Logout {...props} />} />
        <Route
          exact
          path="/chart-of-accounts"
          render={(props) => <ChartOfAccounts {...props} />}
        />
        <Route
          exact
          path="/subsidiary-ledger-accounts"
          render={(props) => <SubsidiaryLedgerAccounts {...props} />}
        />
        <Route
          exact
          path="/inventory-list"
          render={(props) => <InventoryList {...props} />}
        />
        <Route
          exact
          path="/sales-invoice"
          render={(props) => <SalesInvoiceList {...props} />}
        />
        <Route
          exact
          path="/purchase-list"
          render={(props) => <PurchaseList {...props} />}
        />
        <Route
          exact
          path="/test"
          render={(props) => <FunctionalComponentWithHook {...props} />}
        />
      </Switch>
    </>
  );
};

export default withRouter(App);
