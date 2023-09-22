// dateManipulation.ts

// Take datetime object and convert it to yyyy-mm-dd hh:mm
export const simplifyDate = (datetime: string | null) => {
  if (datetime === null) {
    return null;
  }
  const date = new Date(datetime);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // Months are zero-based
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Custom human readable date formatting (ex. Set 18, '23 11:34)
export const humanReadFormatDate = (dateString: string | null) => {
  if (dateString === null) {
    return null;
  }
  const date = new Date(dateString);
  const year = date.getUTCFullYear().toString().substr(-2); // get last 2 digits of year
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getUTCMonth()]; // get short month name
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  return `${month} ${day}, '${year} ${hours}:${minutes}`;
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
