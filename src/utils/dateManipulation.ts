// dateManipulation.ts

// Take datetime object and convert it to yyyy-mm-dd hh:mm
export const simplifyDate = (datetime: string | null) => {
  if (datetime === null) {
    return ""; // or any placeholder you prefer
  }
  const date = new Date(datetime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are zero-based
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Convert date string to standard date time object
export const convertToStandardDateTime = (input: string) => {
  const date = new Date(input);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
