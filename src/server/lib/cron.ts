import cron from "node-cron";
import { prepareStudents, stageDaily } from "./quickFunctions.js";


export const initCronJobs = () => {
    cron.schedule("0 6 * * 1", () => {
        console.log("Running weekly Prepare Students Function");
        prepareStudents();
    });
    cron.schedule("1 6 * * *", () => {
        console.log("Running Daily Stageing Function");
        stageDaily();
    });
    //cron.schedule("*/1 * * * *", () => {
    //    console.log("Running scheduled task");
    //});
};
