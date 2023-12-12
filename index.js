const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

async function fetchData(pageIndex, startIndex) {
    const url = `https://member.restaurantdepot.com/products?sort=saleranking&it=product&pg=${pageIndex}`;

    const axiosOptions = {
        method: "GET",
        url,
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.9",
            Connection: "keep-alive",
            Host: "member.restaurantdepot.com",
            "Sec-Ch-Ua":
                '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
            "Sec-Ch-Ua-Mobile": "?0",
            Cookie: "recent-searches=; _gcl_au=1.1.692704160.1701710724; _hjSessionUser_309519=eyJpZCI6ImI2NjdmMDViLTBlZTUtNTEzOC05ZTQ5LTZlOWJjYWRhM2NlNSIsImNyZWF0ZWQiOjE3MDE3MTA3Mjg2NjMsImV4aXN0aW5nIjp0cnVlfQ==; visitor_id=b63368ae-48a8-4fde-8a41-ccf6d57a8945; show_popup_on_each_config=1; recent-searches=; _hjSessionUser_2604200=eyJpZCI6ImQ5N2UxODM3LTE5NTQtNTJjZC05YWQ3LWFlZjhlM2FiMmQzNiIsImNyZWF0ZWQiOjE3MDE3NTUyODczNjksImV4aXN0aW5nIjp0cnVlfQ==; _ga=GA1.1.1060584542.1701710729; form_key=cifi108thaQuS3Ih; cf_clearance=EYY7Gmw6_PQARW6E5KHZ8psh.vcLrJi4m3ccLd9uTJc-1701921700-0-1-10b1f9e2.dfc8449a.47b0a602-0.2.1701921700; _ga_70VZ0DB5RR=GS1.1.1701921539.10.0.1701921543.56.0.0; visit_id=d3ff3546-c49c-492a-92bd-83d1946c24ea; PHPSESSID=d88pt2d36ugh4vjfjlgt261692; form_key=cifi108thaQuS3Ih; X-Magento-Vary=cc2fd541068573ac69c0e59758587b7295c8e26edcdb0cd35acbf248dd02b374; mage-banners-cache-storage={}; private_content_version=c38e54fffef7bb95555e55e828b0c292; mage-cache-storage={}; mage-cache-storage-section-invalidation={}; mage-cache-sessid=true; mage-messages=; recently_viewed_product={}; recently_viewed_product_previous={}; recently_compared_product={}; recently_compared_product_previous={}; product_data_storage={}; _ga_ZL7BZWFRT0=GS1.1.1701921544.13.1.1701929087.0.0.0; ADRUM_BT=R%3A0%7Cg%3A382f5922-b55b-4f78-be6c-eda62fb616b255%7Cn%3AAmericaneagle_b8876459-64ab-4aef-936e-4c4802b54d5e%7Cd%3A2161%7Cs%3Af%7Ce%3A1979",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        },
        withCredentials: true,
    };
    try {
        const response = await axios(axiosOptions);
        const $ = cheerio.load(response.data);
        const htmlContent = $(".products-list").html();

        fs.writeFile("output.html", htmlContent, (err) => {
            if (err) throw err;
            console.log("The file has been saved!");
        });
        const products = [];

        $(".products-list .product-item").each((index, element) => {
            const $element = $(element);

            const name = $element.find('h2[class*="item-name"]').text().trim();
            const category = $element.find(".category-name").text().trim();
            const imageSrc = $element.find(".product-image-photo").attr("src");
            const itemNumber = $element
                .find('span[id^="item_code_"]')
                .text()
                .trim();
            const upcRawText = $element
                .find("li")
                .filter(function () {
                    return $(this).children("strong").text().trim() === "UPC:";
                })
                .text()
                .trim();
            const upc = upcRawText.replace("UPC:", "").trim();
            const bin = $element.find('span[id^="bin_"]').text().trim();

            const unitsPerCaseRawText = $element
                .find("li")
                .filter(function () {
                    return $(this).find("strong").text().trim().includes("per");
                })
                .text()
                .trim();

            const unitsPerCaseMatch = unitsPerCaseRawText.match(
                /Units per\s+case:\s*(\d+)/i
            );

            const unitsPerCase = unitsPerCaseMatch
                ? parseInt(unitsPerCaseMatch[1], 10)
                : undefined;

            const averageUnitWeightRawText = $element
                .find("li")
                .filter(function () {
                    return $(this)
                        .find("strong")
                        .text()
                        .trim()
                        .includes("Average unit weight:");
                })
                .text()
                .trim();
            const averageCaseWeightRawText = $element
                .find("li")
                .filter(function () {
                    return $(this)
                        .find("strong")
                        .text()
                        .trim()
                        .includes("Average case weight:");
                })
                .text()
                .trim();

            const averageUnitWeightMatch =
                averageUnitWeightRawText.match(/(\d+(?:\.\d+)?)\s*lb/i);
            const averageCaseWeightMatch = averageCaseWeightRawText.match(
                /(\d+(?:\.\d+)?)\s*lbs?/i
            );

            const averageUnitWeight = averageUnitWeightMatch
                ? parseFloat(averageUnitWeightMatch[1])
                : undefined;
            const averageCaseWeight = averageCaseWeightMatch
                ? parseFloat(averageCaseWeightMatch[1])
                : undefined;

            const onSale =
                $element.find(".flag-col ul li.flag-on-sale").length > 0;

            let price, unitPrice, casePrice;

            const $select = $element.find(".product-package-select");
            if ($select.length) {
                $select.find("option").each((index, option) => {
                    const optionText = $(option).text().trim();
                    const valueMatch = optionText.match(/\$(\d+\.\d+)/);
                    if (valueMatch && valueMatch[1]) {
                        if (optionText.toLowerCase().includes("unit")) {
                            unitPrice = valueMatch[1];
                        } else if (optionText.toLowerCase().includes("case")) {
                            casePrice = valueMatch[1];
                        }
                    }
                });
            } else {
                price = $element.find(".select-price").data("item-price");
                price = price ? price.replace(/^[\$\£\€]/, "").trim() : "";
                unitPrice = undefined;
                casePrice = undefined;
            }

            let volumePriceText;

            if ($element.find(".volume-price").length > 0) {
                const volumePriceRawText = $element
                    .find(".volume-price")
                    .text()
                    .trim();

                volumePriceText = volumePriceRawText
                    .replace(/\s+/g, " ")
                    .trim();
            } else {
                volumePriceText = undefined;
            }

            const product = {
                no: startIndex + index,
                name,
                category,
                imageSrc,
                itemNumber,
                upc,
                bin,
                price,
                unitPrice,
                casePrice,
                unitsPerCase,
                averageUnitWeight,
                averageCaseWeight,
                onSale,
                volumePriceText,
            };
            products.push(product);
        });

        return products;
    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetchAllData() {
    const allProducts = []; // An array to hold products from all pages
    let productIndex = 1;

    for (let i = 1; i <= 357; i++) {
        try {
            const productsFromPage = await fetchData(i, productIndex);
            allProducts.push(...productsFromPage); // Spread and add each product to allProducts
            productIndex += productsFromPage.length;

            console.log(`Processed page ${i}`);
        } catch (error) {
            console.error(`Error processing page ${i}: ${error}`);
        }
    }

    fs.writeFile(
        "allProductsOutput.json",
        JSON.stringify(allProducts, null, 4),
        (err) => {
            if (err) {
                console.log(`Error writing file: ${err}`);
            } else {
                console.log(
                    "All products data has been written to file successfully."
                );
            }
        }
    );
}

fetchAllData();
