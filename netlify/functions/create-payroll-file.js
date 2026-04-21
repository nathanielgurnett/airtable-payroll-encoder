const iconv = require("iconv-lite");

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "filename and content are required",
        }),
      };
    }

    const tis620Buffer = iconv.encode(content, "tis620");

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": "text/plain; charset=tis-620",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
      body: tis620Buffer.toString("base64"),
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
