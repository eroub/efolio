import React from "react";
import { useFormik } from "formik";
import { calculatePipDifference } from "../../utils/tradeCalculations";
import {
  TextField,
  Typography,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const PipCalculator = () => {
  const { values, handleChange } = useFormik({
    initialValues: {
      num1: "",
      num2: "",
    },
    onSubmit: () => {},
  });

  const pipDifference =
    values.num1 && values.num2
      ? calculatePipDifference(Number(values.num1), Number(values.num2))
      : "Enter both numbers";

  return (
    <Container
      component={Paper}
      elevation={0}
      style={{
        marginTop: "20px",
        width: "300px",
      }}
    >
      <Accordion
        elevation={1}
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Pip Difference</Typography>
        </AccordionSummary>
        <AccordionDetails
          style={{ flexDirection: "column", paddingTop: "0px" }}
        >
          <TextField
            name="num1"
            label="First Number"
            type="number"
            variant="outlined"
            fullWidth
            margin="dense"
            onChange={handleChange}
            value={values.num1}
            size="small"
          />
          <TextField
            name="num2"
            label="Second Number"
            type="number"
            variant="outlined"
            fullWidth
            margin="dense"
            onChange={handleChange}
            value={values.num2}
            size="small"
          />
          <Typography
            variant="body1"
            gutterBottom
            align="center"
            style={{ marginTop: "5px" }}
          >
            PIP Difference: {pipDifference}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default PipCalculator;
