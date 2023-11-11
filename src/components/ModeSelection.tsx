import React from "react";
import {
  InputBase,
  styled,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";

const ModeSelectionInput = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(2),
  },
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    border: "1px solid #ced4da",
    fontSize: 16,
    padding: "2px 10px 2px 10px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    },
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center", // Ensures text is centered
    fontWeight: "bold",
  },
  "& .MuiSvgIcon-root": {
    display: "none",
  },
}));

interface ModeSelectionProps {
  comparisonMode: string;
  handleComparisonModeChange: (event: SelectChangeEvent<string>) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({
  comparisonMode,
  handleComparisonModeChange,
}) => {
  // You can also remove inputWidth state and useEffect if you're not using dynamic width
  return (
    <FormControl variant="standard" style={{ width: "fit-content" }}>
      <Select
        value={comparisonMode}
        onChange={handleComparisonModeChange}
        input={<ModeSelectionInput />}
        displayEmpty
        inputProps={{ "aria-label": "Without label" }}
        IconComponent={() => null} // Hides the dropdown arrow
      >
        <MenuItem value="$">$</MenuItem>
        <MenuItem value="R:R">R</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ModeSelection;
