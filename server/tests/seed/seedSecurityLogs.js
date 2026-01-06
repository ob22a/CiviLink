import SecurityLog from "../../src/models/SecurityLog.js";
import { faker } from "@faker-js/faker";

// Configuration
const ATTEMPT_TYPES = [
  "LOGIN_FAILED",
  "LOGIN_SUCCESS",
  "PASSWORD_RESET",
  "ACCOUNT_LOCKED",
  "SUSPICIOUS_ACTIVITY",
];
const DEPARTMENTS = [
  "approver",
  "customer_support",
  "admin",
  "supervisor",
  "field_officer",
];
const SUBCITIES = [
  "Kolfe Keranio",
  "Nefas Silk Lafto",
  "Yeka",
  "Bole",
  "Addis Ketema",
  "Lideta",
  "Kirkos",
];
const IP_RANGES = [
  "192.168.1.",
  "10.0.0.",
  "172.16.0.",
  "203.0.113.",
  "198.51.100.",
];
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Android 11; Mobile; rv:91.0) Gecko/91.0 Firefox/91.0",
  "Chrome/91.0.4472.124 Safari/537.36",
  "PostmanRuntime/7.28.0",
];

const generateOfficerName = () => {
  const firstNames = [
    "Abebe",
    "Mekdes",
    "Tewodros",
    "Selamawit",
    "Girma",
    "Hirut",
    "Kassahun",
    "Zewditu",
    "Yohannes",
    "Mulu",
  ];
  const lastNames = [
    "Tesfaye",
    "Getachew",
    "Kebede",
    "Assefa",
    "Mengesha",
    "Alemu",
    "Gebre",
    "Wolde",
    "Hailu",
    "Tadesse",
  ];
  return `${faker.helpers.arrayElement(
    firstNames
  )} ${faker.helpers.arrayElement(lastNames)}`;
};

// Generate realistic details based on attempt type
const generateDetails = (attemptType, officerName, department) => {
  const details = new Map();

  switch (attemptType) {
    case "LOGIN_FAILED":
      details.set(
        "reason",
        faker.helpers.arrayElement([
          "Invalid password",
          "User not found",
          "Account disabled",
          "Expired password",
          "Incorrect security answer",
        ])
      );
      details.set("attempts_before_lock", faker.number.int({ min: 1, max: 5 }));
      details.set("department", department);
      details.set("location", faker.helpers.arrayElement(SUBCITIES));
      break;

    case "LOGIN_SUCCESS":
      details.set(
        "session_duration",
        `${faker.number.int({ min: 30, max: 180 })} minutes`
      );
      details.set(
        "device_type",
        faker.helpers.arrayElement([
          "Desktop",
          "Mobile",
          "Tablet",
          "Department Laptop",
        ])
      );
      details.set(
        "location",
        faker.helpers.arrayElement([
          "HQ",
          "Field Office",
          "Remote",
          "Patrol Car",
          "Home",
        ])
      );
      details.set("department", department);
      details.set(
        "browser",
        faker.helpers.arrayElement(["Chrome", "Firefox", "Safari", "Edge"])
      );
      break;

    case "PASSWORD_RESET":
      details.set(
        "reset_method",
        faker.helpers.arrayElement([
          "Email",
          "SMS",
          "Security Questions",
          "Admin Assisted",
        ])
      );
      details.set(
        "initiated_by",
        faker.helpers.arrayElement(["User", "Admin", "System"])
      );
      details.set("reset_successful", faker.datatype.boolean());
      details.set("department", department);
      details.set(
        "reason",
        faker.helpers.arrayElement([
          "Forgot password",
          "Security update",
          "Suspicious activity",
        ])
      );
      break;

    case "ACCOUNT_LOCKED":
      details.set(
        "lock_reason",
        faker.helpers.arrayElement([
          "Too many failed attempts",
          "Suspicious activity",
          "Admin request",
          "Policy violation",
          "Inactivity period",
        ])
      );
      details.set(
        "locked_by",
        faker.helpers.arrayElement(["System", "Admin", "Automated Policy"])
      );
      details.set(
        "lock_duration",
        faker.helpers.arrayElement([
          "1 hour",
          "24 hours",
          "Until admin review",
          "Permanent",
        ])
      );
      details.set("department", department);
      details.set(
        "unlock_method",
        faker.helpers.arrayElement([
          "Automatic",
          "Admin manual",
          "Contact support",
        ])
      );
      break;

    case "SUSPICIOUS_ACTIVITY":
      details.set(
        "suspected_reason",
        faker.helpers.arrayElement([
          "Multiple IP addresses",
          "Unusual login time",
          "Geographic anomaly",
          "Brute force detected",
          "Unknown device",
          "Multiple failed attempts",
        ])
      );
      details.set(
        "action_taken",
        faker.helpers.arrayElement([
          "Account temporarily locked",
          "Password reset required",
          "Admin notified",
          "Investigation started",
          "No action - monitored",
        ])
      );
      details.set(
        "risk_level",
        faker.helpers.arrayElement(["Low", "Medium", "High", "Critical"])
      );
      details.set("department", department);
      details.set(
        "flagged_by",
        faker.helpers.arrayElement(["System", "Security Team", "Supervisor"])
      );
      break;
  }

  details.set("logged_at", new Date().toISOString());
  details.set("officer", officerName);
  details.set("timestamp", Date.now());

  return details;
};

// Generate IP address
const generateIpAddress = () => {
  const base = faker.helpers.arrayElement(IP_RANGES);
  const lastOctet = faker.number.int({ min: 1, max: 254 });
  return `${base}${lastOctet}`;
};

// Generate a single security log
const generateSecurityLog = () => {
  const officerName = generateOfficerName();
  const department = faker.helpers.arrayElement(DEPARTMENTS);
  const subcity = faker.helpers.arrayElement(SUBCITIES);
  const attemptType = faker.helpers.arrayElement(ATTEMPT_TYPES);

  // Determine success based on attempt type
  const success =
    attemptType === "LOGIN_SUCCESS" || attemptType === "PASSWORD_RESET";

  // Generate timestamp within last 30 days (weighted toward recent)
  const daysAgo = Math.pow(faker.number.float({ min: 0, max: 1 }), 2) * 30;
  const timeOfAttempt = new Date();
  timeOfAttempt.setDate(timeOfAttempt.getDate() - daysAgo);
  timeOfAttempt.setHours(faker.number.int({ min: 0, max: 23 }));
  timeOfAttempt.setMinutes(faker.number.int({ min: 0, max: 59 }));
  timeOfAttempt.setSeconds(faker.number.int({ min: 0, max: 59 }));

  return {
    attemptType,
    count: faker.number.int({ min: 1, max: 5 }),
    officerName: `${officerName} - ${department} (${subcity})`,
    success,
    timeOfAttempt,
    ipAddress: generateIpAddress(),
    userAgent: faker.helpers.arrayElement(USER_AGENTS),
    details: generateDetails(attemptType, officerName, department),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Main seed function
export async function seedSecurityLogs(count = 50) {
  console.log(`Seeding ${count} security logs...`);

  try {
    // Clear existing security logs
    const deletedCount = await SecurityLog.deleteMany({});
    console.log(`Cleared ${deletedCount.deletedCount} existing security logs`);

    // Generate logs
    const logs = [];
    for (let i = 0; i < count; i++) {
      logs.push(generateSecurityLog());

      // Show progress for large seeding
      if (count > 100 && i % 25 === 0) {
        console.log(`   Generated ${i}/${count} logs...`);
      }
    }

    // Insert all logs
    const result = await SecurityLog.insertMany(logs);
    console.log(`Successfully seeded ${result.length} security logs`);

    // Generate debug report
    await generateDebugReport();
  } catch (error) {
    console.error("Error seeding security logs:", error.message);
    throw error;
  }
}

// Generate debug report
async function generateDebugReport() {
  try {
    const total = await SecurityLog.countDocuments();

    const summary = await SecurityLog.aggregate([
      {
        $group: {
          _id: "$attemptType",
          count: { $sum: 1 },
          totalAttempts: { $sum: "$count" },
          successRate: {
            $avg: {
              $cond: [{ $eq: ["$success", true] }, 1, 0],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const timeStats = await SecurityLog.aggregate([
      {
        $group: {
          _id: null,
          earliest: { $min: "$timeOfAttempt" },
          latest: { $max: "$timeOfAttempt" },
        },
      },
    ]);

    console.log("\nSECURITY LOGS DEBUG REPORT");
    console.log("=".repeat(40));
    console.log(`Total Records: ${total}`);

    if (timeStats.length > 0) {
      const { earliest, latest } = timeStats[0];
      console.log(
        `Time Range: ${earliest.toLocaleString()} - ${latest.toLocaleString()}`
      );
    }

    console.log("\nBreakdown by Attempt Type:");
    summary.forEach((item) => {
      const percentage = ((item.count / total) * 100).toFixed(1);
      const successPercent = (item.successRate * 100).toFixed(1);
      console.log(`  ${item._id}:`);
      console.log(`    Records: ${item.count} (${percentage}%)`);
      console.log(`    Total Attempts: ${item.totalAttempts}`);
      console.log(`    Success Rate: ${successPercent}%`);
    });

    // Check for suspicious activities
    const suspicious = await SecurityLog.countDocuments({
      attemptType: "SUSPICIOUS_ACTIVITY",
    });
    if (suspicious > 0) {
      console.log(`\n  ${suspicious} suspicious activities logged`);
    }

    console.log("=".repeat(40));
  } catch (error) {
    console.log("Could not generate debug report:", error.message);
  }
}

// Clear function
export async function clearSecurityLogs() {
  console.log("Clearing all security logs...");

  try {
    const result = await SecurityLog.deleteMany({});
    console.log(`Cleared ${result.deletedCount} security logs`);
    return result;
  } catch (error) {
    console.error("Error clearing security logs:", error.message);
    throw error;
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import("dotenv/config").then(async () => {
    const count = process.argv[2] ? parseInt(process.argv[2]) : 50;
    await seedSecurityLogs(count);
  });
}
