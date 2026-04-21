const { getStore } = require("@netlify/blobs");
const iconv = require("iconv-lite");
const crypto = require("crypto");

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method not allowed",
      };
    }

    const { filename, content } = JSON.parse(event.body || "{}");

    if (!filename || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "filename and content are required" }),
      };
    }

    const tis620Buffer = iconv.encode(content, "tis620");

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const id = crypto.randomUUID();
    const key = `payroll/${id}-${safeName}`;

    const store = getStore("payroll-files");
    await store.set(key, tis620Buffer, {
      metadata: {
        filename: safeName,
        encoding: "tis620",
        contentType: "text/plain",
      },
    });

    const siteUrl =
      process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;

    const fileUrl = `${siteUrl}/.netlify/functions/download?key=${encodeURIComponent(
      key
    )}&filename=${encodeURIComponent(safeName)}`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ok: true,
        fileUrl,
        key,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
