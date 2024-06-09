// get qotd page
import { Client, iteratePaginatedAPI } from "@notionhq/client";
import fs from "fs";
import env from "dotenv";
env.config();
const pageId = process.env.notion_page_id;
const apiKey = process.env.notion_secret;

const notion = new Client({ auth: apiKey });

const getPlainTextFromRichText = (richText) => {
  return richText.map((t) => t.plain_text).join("");
};
env.secret;

// Use the source URL and optional caption from media blocks (file, video, etc.)
const getMediaSourceText = (block) => {
  let source, caption;

  if (block[block.type].external) {
    source = block[block.type].external.url;
  } else if (block[block.type].file) {
    source = block[block.type].file.url;
  } else if (block[block.type].url) {
    source = block[block.type].url;
  } else {
    source = "[Missing case for media block types]: " + block.type;
  }
  // If there's a caption, return it with the source
  if (block[block.type].caption.length) {
    caption = getPlainTextFromRichText(block[block.type].caption);
    return caption + ": " + source;
  }
  // If no caption, just return the source URL
  return source;
};

// Get the plain text from any block type supported by the public API.
const getTextFromBlock = (block) => {
  let text;

  // Get rich text from blocks that support it
  if (block[block.type].rich_text) {
    // This will be an empty string if it's an empty line.
    text = getPlainTextFromRichText(block[block.type].rich_text);
    // text = block[block.type].rich_text;
  }
  // Get text for block types that don't have rich text
  else {
    switch (block.type) {
      case "unsupported":
        // The public API does not support all block types yet
        text = "[Unsupported block type]";
        break;
      case "bookmark":
        text = block.bookmark.url;
        break;
      case "child_database":
        text = block.child_database.title;
        // Use "Query a database" endpoint to get db rows: https://developers.notion.com/reference/post-database-query
        // Use "Retrieve a database" endpoint to get additional properties: https://developers.notion.com/reference/retrieve-a-database
        break;
      case "child_page":
        text = block.child_page.title;
        break;
      case "embed":
      case "video":
      case "file":
      case "image":
      case "pdf":
        text = getMediaSourceText(block);
        break;
      case "equation":
        text = block.equation.expression;
        break;
      case "link_preview":
        text = block.link_preview.url;
        break;
      case "synced_block":
        // Provides ID for block it's synced with.
        text = block.synced_block.synced_from
          ? "This block is synced with a block with the following ID: " +
            block.synced_block.synced_from[block.synced_block.synced_from.type]
          : "Source sync block that another blocked is synced with.";
        break;
      case "table":
        // Only contains table properties.
        // Fetch children blocks for more details.
        text = "Table width: " + block.table.table_width;
        break;
      case "table_of_contents":
        // Does not include text from ToC; just the color
        text = "ToC color: " + block.table_of_contents.color;
        break;
      case "breadcrumb":
      case "column_list":
      case "divider":
        text = "No text available";
        break;
      default:
        text = "[Needs case added]";
        break;
    }
  }
  // Blocks with the has_children property will require fetching the child blocks. (Not included in this example.)
  // e.g. nested bulleted lists
  if (block.has_children) {
    // For now, we'll just flag there are children blocks.
    text = text + " (Has children)";
  }
  // Includes block type for readability. Update formatting as needed.
  return text;
};

async function retrieveBlocksAboveDivider(id) {
  console.log("Retrieving blocks (async)...");
  const blocks = [];

  // Use iteratePaginatedAPI helper function to get all blocks first-level blocks on the page
  for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
    block_id: id, // A page ID can be passed as a block ID: https://developers.notion.com/docs/working-with-page-content#modeling-content-as-blocks
  })) {
    if (block.type !== "divider" && block.type !== "paragraph") {
      blocks.push(block);
    } else {
      return blocks;
    }
  }

  return blocks;
}

const blocksToTextArray = (blocks) => {
  const textArray = [];
  for (let i = 0; i < blocks.length; i++) {
    const text = getTextFromBlock(blocks[i]);
    textArray.push(text);
  }
  return textArray;
};

const splitQuote = (text) => {
  // text is in the form of "quote" - author
  const split = text.split("-");
  if (split.length < 2) {
    return { quote: text, author: "" };
  }
  const author = text.split("-")[split.length - 1];
  //   quote is all the stuff before the author; it may be multiple elements
  const quote = text
    .split("-")
    .slice(0, split.length - 1)
    .join("-")
    .trim();
  // remove trailing whitespace from quote
  //   quote.trim();
  return { quote, author };
};

const splitArray = (textArray) => {
  const quotesAndAuthors = [];
  for (let i = 0; i < textArray.length; i++) {
    const { quote, author } = splitQuote(textArray[i]);
    quotesAndAuthors.push({ quote, author });
  }
  return quotesAndAuthors;
};

async function main() {
  const blocks = await retrieveBlocksAboveDivider(pageId);
  const textArray = blocksToTextArray(blocks);
  const quotesAndAuthors = splitArray(textArray);

  fs.writeFile(
    "src/data/qotd.json",
    JSON.stringify(quotesAndAuthors),
    (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    }
  );
}

main();
