// dates.ts
import { utcToZonedTime, format } from "date-fns-tz";
const timeZone = "America/Edmonton";

// Init Datetime Object to current date
export const dateInit = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// Take datetime object and convert it to a different timezone
export const convertToTimeZone = (input: string, timeZone: string) => {
  const zonedDate = utcToZonedTime(input, timeZone);
  const formattedDate = format(zonedDate, "yyyy-MM-dd HH:mm:ss", {
    timeZone,
  });
  return formattedDate;
};

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

// Custom human readable date formatting (ex. Set 18th, '23 11:34)
export const humanReadFormatDate = (dateString: string | null) => {
  if (dateString === null) {
    return null;
  }
  const date = new Date(dateString);
  const year = date.getFullYear().toString().substr(-2); // get last 2 digits of year
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
  const month = monthNames[date.getMonth()]; // get short month name
  const day = date.getDate();
  // Add appropriate ordinal suffix to the day
  const ordinal =
    ["st", "nd", "rd"][((((day + 90) % 100) - 10) % 10) - 1] || "th";
  const hours = date.getHours();
  // Add an extra 0 in minutes if necessary
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month} ${day}${ordinal}, '${year} ${hours}:${minutes}`;
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

// Convert date string to MST
export const convertToMST = (input: string) => {
  // Convert the UTC time to Edmonton's local time
  const zonedDate = utcToZonedTime(input, timeZone);
  // Format it to MySQL datetime format
  const edmontonDateTime = format(zonedDate, "yyyy-MM-dd HH:mm:ss", {
    timeZone,
  });
  return edmontonDateTime;
};
