const { getStore } = require("@netlify/blobs");

exports.handler = async function (event) {
  try {
    const key = event.queryStringParameters?.key;
    const filename = event.queryStringParameters?.filename || "payroll.txt";

    if (!key) {
      return {
        statusCode: 400,
        body: "Missing key",
      };
    }

    const store = getStore("payroll-files");
    const file = await store.get(key, { type: "arrayBuffer" });

    if (!file) {
      return {
        statusCode: 404,
        body: "File not found",
      };
    }

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": "text/plain; charset=tis-620",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
      body: Buffer.from(file).toString("base64"),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error instanceof Error ? error.message : String(error),
    };
  }
};
