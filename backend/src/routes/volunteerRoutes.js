"use strict";
const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (function () {
    let ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
const __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const volunteer = __importStar(require("../controllers/volunteerController"));
const VolunteerValidator = __importStar(require("../validators/volunteerValidator"));
const allowedMimeTypes = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"];
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      !allowedMimeTypes.includes(file.mimetype) ||
      node_path_1.default.extname(file.originalname).toLowerCase() !== ".csv"
    ) {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
});
const router = express_1.default.Router();
router.get("/getVolunteerRows", volunteer.getVolunteerRows);
router.post("/getSelectedVolunteers", volunteer.getSelectedVolunteers);
router.get("/:id", volunteer.getVolunteer);
router.get("/", volunteer.getVolunteers);
router.delete("/:id", volunteer.deleteVolunteer);
router.post("/", VolunteerValidator.createVolunteerValidator, volunteer.createVolunteer);
router.put("/:id", VolunteerValidator.updateVolunteerValidator, volunteer.updateVolunteer);
router.put(
  "/contact/:id",
  VolunteerValidator.updateVolunteerContactValidator,
  volunteer.updateVolunteerContact,
);
router.post("/parse-csv", upload.single("csv"), volunteer.parseVolunteersCsv);
router.post(
  "/batch",
  VolunteerValidator.batchCreateVolunteerValidator,
  volunteer.uploadVolunteerBatch,
);
exports.default = router;
