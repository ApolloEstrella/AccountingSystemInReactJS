import React, { useState } from "react";
import {
  Grid,
  TextField,
  Button,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { Formik, Form} from "formik";
import * as Yup from "yup";
import { useHistory} from "react-router-dom";

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      maxWidth: "450px",
      display: "block",
      margin: "0 auto",
    },
    textField: {
      "& > *": {
        width: "100%",
      },
    },
    submitButton: {
      marginTop: "24px",
    },
    button: {
      marginRight: "20px",
    },
    title: { textAlign: "center" },
    successMessage: { color: "green" },
    errorMessage: { color: "red" },
  })
);

 

const ForgotPassword = () => {
  const classes = useStyles();
  const history = useHistory();

  const handleButtonClick = (pageURL) => {
    history.push(pageURL);
  };

  const createNewUser = async (data, resetForm) => {
    try {
      // API call integration will be here. Handle success / error response accordingly.
      if (data) {
        resetForm({});
      }
    } catch (error) {
      const response = error.response;
      if (response.data === "user already exist" && response.status === 400) {
      } else {
      }
    } finally {
    }
  };

  return (
    <div className={classes.root}>
      <Formik
        initialValues={{
          user: {
            email: "",
          },
        }}
        onSubmit={(values, actions) => {
          createNewUser(values, actions.resetForm);
          setTimeout(() => {
            actions.setSubmitting(false);
          }, 500);
        }}
        validationSchema={Yup.object().shape({
          user: Yup.object().shape({
            email: Yup.string().email().required("Email is required!"),
          }),
        })}
      >
        {(props) => {
          const {
            values,
            touched,
            errors,
            handleBlur,
            handleChange,
            isSubmitting,
          } = props;
          return (
            <Form>
              <h1 className={classes.title}>Forgot Password</h1>
              <Grid container justify="space-around" direction="row">
                <Grid
                  item
                  lg={10}
                  md={10}
                  sm={10}
                  xs={10}
                  className={classes.textField}
                >
                  <TextField
                    name="user.email"
                    id="user.email"
                    label="Email-id"
                    value={values.user.email}
                    type="email"
                    helperText={
                      errors.user?.email && touched.user?.email
                        ? errors.user?.email
                        : "Enter email-id"
                    }
                    error={
                      errors.user?.email && touched.user?.email ? true : false
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid
                  item
                  lg={10}
                  md={10}
                  sm={10}
                  xs={10}
                  className={classes.submitButton}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={isSubmitting}
                    onClick={() => handleButtonClick("/")}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default ForgotPassword;
