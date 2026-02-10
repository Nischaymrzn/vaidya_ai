import "dotenv/config";

// Ensure test env vars are available
process.env.NODE_ENV = "test";

const ensureTestDbUri = (uri: string) => {
  try {
    const url = new URL(uri);
    const dbName = url.pathname.replace(/^\//, "");
    const testDbName = dbName ? `${dbName}_test` : "test";
    url.pathname = `/${testDbName}`;
    return url.toString();
  } catch {
    // If parsing fails, fall back to the original URI.
    return uri;
  }
};

if (process.env.MONGODB_URI) {
  process.env.MONGODB_URI = ensureTestDbUri(process.env.MONGODB_URI);
}
