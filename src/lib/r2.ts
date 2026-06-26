import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const R2_MAX_FILE_SIZE = 15 * 1024 * 1024;
export const R2_ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed"
] as const;

const ALLOWED_CONTENT_TYPE_SET = new Set<string>(R2_ALLOWED_CONTENT_TYPES);
let client: S3Client | undefined;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function r2Client(): S3Client {
  if (client) return client;

  const accountId = required("R2_ACCOUNT_ID");
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY")
    },
    // Keep presigned browser uploads compatible with R2 instead of adding
    // SDK-managed checksum query parameters for an empty request body.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED"
  });

  return client;
}

function bucket(): string {
  return required("R2_BUCKET_NAME");
}

export function isAllowedR2ContentType(contentType: string): boolean {
  return ALLOWED_CONTENT_TYPE_SET.has(contentType.toLowerCase());
}

export function normalizeR2ContentType(fileName: string, reportedType: string): string {
  const type = reportedType.trim().toLowerCase();
  if (isAllowedR2ContentType(type)) return type;

  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith(".zip") && (!type || type === "application/octet-stream")) return "application/zip";
  if (lowerName.endsWith(".txt") && (!type || type === "application/octet-stream")) return "text/plain";

  return type;
}

export function sanitizeR2FileName(fileName: string): string {
  const cleaned = fileName
    .normalize("NFKC")
    .replace(/[\\/\0\r\n]/g, "-")
    .replace(/[^a-zA-Z0-9._()\- ]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

  return cleaned || "attachment";
}

function contentDisposition(fileName: string, contentType: string): string {
  const safeName = sanitizeR2FileName(fileName).replace(/["\\]/g, "-");
  const inline = contentType.startsWith("image/") || contentType === "application/pdf" || contentType.startsWith("text/");
  return `${inline ? "inline" : "attachment"}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`;
}

export function userOwnsR2Key(objectKey: string, userId: string): boolean {
  return objectKey.startsWith(`drops/${userId}/`) && !objectKey.includes("..") && objectKey.length <= 420;
}

export async function createR2Upload(input: {
  userId: string;
  fileName: string;
  contentType: string;
}) {
  const safeName = sanitizeR2FileName(input.fileName);
  const objectKey = `drops/${input.userId}/${crypto.randomUUID()}/${safeName}`;
  const disposition = contentDisposition(safeName, input.contentType);

  const uploadUrl = await getSignedUrl(
    r2Client(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: objectKey,
      ContentType: input.contentType,
      ContentDisposition: disposition
    }),
    {
      expiresIn: 120,
      signableHeaders: new Set(["content-type", "content-disposition"])
    }
  );

  return {
    uploadUrl,
    objectKey,
    headers: {
      "Content-Type": input.contentType,
      "Content-Disposition": disposition
    }
  };
}

export async function inspectR2Object(objectKey: string) {
  return r2Client().send(
    new HeadObjectCommand({
      Bucket: bucket(),
      Key: objectKey
    })
  );
}

export async function deleteR2Object(objectKey: string): Promise<void> {
  await r2Client().send(
    new DeleteObjectCommand({
      Bucket: bucket(),
      Key: objectKey
    })
  );
}

export async function createR2DownloadUrl(objectKey: string): Promise<string> {
  return getSignedUrl(
    r2Client(),
    new GetObjectCommand({ Bucket: bucket(), Key: objectKey }),
    { expiresIn: 60 }
  );
}
