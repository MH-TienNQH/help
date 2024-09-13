import moment from "moment-timezone";

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function convertUtcToVietnamTime(utcDate) {
  return moment(utcDate).tz(VIETNAM_TIME_ZONE);
}

export function formatVietnamTime(date) {
  const vietnamTime = convertUtcToVietnamTime(date);
  return vietnamTime.format("YYYY-MM-DD HH:mm:ss");
}

export function convertVietnamTimeToUtc(localDate) {
  return moment.tz(localDate, VIETNAM_TIME_ZONE).utc().toDate();
}
