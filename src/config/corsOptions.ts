import { CorsOptions } from "cors";
import { ServerOptions as SocketIOServerOptions } from "socket.io";
const allowedIPs = [
  process.env.ADMIN_DASHBOARD_DOMAIN,
  process.env.PLAYSTORE_APK_APP_IP,
  process.env.APPSTORE_APK_APP_IP,
];

// server cor option
export const serverCorsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const requestIP = origin; // For testing, you may also use `req.connection.remoteAddress` to get the IP.
    // Allow all origins in development
    if (process.env.NODE_ENV === "development") {
      callback(null, true); // Allow all origins in development
    } else if (process.env.NODE_ENV === "production") {
      // Mobile apps often send no origin or null
      if (!origin || origin === "null") {
        console.log("Mobile app or direct request detected (no origin)");
        return callback(null, true); // Allow mobile apps
      }

      if (allowedIPs.includes(requestIP)) {
        callback(null, true); // If the request comes from an allowed IP, allow it
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers in requests
  credentials: true, // Allow cookies and credentials
};

//soket cors option
export const soketCorsOption:Partial<SocketIOServerOptions["cors"]> = {
  origin: (origin, callback) => {
   const requestIP = origin; // For testing, you may also use `req.connection.remoteAddress` to get the IP.
    // Allow all origins in development
    if (process.env.NODE_ENV === "development") {
      callback(null, true); // Allow all origins in development
    } else if (process.env.NODE_ENV === "production") {
      // Mobile apps often send no origin or null
      if (!origin || origin === "null") {
        console.log("Mobile app or direct request detected (no origin)");
        return callback(null, true); // Allow mobile apps
      }

      if (allowedIPs.includes(requestIP)) {
        callback(null, true); // If the request comes from an allowed IP, allow it
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  methods: ["GET", "POST"], // Allowed HTTP methods for WebSocket
  credentials: true, // Allow credentials (cookies)
};

