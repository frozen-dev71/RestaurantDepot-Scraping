const fs = require("fs");
const { Parser } = require("json2csv");

const inputJsonPath = "./allProductsOutput.json";
const outputPath = "./output.csv";

fs.readFile(inputJsonPath, "utf8", (err, data) => {
    if (err) {
        console.error("An error occurred while reading the JSON file:", err);
        return;
    }
    const jsonArray = JSON.parse(data);

    // Collect all unique field names in the JSON array
    const fields = jsonArray.reduce((acc, item) => {
        Object.keys(item).forEach((key) => {
            if (!acc.includes(key)) {
                acc.push(key);
            }
        });
        return acc;
    }, []);

    // Move 'onSale' and 'volumePriceText' to the end of the fields array if they exist
    const desiredLastFields = ["onSale", "volumePriceText"];
    desiredLastFields.forEach((field) => {
        const index = fields.indexOf(field);
        if (index > -1) {
            fields.splice(index, 1); // Remove from its current position
            fields.push(field); // Add it to the end
        }
    });

    try {
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(jsonArray);

        // Write the CSV data to the output file
        fs.writeFile(outputPath, csv, (writeErr) => {
            if (writeErr) {
                console.error(
                    "An error occurred while writing CSV to file:",
                    writeErr
                );
                return;
            }
            console.log(`CSV file has been saved to ${outputPath}`);
        });
    } catch (parseErr) {
        console.error(
            "An error occurred during the JSON parsing to CSV:",
            parseErr
        );
    }
});
