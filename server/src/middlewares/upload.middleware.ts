import multer from "multer";

const storage = multer.memoryStorage();
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  // Accept images only
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"));
  }
  cb(null, true);
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const docFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const isImage = file.mimetype.startsWith("image/");
  const isPdf = file.mimetype === "application/pdf";
  if (!isImage && !isPdf) {
    return cb(new Error("Only image or PDF files are allowed!"));
  }
  cb(null, true);
};

const docUpload = multer({
  storage: storage,
  fileFilter: docFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploads = {
  single: (fieldName: string) => upload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    upload.array(fieldName, maxCount),
  fields: (fieldsArray: { name: string; maxCount?: number }[]) =>
    upload.fields(fieldsArray),
};

export const uploadsDocs = {
  single: (fieldName: string) => docUpload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    docUpload.array(fieldName, maxCount),
  fields: (fieldsArray: { name: string; maxCount?: number }[]) =>
    docUpload.fields(fieldsArray),
};
