export const weekDayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const monthNames = [
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

/**
 * @param dateUnix Unix date in seconds
 * @param timezone Timezone shift from UTC in seconds
 * @returns Date String. Format: "Sunday 10, Jun"
 */
export const getDate = (dateUnix: number, timezone: number): string => {
  const date = new Date((dateUnix + timezone) * 1000);
  const weekDayName = weekDayNames[date.getUTCDay()];
  const monthName = monthNames[date.getUTCMonth()];
  return `${weekDayName} ${date.getUTCDate()}, ${monthName}`;
};

/**
 * @param timeUnix Unix date in seconds
 * @param timezone Timezone shift from UTC in seconds
 * @returns Time string. Format: "HH:MM AM/PM"
 */
export const getTime = (timeUnix: number, timezone: number): string => {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

/**
 * @param timeUnix Unix date in seconds
 * @param timezone Timezone shift from UTC in seconds
 * @returns Time string. Format: "HH AM/PM"
 */
export const getHours = (timeUnix: number, timezone: number): string => {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12} ${period}`;
};

/**
 * @param mps Meter per seconds
 * @returns Kilometer per hours
 */
export const mps_to_kmh = (mps: number): number => {
  return (mps * 3600) / 1000;
};

export interface AqiInfo {
  level: string;
  message: string;
}

export const aqiText: Record<number, AqiInfo> = {
  1: {
    level: "Good",
    message:
      "Air quality is considered satisfactory, and air pollution poses little or no risk.",
  },
  2: {
    level: "Fair",
    message:
      "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.",
  },
  3: {
    level: "Moderate",
    message:
      "Members of sensitive groups may experience health effects. The general public is not likely to be affected.",
  },
  4: {
    level: "Poor",
    message:
      "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.",
  },
  5: {
    level: "Very Poor",
    message:
      "Health warnings of emergency conditions. The entire population is more likely to be affected.",
  },
};

export const aqiColors: Record<number, { bg: string; text: string }> = {
  1: { bg: "#89e589", text: "#1f331f" },
  2: { bg: "#e5dd89", text: "#33311f" },
  3: { bg: "#e5c089", text: "#332b1f" },
  4: { bg: "#e58989", text: "#331f1f" },
  5: { bg: "#e589b7", text: "#331f29" },
};
