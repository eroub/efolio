import React, { useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputWidth, setInputWidth] = useState("2em");

  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(`${inputRef.current.scrollWidth}px`);
    }
  }, [comparisonMode]);

  return (
    <FormControl variant="standard">
      <Select
        value={comparisonMode}
        onChange={handleComparisonModeChange}
        input={
          <ModeSelectionInput ref={inputRef} style={{ width: inputWidth }} />
        }
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
