import React from "react";
import { TextField, Grid, Button, Typography } from "@mui/material";
import { FormikProps } from "formik";
// Format currency values
import { formatCurrency, formatPercentage } from "../../../utils/formatters";

interface Calculations {
  totalHrs: number | null;
  projPL: number | null;
  commission: number | null;
  percentChange: number | null;
  realRR: number | null;
  pips: number | null;
  maeRatio: number | null;
  mfeRatio: number | null;
}

interface FormSectionProps {
  formik: FormikProps<{
    datetimeOut: string;
    exitPrice: number;
    realPL: number;
    mfe: number;
    mae: number;
    screenshot: string;
    comment: string;
  }>;
  calc: Calculations;
}

export const FormSection: React.FC<FormSectionProps> = ({ formik, calc }) => {
  const { values, handleChange, handleSubmit } = formik;
  // Button validation
  const allValuesFilled = Object.values(values).every((v) => v !== "");

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={1}>
        {/* First Row */}
        <Grid item xs={6}>
          <TextField
            name="datetimeOut"
            label="Datetime Out"
            type="datetime-local"
            fullWidth
            onChange={handleChange}
            value={values.datetimeOut}
            size="small"
            margin="dense"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            name="screenshot"
            label="Screenshot URL"
            fullWidth
            onChange={handleChange}
            value={values.screenshot}
            size="small"
            margin="dense"
          />
        </Grid>

        {/* Second and Third Rows */}
        <Grid item xs={6}>
          <Grid container spacing={2}>
            {/* Second Row */}
            <Grid item xs={6}>
              <TextField
                name="exitPrice"
                label="Exit Price"
                fullWidth
                onChange={handleChange}
                value={values.exitPrice}
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="realPL"
                label="Real P/L"
                fullWidth
                onChange={handleChange}
                value={values.realPL}
                size="small"
                margin="dense"
              />
            </Grid>

            {/* Third Row */}
            <Grid item xs={6}>
              <TextField
                name="mfe"
                label="MFE"
                fullWidth
                onChange={handleChange}
                value={values.mfe}
                size="small"
                margin="dense"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="mae"
                label="MAE"
                fullWidth
                onChange={handleChange}
                value={values.mae}
                size="small"
                margin="dense"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Comment Field */}
        <Grid item xs={6}>
          <TextField
            name="comment"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            onChange={handleChange}
            value={values.comment}
            size="small"
            margin="dense"
          />
        </Grid>

        {/* Calculated Metrics and Close Button */}
        <Grid item xs={12}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography align="left" style={{ minWidth: "150px" }}>
                  % Δ: {formatPercentage(calc.percentChange) ?? "-"}
                </Typography>
                <Typography align="left" style={{ minWidth: "150px" }}>
                  &nbsp; | &nbsp;Real R:R: {calc.realRR ?? "-"}
                </Typography>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography align="left" style={{ minWidth: "150px" }}>
                  Proj. P/L: {formatCurrency(calc.projPL) ?? "-"}
                </Typography>
                <Typography align="left" style={{ minWidth: "150px" }}>
                  &nbsp; | &nbsp;Comm/Slip:{" "}
                  {formatCurrency(calc.commission) ?? "-"}
                </Typography>
              </div>
            </div>
            <Button
              style={{ marginTop: "10px" }}
              disabled={!allValuesFilled}
              type="submit"
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </div>
        </Grid>
      </Grid>
    </form>
  );
};
