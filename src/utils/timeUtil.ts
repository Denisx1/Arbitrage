import { formatInTimeZone } from "date-fns-tz";
import { Time } from "../config/types";

export function convertTimestampToUTC(timestamp: Time): string {
  if (!timestamp || isNaN(Number(timestamp))) {
    return "Invalid Timestamp";
  }
  return formatInTimeZone(timestamp, "UTC", "HH:mm:ss.SSS");
}
