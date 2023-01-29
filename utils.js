import chalk from "chalk";
import moment from "moment";
function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}
function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;
  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
    seconds
  )}`;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const log = (msg) => {
  console.log(
    `[ ${moment().format("MM.DD.YYYY")} | ${chalk.greenBright(
      moment().format("HH:mm:SS")
    )} ] --- ${msg}`
  );
};

export { convertMsToTime, sleep, log };
