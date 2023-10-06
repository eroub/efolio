import React from "react";
import { TextField, Grid, Button, Typography } from "@mui/material";
import { FormikProps } from "formik";
// Format currency values
import { formatCurrency, formatPercentage } from "../../utils/formatters";

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

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        {/* Column 1 */}
        <Grid item xs={3}>
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
          <TextField
            name="exitPrice"
            label="Exit Price"
            fullWidth
            onChange={handleChange}
            value={values.exitPrice}
            size="small"
            margin="dense"
          />
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

        {/* Column 2 */}
        <Grid item xs={3}>
          <Typography>Total Hrs: {calc.totalHrs ?? "-"}</Typography>
          <Typography>Pips: {calc.pips ?? "-"}</Typography>
          <Typography>
            Percent Change: {formatPercentage(calc.percentChange) ?? "-"}
          </Typography>
          <Typography>Real R:R: {calc.realRR ?? "-"}</Typography>
          <Typography>
            Projected P/L: {formatCurrency(calc.projPL) ?? "-"}
          </Typography>
          <Typography>
            Commission: {formatCurrency(calc.commission) ?? "-"}
          </Typography>
        </Grid>

        {/* Column 3 */}
        <Grid item xs={3}>
          <TextField
            name="mfe"
            label="MFE"
            fullWidth
            onChange={handleChange}
            value={values.mfe}
            size="small"
            margin="dense"
          />
          <Typography>MFE Ratio: {calc.mfeRatio ?? "-"}</Typography>
          <TextField
            name="mae"
            label="MAE"
            fullWidth
            onChange={handleChange}
            value={values.mae}
            size="small"
            margin="dense"
          />
          <Typography>MAE Ratio: {calc.maeRatio ?? "-"}</Typography>
        </Grid>

        {/* Column 4 */}
        <Grid item xs={3}>
          <TextField
            name="screenshot"
            label="Screenshot URL"
            fullWidth
            onChange={handleChange}
            value={values.screenshot}
            size="small"
            margin="dense"
          />
          <TextField
            name="comment"
            label="Comment"
            fullWidth
            onChange={handleChange}
            value={values.comment}
            size="small"
            margin="dense"
          />
          <Button type="submit" variant="contained" color="primary">
            Complete Trade
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
