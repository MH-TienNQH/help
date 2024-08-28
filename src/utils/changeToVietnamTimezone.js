import { utcToZonedTime, zonedTimeToUtc, format } from "date-fns-tz";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
export function convertUtcToVietnamTime(utcDate) {
  return utcToZonedTime(utcDate, VIETNAM_TIME_ZONE);
}

export function formatVietnamTime(date) {
  const vietnamTime = convertUtcToVietnamTime(date);
  return format(vietnamTime, "yyyy-MM-dd HH:mm:ssXXX", {
    timeZone: VIETNAM_TIME_ZONE,
  });
}

export function convertVietnamTimeToUtc(localDate) {
  return zonedTimeToUtc(localDate, VIETNAM_TIME_ZONE);
}
